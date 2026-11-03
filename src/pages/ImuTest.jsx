import { useState, useRef, useCallback } from 'react';
import {
  Send,
  Upload,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Gauge,
  Activity,
  Compass,
  Image as ImageIcon,
  X,
  Loader2,
  FlaskConical,
  Terminal,
  ChevronDown,
} from 'lucide-react';
import { db } from '../services/firebase';
import { ref, push } from 'firebase/database';

const CLOUDINARY_CLOUD_NAME = 'aocrjdi2';
const CLOUDINARY_UPLOAD_PRESET = 'roadsense_esp32';
const DATABASE_PATH = 'roadReports';

/* ─── Default form values matching the ESP data schema ──────────────── */

const defaultForm = {
  deviceId: 'SPOTHOLES_SIM',
  condition: 'Moderate',
  confidence: 75,
  roadName: 'Unknown',
  latitude: 19.122879,
  longitude: 72.837251,
  speed: 1,
  gpsDate: '',
  gpsUtc: '',
  accelX: 0.0,
  accelY: 0.0,
  accelZ: 9.81,
  gyroX: 0.0,
  gyroY: 0.0,
  gyroZ: 0.0,
};

/* ─── Cloudinary unsigned upload ─────────────────────────────────────── */

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return data.secure_url;
}

/* ─── Push data to Firebase RTDB ─────────────────────────────────────── */

async function pushToFirebase(payload) {
  const reportsRef = ref(db, DATABASE_PATH);
  await push(reportsRef, payload);
}

/* ─── Reusable input components ──────────────────────────────────────── */

function FormField({ label, icon: Icon, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', step, className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
      placeholder={placeholder}
      step={step}
      className={`w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-mono text-slate-800
        placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
        transition-all ${className}`}
    />
  );
}

/* ─── Main Page Component ────────────────────────────────────────────── */

