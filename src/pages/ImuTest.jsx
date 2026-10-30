import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Wifi,
  WifiOff,
  Cpu,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Send,
  RefreshCw,
  Compass,
  ArrowUpRight,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import {
  subscribeToImuTest,
  subscribeToFirebaseConnection,
  sendManualImuTestData,
  IMU_TEST_PATH,
} from '../services/imuTestService';
import { processGpsPayload } from '../services/gpsTestService';

const STALE_THRESHOLD_MS = 6000; // If no update in 6s, mark as stale

export default function ImuTest() {
  const [data, setData] = useState(null);
  const [rawPayload, setRawPayload] = useState(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [listenerError, setListenerError] = useState(null);
  const [lastPacketReceivedAt, setLastPacketReceivedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [showRawJson, setShowRawJson] = useState(false);
  const [showRawNmea, setShowRawNmea] = useState(false);
  const [isSendingSample, setIsSendingSample] = useState(false);
  const [sampleFeedback, setSampleFeedback] = useState(null);

  // Packet frequency calculation
  const packetTimestampsRef = useRef([]);
  const [frequencyHz, setFrequencyHz] = useState(null);

  // Periodically update current time to refresh relative age & stale status
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to Firebase Realtime Database connection status (.info/connected)
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseConnection((connected) => {
      setIsFirebaseConnected(connected);
    });
    return () => unsubscribe();
  }, []);

  // Listen to /imuTest/latest
  useEffect(() => {
    setListenerError(null);

    const unsubscribe = subscribeToImuTest(
      (parsedData, raw) => {
        const currentTime = Date.now();
        setData(parsedData);
        setRawPayload(raw);
        setLastPacketReceivedAt(currentTime);

        // Track frequency over last 5 packets
        if (parsedData) {
          const timestamps = packetTimestampsRef.current;
          timestamps.push(currentTime);
          if (timestamps.length > 5) {
            timestamps.shift();
          }
          if (timestamps.length >= 2) {
            const deltaMs = (timestamps[timestamps.length - 1] - timestamps[0]) / (timestamps.length - 1);
            if (deltaMs > 0) {
              const hz = Number((1000 / deltaMs).toFixed(1));
              setFrequencyHz(hz);
            }
          }
        }
      },
      (err) => {
        setListenerError(err?.message || 'Failed to connect to IMU test path');
      }
    );

    return () => unsubscribe();
  }, []);

  // Calculate packet freshness
  const timeSinceLastPacketMs = lastPacketReceivedAt ? now - lastPacketReceivedAt : null;
  const isStale = timeSinceLastPacketMs !== null && timeSinceLastPacketMs > STALE_THRESHOLD_MS;

  // Format timestamp helper
  const formattedTimestamp = useMemo(() => {
    if (!data?.timestamp) return null;
    try {
      const date = typeof data.timestamp === 'number'
        ? new Date(data.timestamp)
        : new Date(String(data.timestamp));
      return isNaN(date.getTime()) ? String(data.timestamp) : date.toLocaleTimeString() + `.${String(date.getMilliseconds()).padStart(3, '0')}`;
    } catch {
      return String(data.timestamp);
    }
  }, [data?.timestamp]);

  // Parse GPS NMEA data from the live payload
  const gpsResult = useMemo(() => {
    if (!data?.gps) return null;
    return processGpsPayload(data.gps);
  }, [data?.gps]);

  const rawNmea = data?.gps?.nmea || null;
  const hasGpsData = rawNmea !== null && rawNmea !== '';

  // Handler to push test packet manually for integration test validation
  const handleSendTestSample = async () => {
    setIsSendingSample(true);
    setSampleFeedback(null);
    try {
      await sendManualImuTestData({
        deviceId: 'SIM-HARDWARE-01',
        timestamp: Date.now(),
        accelerometer: {
          x: Number((Math.random() * 2 - 1).toFixed(3)),
          y: Number((Math.random() * 2 - 1).toFixed(3)),
          z: Number((9.8 + (Math.random() * 0.4 - 0.2)).toFixed(3)),
        },
        gyroscope: {
          x: Number((Math.random() * 0.2 - 0.1).toFixed(3)),
          y: Number((Math.random() * 0.2 - 0.1).toFixed(3)),
          z: Number((Math.random() * 0.2 - 0.1).toFixed(3)),
        },
        gps: {
          nmea: '$GPGGA,123519,1904.1234,N,07252.5678,E,1,08,0.9,10.0,M,0.0,M,,*49',
        },
      });
      setSampleFeedback('Sample frame sent to Firebase successfully!');
      setTimeout(() => setSampleFeedback(null), 3000);
    } catch (err) {
      setSampleFeedback(`Send failed: ${err.message}`);
    } finally {
      setIsSendingSample(false);
    }
  };

  // Helper to format sensor coordinate safely without inventing units
  const formatSensorValue = (val) => {
    if (val === null || val === undefined) {
      return <span className="text-slate-400 font-mono italic">null</span>;
    }
    if (typeof val === 'number') {
      return <span className="font-mono font-bold text-slate-800 tracking-tight">{val.toFixed(3)}</span>;
    }
    return <span className="font-mono font-bold text-slate-800">{String(val)}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Hardware Flow Diagram */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider">
                Phase 1 Hardware Integration
              </span>
              <span className="text-xs text-slate-400 font-mono">Path: /{IMU_TEST_PATH}</span>
            </div>
            <h1 className="text-2xl font-bold mt-2 text-white flex items-center gap-2">
              IMU Sensor Hardware-to-Cloud Test
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Live display of uncalibrated accelerometer & gyroscope readings received from STM32 NUCLEO-L4R5ZI & ESP32 via Firebase Realtime Database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSendTestSample}
              disabled={isSendingSample}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
              title="Push sample packet directly to /imuTest/latest to test without physical hardware"
            >
              <Send className="w-3.5 h-3.5" />
              {isSendingSample ? 'Pushed...' : 'Send Test Frame'}
            </button>

            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium text-xs transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              {showRawJson ? 'Hide Raw JSON' : 'View Raw JSON'}
            </button>
          </div>
        </div>

        {sampleFeedback && (
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium inline-flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {sampleFeedback}
          </div>
        )}

        {/* Integration pipeline visualizer */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 hidden sm:flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>IMU Sensor</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 rotate-45" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>STM32 NUCLEO</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 rotate-45" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span>ESP32 Wi-Fi</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 rotate-45" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Firebase RTDB</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 rotate-45" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white font-medium">React Client (This Page)</span>
          </div>
        </div>
      </div>

      {/* Connection & Reception Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Firebase Connection Card */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isFirebaseConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {isFirebaseConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Firebase Cloud Status
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 pulse-dot' : 'bg-red-500'}`} />
              <p className="text-sm font-bold text-slate-800">
                {isFirebaseConnected ? 'Connected (Live RTDB)' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>

        {/* Hardware Transmission Status */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            !data
              ? 'bg-amber-50 text-amber-600'
              : isStale
              ? 'bg-orange-50 text-orange-600'
              : 'bg-blue-50 text-blue-600'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Hardware Stream Status
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {!data ? (
                <span className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Waiting for IMU data...
                </span>
              ) : isStale ? (
                <span className="text-sm font-semibold text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Stale (Hardware idle)
                </span>
              ) : (
                <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
                  Receiving Live Data
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Device ID Card */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Transmitting Device ID
            </p>
            <p className="text-sm font-bold text-slate-800 font-mono mt-0.5 truncate">
              {data?.deviceId ? data.deviceId : <span className="text-slate-400 font-normal italic">None specified</span>}
            </p>
          </div>
        </div>

        {/* Last Packet / Refresh Frequency Card */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Last Update & Rate
            </p>
            <div className="mt-0.5">
              <p className="text-xs font-bold text-slate-800 font-mono truncate">
                {formattedTimestamp || (timeSinceLastPacketMs !== null ? `${Math.round(timeSinceLastPacketMs / 1000)}s ago` : '—')}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {frequencyHz !== null && !isStale ? `Rate: ~${frequencyHz} Hz` : timeSinceLastPacketMs !== null ? `Age: ${(timeSinceLastPacketMs / 1000).toFixed(1)}s` : 'No packets'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Listener Error Alert */}
      {listenerError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold">Firebase Realtime Database Error</p>
            <p className="text-xs text-red-700 mt-0.5">{listenerError}</p>
          </div>
        </div>
      )}

      {/* Main Sensors Section: ACCELEROMETER & GYROSCOPE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ACCELEROMETER SECTION */}
        <div className="rounded-2xl bg-white border border-[#E2E8F0] card-shadow overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">ACCELEROMETER</h2>
                <p className="text-xs text-slate-400 font-medium">Tri-axial raw acceleration values</p>
              </div>
            </div>
            {data?.accelerometer && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 uppercase">
                Active
              </span>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center">
            {!data ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3 animate-pulse">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Waiting for IMU data...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  When the ESP32 pushes sensor readings to <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">/{IMU_TEST_PATH}</code>, they will appear here instantly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {/* X Axis */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center hover:border-blue-300 transition-colors">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-blue-600 text-white mb-2 shadow-sm">
                    X Axis
                  </span>
                  <div className="text-2xl lg:text-3xl font-mono mt-1">
                    {formatSensorValue(data.accelerometer?.x)}
                  </div>
                </div>

                {/* Y Axis */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center hover:border-emerald-300 transition-colors">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-600 text-white mb-2 shadow-sm">
                    Y Axis
                  </span>
                  <div className="text-2xl lg:text-3xl font-mono mt-1">
                    {formatSensorValue(data.accelerometer?.y)}
                  </div>
                </div>

                {/* Z Axis */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center hover:border-indigo-300 transition-colors">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-indigo-600 text-white mb-2 shadow-sm">
                    Z Axis
                  </span>
                  <div className="text-2xl lg:text-3xl font-mono mt-1">
                    {formatSensorValue(data.accelerometer?.z)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Raw uncalibrated values</span>
            <span>No units assumed</span>
          </div>
        </div>

        {/* GYROSCOPE SECTION */}
        <div className="rounded-2xl bg-white border border-[#E2E8F0] card-shadow overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">GYROSCOPE</h2>
                <p className="text-xs text-slate-400 font-medium">Tri-axial raw angular velocity values</p>
              </div>
            </div>
            {data?.gyroscope && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200 uppercase">
                Active
              </span>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center">
            {!data ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3 animate-pulse">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Waiting for IMU data...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Gyroscope data stream will populate automatically once physical packets arrive from ESP32.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {/* X Axis */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center hover:border-purple-300 transition-colors">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-purple-600 text-white mb-2 shadow-sm">
                    X Axis
                  </span>
                  <div className="text-2xl lg:text-3xl font-mono mt-1">
                    {formatSensorValue(data.gyroscope?.x)}
                  </div>
                </div>

                {/* Y Axis */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center hover:border-violet-300 transition-colors">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-violet-600 text-white mb-2 shadow-sm">
                    Y Axis
                  </span>
                  <div className="text-2xl lg:text-3xl font-mono mt-1">
                    {formatSensorValue(data.gyroscope?.y)}
                  </div>
                </div>

                {/* Z Axis */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center hover:border-fuchsia-300 transition-colors">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-fuchsia-600 text-white mb-2 shadow-sm">
                    Z Axis
                  </span>
                  <div className="text-2xl lg:text-3xl font-mono mt-1">
                    {formatSensorValue(data.gyroscope?.z)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Raw uncalibrated values</span>
            <span>No units assumed</span>
          </div>
        </div>
      </div>

      {/* Raw Payload Inspector (Toggled) */}
      {showRawJson && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 card-shadow-lg p-6 text-slate-200 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Raw Firebase RTDB Payload (/{IMU_TEST_PATH})
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {rawPayload ? `${JSON.stringify(rawPayload).length} bytes` : '0 bytes'}
            </span>
          </div>
          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800/80 max-h-72">
            {rawPayload ? JSON.stringify(rawPayload, null, 2) : '// No data currently present at /' + IMU_TEST_PATH}
          </pre>
        </div>
      )}

      {/* GPS COORDINATES SECTION */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] card-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">GPS COORDINATES</h2>
              <p className="text-xs text-slate-400 font-medium">NEO-6M → STM32 → ESP32 → Firebase → NMEA Parser</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* GPS Stream Status Badge */}
            {!hasGpsData ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 uppercase flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Waiting
              </span>
            ) : gpsResult?.hasFix ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                Fix · Live
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                No Fix
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {!hasGpsData ? (
            /* Waiting state — no GPS data from Firebase yet */
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3 animate-pulse">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Waiting for GPS data...</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                GPS data will appear here once the ESP32 pushes an NMEA sentence to <code className="text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">/{IMU_TEST_PATH}/gps/nmea</code>.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* GPS Coordinate + Fix Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* GPS Fix Status */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center hover:border-emerald-300 transition-colors">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-600 text-white mb-2 shadow-sm">
                    GPS Fix
                  </span>
                  <div className="text-xl font-mono font-bold mt-1">
                    {gpsResult === null ? (
                      <span className="text-amber-500">Parse Error</span>
                    ) : gpsResult.hasFix ? (
                      <span className="text-emerald-600">Fix ✓</span>
                    ) : (
                      <span className="text-red-500">No Fix</span>
                    )}
                  </div>
                  {gpsResult?.sentenceType && (
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{gpsResult.sentenceType}</p>
                  )}
                </div>

                {/* Latitude */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center hover:border-blue-300 transition-colors">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-blue-600 text-white mb-2 shadow-sm">
                    Latitude
                  </span>
                  <div className="text-xl lg:text-2xl font-mono font-bold mt-1 text-slate-800">
                    {gpsResult?.hasFix ? (
                      <>{gpsResult.latitude.toFixed(7)}°</>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                  {gpsResult?.hasFix && (
                    <p className="text-[10px] text-slate-400 mt-1">{gpsResult.latitude >= 0 ? 'N' : 'S'}</p>
                  )}
                </div>

                {/* Longitude */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center hover:border-teal-300 transition-colors">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-teal-600 text-white mb-2 shadow-sm">
                    Longitude
                  </span>
                  <div className="text-xl lg:text-2xl font-mono font-bold mt-1 text-slate-800">
                    {gpsResult?.hasFix ? (
                      <>{gpsResult.longitude.toFixed(7)}°</>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                  {gpsResult?.hasFix && (
                    <p className="text-[10px] text-slate-400 mt-1">{gpsResult.longitude >= 0 ? 'E' : 'W'}</p>
                  )}
                </div>
              </div>

              {/* Extra info row (satellites, altitude, speed, utc) */}
              {gpsResult?.hasFix && (
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  {gpsResult.satelliteCount !== undefined && (
                    <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono">
                      Satellites: {gpsResult.satelliteCount}
                    </span>
                  )}
                  {gpsResult.altitude !== undefined && (
                    <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono">
                      Altitude: {gpsResult.altitude}m
                    </span>
                  )}
                  {gpsResult.speedKnots !== undefined && (
                    <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono">
                      Speed: {gpsResult.speedKnots} kn
                    </span>
                  )}
                  {gpsResult.utcTime && (
                    <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono">
                      UTC: {gpsResult.utcTime}
                    </span>
                  )}
                </div>
              )}

              {/* Raw NMEA Debug Area (expandable) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                <button
                  onClick={() => setShowRawNmea(!showRawNmea)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Raw NMEA (Debug)
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showRawNmea ? 'rotate-180' : ''}`} />
                </button>
                {showRawNmea && (
                  <div className="px-4 pb-3">
                    <pre className="bg-slate-900 text-emerald-400 text-xs font-mono p-3 rounded-lg overflow-x-auto border border-slate-800">
                      {rawNmea || '// No NMEA data'}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>NMEA parsed client-side</span>
          <span className="flex items-center gap-1.5">
            GPS Stream:
            {hasGpsData ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                Live
              </span>
            ) : (
              <span className="text-slate-400 font-medium">Waiting</span>
            )}
          </span>
        </div>
      </div>

      {/* ESP32 / STM32 Hardware Verification Guide */}
      <div className="rounded-xl bg-slate-100 border border-slate-200/80 p-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Hardware Integration Notes for Firmware Engineers
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li>
            <strong>ESP32 Target Firebase Path:</strong> Write using HTTP PUT/PATCH or Firebase SDK to <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-800">/imuTest/latest.json</code>.
          </li>
          <li>
            <strong>Data Structure:</strong> Expects JSON object with fields <code className="font-mono text-slate-800">deviceId</code>, <code className="font-mono text-slate-800">timestamp</code>, <code className="font-mono text-slate-800">accelerometer: &#123; x, y, z &#125;</code>, <code className="font-mono text-slate-800">gyroscope: &#123; x, y, z &#125;</code>, and <code className="font-mono text-slate-800">gps: &#123; nmea: "..." &#125;</code>.
          </li>
          <li>
            <strong>GPS Data Flow:</strong> NEO-6M outputs raw NMEA → STM32 forwards raw NMEA → ESP32 uploads raw NMEA to <code className="font-mono text-slate-800">/imuTest/latest/gps/nmea</code>. All coordinate parsing happens client-side.
          </li>
          <li>
            <strong>Simulator Isolation:</strong> The existing background simulator writes to <code className="font-mono text-slate-800">/roadReports</code> and does NOT interfere with this test endpoint.
          </li>
          <li>
            <strong>Freshness Detection:</strong> If new packets are not received within 6 seconds, this page automatically flags the hardware status as "Stale".
          </li>
        </ul>
      </div>
    </div>
  );
}
