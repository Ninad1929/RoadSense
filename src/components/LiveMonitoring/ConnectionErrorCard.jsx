import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

export default function ConnectionErrorCard({ message, onRetry }) {
  return (
    <div className="rounded-xl bg-white border border-red-200 card-shadow p-8">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-[#DC2626]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <WifiOff className="w-4 h-4 text-[#DC2626]" />
            <h3 className="text-sm font-semibold text-[#334155]">Connection Error</h3>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Unable to connect to Firebase. Real-time monitoring is unavailable.
          </p>
          <p className="text-xs text-slate-400 mt-2 font-mono break-all">
            {message || 'Unknown error occurred'}
          </p>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
            <span className="text-xs text-slate-400 font-medium">Status: Disconnected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
