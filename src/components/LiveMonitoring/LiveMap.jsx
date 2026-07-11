import { useRef, useEffect, useCallback } from 'react';
import { Map as MapCanvas } from '@/components/ui/map';
import { getLatestReportPerDevice } from '../../utils/liveMonitoring';
import { formatReportTimestamp } from '../../utils/roadReport';

const conditionColors = {
  Good: '#16A34A',
  Moderate: '#F59E0B',
  Poor: '#DC2626',
};

function buildPopupHtml(report) {
  const color = conditionColors[report.condition] || '#2563EB';
  const timestamp = formatReportTimestamp(report.timestamp);

  return `
    <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 220px;">
      <h4 style="margin: 0 0 8px 0; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">LIVE DETECTION</h4>
      <div style="margin-bottom: 12px; font-size: 11px;">
        <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Device ID</span>
        <span style="font-weight: 700; color: #0f172a; font-family: monospace;">${report.deviceId}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; font-size: 12px;">
        <div>
          <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Condition</span>
          <span style="font-weight: 700; color: ${color};">${report.condition}</span>
        </div>
        <div>
          <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Confidence</span>
          <span style="font-weight: 600; color: #334155;">${report.confidence}%</span>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; font-size: 11px;">
        <div>
          <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Latitude</span>
          <span style="color: #475569; font-family: monospace;">${report.latitude.toFixed(4)}</span>
        </div>
        <div>
          <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Longitude</span>
          <span style="color: #475569; font-family: monospace;">${report.longitude.toFixed(4)}</span>
        </div>
      </div>
      <div style="font-size: 11px;">
        <span style="display: block; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Timestamp</span>
        <span style="color: #475569;">${timestamp}</span>
      </div>
    </div>
  `;
}

function createMarkerElement(report, isNew) {
  const el = document.createElement('div');
  el.className = isNew ? 'live-map-marker marker-appear' : 'live-map-marker';
  el.style.position = 'relative';
  el.style.width = '18px';
  el.style.height = '18px';
  el.style.cursor = 'pointer';

  const isPoor = report.condition === 'Poor';
  const color = conditionColors[report.condition] || '#2563EB';

  const dot = document.createElement('div');
  dot.style.width = '18px';
  dot.style.height = '18px';
  dot.style.borderRadius = '50%';
  dot.style.backgroundColor = color;
  dot.style.border = '2px solid white';
  dot.style.boxShadow = '0 2px 6px rgba(0,0,0,0.35)';
  dot.style.position = 'relative';
  dot.style.zIndex = '2';
  el.appendChild(dot);

  if (isPoor) {
    const pulse = document.createElement('div');
    pulse.className = 'marker-pulse';
    pulse.style.position = 'absolute';
    pulse.style.inset = '-4px';
    pulse.style.borderRadius = '50%';
    pulse.style.backgroundColor = color;
    pulse.style.opacity = '0.5';
    pulse.style.animation = 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
    el.appendChild(pulse);
  }

  return el;
}

export default function LiveMap({ reports }) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());
  const timestampsRef = useRef(new Map());

  const refreshMarkerPositions = useCallback(() => {
    markersRef.current.forEach((marker) => {
      const { lng, lat } = marker.getLngLat();
      marker.setLngLat([lng, lat]);
    });
  }, []);

  const syncMarkers = useCallback((map, deviceReports) => {
    map.resize();
    const activeDeviceIds = new Set(deviceReports.map((r) => r.deviceId));

    markersRef.current.forEach((marker, deviceId) => {
      if (!activeDeviceIds.has(deviceId)) {
        marker.remove();
        markersRef.current.delete(deviceId);
        timestampsRef.current.delete(deviceId);
      }
    });

    deviceReports.forEach((report) => {
      if (!report.deviceId) return;

      const prevTimestamp = timestampsRef.current.get(report.deviceId);
      const isNew = !prevTimestamp;
      const isUpdated = prevTimestamp && prevTimestamp !== report.timestamp;

      const existingMarker = markersRef.current.get(report.deviceId);

      if (existingMarker) {
        existingMarker.setLngLat([report.longitude, report.latitude]);
        const popup = new window.maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(
          buildPopupHtml(report)
        );
        existingMarker.setPopup(popup);

        if (isUpdated) {
          const el = existingMarker.getElement();
          el.classList.remove('marker-appear');
          void el.offsetWidth;
          el.classList.add('marker-updated');
          setTimeout(() => el.classList.remove('marker-updated'), 600);
        }
      } else {
        const el = createMarkerElement(report, isNew);
        const popup = new window.maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(
          buildPopupHtml(report)
        );

        const marker = new window.maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([report.longitude, report.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.set(report.deviceId, marker);
      }

      timestampsRef.current.set(report.deviceId, report.timestamp);
    });

    refreshMarkerPositions();
  }, [refreshMarkerPositions]);

  const handleMapLoad = useCallback(
    (map) => {
      mapInstanceRef.current = map;
      const deviceReports = getLatestReportPerDevice(reports);
      syncMarkers(map, deviceReports);
    },
    [reports, syncMarkers]
  );

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const deviceReports = getLatestReportPerDevice(reports);
    syncMarkers(mapInstanceRef.current, deviceReports);
  }, [reports, syncMarkers]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      const map = mapInstanceRef.current;
      if (!map) return;
      map.resize();
      refreshMarkerPositions();
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [refreshMarkerPositions]);

  useEffect(() => {
    if (document.getElementById('live-map-keyframes')) return;

    const style = document.createElement('style');
    style.id = 'live-map-keyframes';
    style.innerHTML = `
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 0.8; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      @keyframes marker-appear {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes marker-updated {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      .marker-appear { animation: marker-appear 0.5s ease-out forwards; }
      .marker-updated { animation: marker-updated 0.6s ease-out; }
      .maplibregl-popup-content {
        border-radius: 12px !important;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1) !important;
        padding: 12px 16px !important;
        border: 1px solid #e2e8f0 !important;
      }
      .maplibregl-popup-tip { border-top-color: #fff !important; }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      timestampsRef.current.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden bg-white border border-[#E2E8F0] card-shadow h-full w-full relative"
    >
      <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-white/95 border border-[#E2E8F0] shadow-sm">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Live Map
        </span>
      </div>
      <MapCanvas
        onLoad={handleMapLoad}
        initialViewState={{
          longitude: 72.8777,
          latitude: 19.0760,
          zoom: 11,
        }}
      />
    </div>
  );
}