export default function ImuTest() {
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* Build the exact JSON payload that ESP sends to Firebase */
  const buildPayload = (imageUrl = '') => {
    const now = Date.now();

    // Build the current date/time strings if user left them blank
    const d = new Date(now);
    const gpsDate =
      form.gpsDate ||
      `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getFullYear()).slice(-2)}`;
    const gpsUtc =
      form.gpsUtc ||
      `${String(d.getUTCHours()).padStart(2, '0')}${String(d.getUTCMinutes()).padStart(2, '0')}${String(d.getUTCSeconds()).padStart(2, '0')}.00`;

    const payload = {
      accelerometer: {
        x: Number(form.accelX) || 0,
        y: Number(form.accelY) || 0,
        z: Number(form.accelZ) || 0,
      },
      condition: form.condition,
      confidence: Number(form.confidence) || 0,
      deviceId: form.deviceId || 'SPOTHOLES_SIM',
      gpsDate,
      gpsUtc,
      gyroscope: {
        x: Number(form.gyroX) || 0,
        y: Number(form.gyroY) || 0,
        z: Number(form.gyroZ) || 0,
      },
      imageUrl: imageUrl || '',
      latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0,
      photoStatus: imageUrl ? 'uploaded' : 'none',
      roadName: form.roadName || 'Unknown',
      speed: Number(form.speed) || 0,
      timestamp: now,
    };

    return payload;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      let imageUrl = '';

      // Step 1: Upload image to Cloudinary (if selected)
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      // Step 2: Build the payload
      const payload = buildPayload(imageUrl);

      // Step 3: Push to Firebase (same path as ESP)
      await pushToFirebase(payload);

      setFeedback({
        type: 'success',
        message: `Report pushed to Firebase successfully! Timestamp: ${new Date(payload.timestamp).toLocaleTimeString()}`,
      });

      // Clear image after successful push
      clearImage();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to push data',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewPayload = buildPayload(imagePreview ? '(image will be uploaded to Cloudinary)' : '');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ─── Header Banner ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs font-semibold uppercase tracking-wider">
                Simulator
              </span>
              <span className="text-xs text-slate-400 font-mono">Path: /roadReports</span>
            </div>
            <h1 className="text-2xl font-bold mt-2 text-white flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-violet-400" />
              Simulated Data Push
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Push test road report data to Firebase in the exact same format as the ESP32 hardware.
              Data will appear on the Dashboard map and live feed indistinguishably from real sensor data.
            </p>
          </div>
        </div>

        {/* Pipeline visualizer */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 hidden sm:flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-white font-medium">This Page (Simulator)</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span>Cloudinary (Image)</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Firebase RTDB</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Dashboard (Live)</span>
          </div>
        </div>
      </div>

      {/* ─── Feedback Alert ────────────────────────────────────────── */}
      {feedback && (
        <div
          className={`rounded-xl p-4 flex items-center gap-3 text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p className="font-medium">{feedback.message}</p>
          <button onClick={() => setFeedback(null)} className="ml-auto">
            <X className="w-4 h-4 opacity-50 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* ─── Form Section ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Column 1: Device & Classification ──────────────────── */}
        <div className="space-y-6">
          {/* Device Info Card */}
          <div className="rounded-2xl bg-white border border-[#E2E8F0] card-shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Gauge className="w-3.5 h-3.5" />
                </div>
                Device & Classification
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <FormField label="Device ID">
                <TextInput
                  value={form.deviceId}
                  onChange={(v) => updateField('deviceId', v)}
                  placeholder="SPOTHOLES_01"
                />
              </FormField>

              <FormField label="Road Name">
                <TextInput
                  value={form.roadName}
                  onChange={(v) => updateField('roadName', v)}
                  placeholder="Unknown"
                />
              </FormField>

              <FormField label="Condition">
                <select
                  value={form.condition}
                  onChange={(e) => updateField('condition', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                >
                  <option value="Good">Good</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Poor">Poor</option>
                </select>
              </FormField>

              <FormField label="Confidence (%)">
                <TextInput
                  type="number"
                  value={form.confidence}
                  onChange={(v) => updateField('confidence', v)}
                  placeholder="75"
                  step="1"
                />
              </FormField>

              <FormField label="Speed (km/h)">
                <TextInput
                  type="number"
                  value={form.speed}
                  onChange={(v) => updateField('speed', v)}
                  placeholder="1"
                  step="1"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* ── Column 2: Location & Sensors ────────────────────────── */}
        <div className="space-y-6">
          {/* GPS / Location Card */}
          <div className="rounded-2xl bg-white border border-[#E2E8F0] card-shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                Location & GPS
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Latitude">
                  <TextInput
                    type="number"
                    value={form.latitude}
                    onChange={(v) => updateField('latitude', v)}
                    step="0.000001"
                  />
                </FormField>
                <FormField label="Longitude">
                  <TextInput
                    type="number"
                    value={form.longitude}
                    onChange={(v) => updateField('longitude', v)}
                    step="0.000001"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="GPS Date (DDMMYY)">
                  <TextInput
                    value={form.gpsDate}
                    onChange={(v) => updateField('gpsDate', v)}
                    placeholder="auto"
                  />
                </FormField>
                <FormField label="GPS UTC (HHMMSS.ss)">
                  <TextInput
                    value={form.gpsUtc}
                    onChange={(v) => updateField('gpsUtc', v)}
                    placeholder="auto"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Sensor Data Card */}
          <div className="rounded-2xl bg-white border border-[#E2E8F0] card-shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                Sensor Data
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Accelerometer */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> Accelerometer
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <FormField label="X">
                    <TextInput type="number" value={form.accelX} onChange={(v) => updateField('accelX', v)} step="0.01" />
                  </FormField>
                  <FormField label="Y">
                    <TextInput type="number" value={form.accelY} onChange={(v) => updateField('accelY', v)} step="0.01" />
                  </FormField>
                  <FormField label="Z">
                    <TextInput type="number" value={form.accelZ} onChange={(v) => updateField('accelZ', v)} step="0.01" />
                  </FormField>
                </div>
              </div>

              {/* Gyroscope */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Compass className="w-3 h-3" /> Gyroscope
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <FormField label="X">
                    <TextInput type="number" value={form.gyroX} onChange={(v) => updateField('gyroX', v)} step="0.01" />
                  </FormField>
                  <FormField label="Y">
                    <TextInput type="number" value={form.gyroY} onChange={(v) => updateField('gyroY', v)} step="0.01" />
                  </FormField>
                  <FormField label="Z">
                    <TextInput type="number" value={form.gyroZ} onChange={(v) => updateField('gyroZ', v)} step="0.01" />
                  </FormField>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Column 3: Image Upload & Actions ───────────────────── */}
        <div className="space-y-6">
          {/* Image Upload Card */}
          <div className="rounded-2xl bg-white border border-[#E2E8F0] card-shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                Pothole Image
              </h2>
            </div>
            <div className="p-5">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border border-slate-200"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-slate-500 mt-2 text-center font-medium">
                    {imageFile?.name} ({(imageFile?.size / 1024).toFixed(0)} KB)
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400
                    bg-slate-50 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-3
                    transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
                      Click to upload image
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG — max 10 MB</p>
                  </div>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <p className="text-[10px] text-slate-400 mt-3 text-center">
                Image will be uploaded to Cloudinary and the URL stored in Firebase
              </p>
            </div>
          </div>

          {/* Push Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl
              bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
              text-white font-bold text-sm shadow-lg shadow-blue-500/25
              transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {imageFile ? 'Uploading Image & Pushing...' : 'Pushing to Firebase...'}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Push to Firebase
              </>
            )}
          </button>

          {/* JSON Preview Toggle */}
          <div className="rounded-2xl bg-white border border-[#E2E8F0] card-shadow overflow-hidden">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Preview JSON Payload
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
            </button>
            {showPreview && (
              <div className="px-5 pb-5">
                <pre className="bg-slate-900 text-emerald-400 text-[11px] font-mono p-4 rounded-xl overflow-x-auto border border-slate-800 max-h-80">
                  {JSON.stringify(previewPayload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Info Footer ───────────────────────────────────────────── */}
      <div className="rounded-xl bg-slate-100 border border-slate-200/80 p-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          How This Works
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li>
            <strong>Exact ESP32 Format:</strong> The payload pushed by this page is structurally identical to what the ESP32 hardware sends —
            including <code className="font-mono text-slate-800">accelerometer</code>, <code className="font-mono text-slate-800">gyroscope</code>,
            <code className="font-mono text-slate-800">gpsDate</code>, <code className="font-mono text-slate-800">gpsUtc</code>,
            <code className="font-mono text-slate-800">photoStatus</code>, and <code className="font-mono text-slate-800">imageUrl</code>.
          </li>
          <li>
            <strong>Timestamp:</strong> Automatically set to the current device time (<code className="font-mono text-slate-800">Date.now()</code>) at the moment of submission — not user-editable.
          </li>
          <li>
            <strong>Image Upload:</strong> If an image is selected, it is uploaded to Cloudinary first, then the returned URL is placed
            in <code className="font-mono text-slate-800">imageUrl</code> — exactly how the ESP32 uploads photos.
          </li>
          <li>
            <strong>Target Path:</strong> Data is pushed to <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-800">/roadReports</code> using
            Firebase <code className="font-mono text-slate-800">push()</code>, generating a unique key just like real hardware data.
          </li>
        </ul>
      </div>
    </div>
  );
}
