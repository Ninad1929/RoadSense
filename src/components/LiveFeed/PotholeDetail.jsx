import {
  AlertTriangle,
  MinusCircle,
  CheckCircle2,
  MapPin,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Smartphone,
  Image as ImageIcon,
  Zap,
  Activity,
} from 'lucide-react';
import { useState } from 'react';
import { formatReportTimestamp } from '../../utils/roadReport';

const conditionConfig = {
  Poor: {
    badge: 'bg-red-50 text-[#DC2626] border-red-100',
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-[#DC2626]',
    dot: 'bg-[#DC2626]',
    barColor: 'bg-[#DC2626]',
    label: 'Severe Pothole',
  },
  Moderate: {
    badge: 'bg-amber-50 text-[#F59E0B] border-amber-100',
    icon: MinusCircle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
    barColor: 'bg-[#F59E0B]',
    label: 'Moderate Damage',
  },
  Good: {
    badge: 'bg-green-50 text-[#16A34A] border-green-100',
    icon: CheckCircle2,
    iconBg: 'bg-green-50',
    iconColor: 'text-[#16A34A]',
    dot: 'bg-[#16A34A]',
    barColor: 'bg-[#16A34A]',
    label: 'Good Condition',
  },
};

function SensorDisplay({ label, icon: Icon, value }) {
  if (!value) return null;

  let display = '';
  if (typeof value === 'string') {
    display = value;
  } else if (typeof value === 'object' && 'x' in value) {
    display = `X: ${value.x.toFixed(2)}  Y: ${value.y.toFixed(2)}  Z: ${value.z.toFixed(2)}`;
  }

  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs text-[#334155] font-mono mt-0.5 break-all">{display}</p>
      </div>
    </div>
  );
}

export default function PotholeDetail({ reports, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!reports || reports.length === 0) return null;

  const report = reports[activeIndex];
  const config = conditionConfig[report.condition] || conditionConfig.Good;
  const StatusIcon = config.icon;
  const hasMultiple = reports.length > 1;
  const hasImage = report.imageUrl && report.imageUrl.length > 0;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : reports.length - 1));
    setImageLoading(true);
    setImageError(false);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < reports.length - 1 ? prev + 1 : 0));
    setImageLoading(true);
    setImageError(false);
  };

  return (
    <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow flex flex-col h-full overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${config.iconBg} flex items-center justify-center`}>
            <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#334155]">Pothole Details</h3>
            {hasMultiple && (
              <p className="text-[10px] text-slate-400 font-medium">
                {reports.length} detections at this spot
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          title="Back to Live Feed"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Image section */}
        <div className="relative w-full bg-slate-100 border-b border-[#E2E8F0]" style={{ minHeight: '180px' }}>
          {hasImage && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-[#2563EB] rounded-full animate-spin" />
                    <span className="text-[10px] text-slate-400 font-medium">Loading image…</span>
                  </div>
                </div>
              )}
              <img
                src={report.imageUrl}
                alt={`Pothole at ${report.roadName || 'location'}`}
                className={`w-full h-[180px] object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[180px] text-slate-300">
              <ImageIcon className="w-10 h-10 mb-2" />
              <span className="text-xs font-medium">
                {imageError ? 'Failed to load image' : 'No image available'}
              </span>
            </div>
          )}

          {/* Image navigation arrows (when multiple reports) */}
          {hasMultiple && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
              {/* Pagination dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 rounded-full px-2.5 py-1 backdrop-blur-sm">
                {reports.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveIndex(i);
                      setImageLoading(true);
                      setImageError(false);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === activeIndex ? 'bg-white w-3' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info cards */}
        <div className="px-4 py-3 space-y-3">
          {/* Road name & condition */}
          <div>
            <h4 className="text-[13px] font-bold text-[#0f172a]">
              {report.roadName || 'Unknown Road'}
            </h4>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wide ${config.badge}`}
              >
                {report.condition}
              </span>
              <span className="text-[10px] text-slate-400">{config.label}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Confidence */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Confidence</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${config.barColor} transition-all`}
                    style={{ width: `${report.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#334155]">{report.confidence}%</span>
              </div>
            </div>

            {/* Speed */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-slate-400" />
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Speed</p>
              </div>
              <p className="text-xs font-bold text-[#334155] mt-1">
                {report.speed != null ? `${report.speed} km/h` : '—'}
              </p>
            </div>

            {/* Location */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location</p>
              </div>
              <p className="text-xs text-[#334155] font-mono mt-1">
                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </p>
            </div>

            {/* Timestamp */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Time</p>
              </div>
              <p className="text-xs text-[#334155] font-medium mt-1">
                {formatReportTimestamp(report.timestamp)}
              </p>
            </div>
          </div>

          {/* Sensor data */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-0.5">
              Sensor Data
            </p>
            <SensorDisplay label="Accelerometer" icon={Activity} value={report.accelerometer} />
            <SensorDisplay label="Gyroscope" icon={Zap} value={report.gyroscope} />
          </div>

          {/* Device info */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <Smartphone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Device ID</p>
              <p className="text-xs text-[#334155] font-mono mt-0.5">{report.deviceId || '—'}</p>
            </div>
            {report.battery != null && (
              <div className="ml-auto text-right">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Battery</p>
                <p className="text-xs font-bold text-[#334155] mt-0.5">{report.battery}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - report navigation when multiple */}
      {hasMultiple && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#E2E8F0] bg-slate-50/80 flex-shrink-0">
          <button
            onClick={handlePrev}
            className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <span className="text-[11px] font-semibold text-slate-400">
            {activeIndex + 1} / {reports.length}
          </span>
          <button
            onClick={handleNext}
            className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

