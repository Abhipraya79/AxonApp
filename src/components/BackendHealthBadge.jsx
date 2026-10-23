import { useState, useEffect, useCallback } from 'react';
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Server, X } from 'lucide-react';
import { checkBackendHealth } from '@/services/apiClient';

/**
 * BackendHealthBadge — Status Indikator Koneksi Live API
 * Menguji endpoint GET /api/health dan menampilkan status visual di Navbar/Header
 */
export default function BackendHealthBadge({ className = '' }) {
  const [health, setHealth] = useState({
    online: null, // null = checking, true = up, false = down
    status: 'CHECKING',
    message: 'Memeriksa koneksi...',
    latencyMs: null,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runHealthCheck = useCallback(async () => {
    setIsChecking(true);
    const result = await checkBackendHealth();
    setHealth(result);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    runHealthCheck();
    // Auto-check setiap 60 detik
    const interval = setInterval(runHealthCheck, 60000);
    return () => clearInterval(interval);
  }, [runHealthCheck]);

  const isOnline = health.online === true;
  const isCheckingState = health.online === null || isChecking;

  return (
    <div className={`relative ${className}`}>
      {/* Pill Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
          isCheckingState
            ? 'bg-slate-800/80 text-slate-300 border-slate-700'
            : isOnline
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
        }`}
        title="Klik untuk detail status koneksi backend"
      >
        <span className="relative flex h-2 w-2">
          {isOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isCheckingState
                ? 'bg-amber-400 animate-pulse'
                : isOnline
                ? 'bg-emerald-400'
                : 'bg-rose-500'
            }`}
          />
        </span>

        <span className="text-[11px] font-semibold tracking-wide">
          {isCheckingState
            ? 'Pinging API...'
            : isOnline
            ? 'Backend Online'
            : 'Backend Offline'}
        </span>

        {isOnline && health.latencyMs && (
          <span className="text-[10px] font-mono text-emerald-400/80 hidden sm:inline">
            {health.latencyMs}ms
          </span>
        )}
      </button>

      {/* Popover Detail Modal */}
      {showDetails && (
        <div className="absolute right-0 top-9 w-72 sm:w-80 rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-md p-4 text-xs shadow-2xl z-50 animate-fade-in">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server size={15} className={isOnline ? 'text-emerald-400' : 'text-rose-400'} />
              <span className="font-semibold text-white">Status Koneksi API</span>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Endpoint:</span>
              <span className="font-mono text-[11px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                GET /api/health
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Server:</span>
              <span className="font-mono text-[11px] text-slate-300 truncate max-w-[170px]" title="https://axonbe.bgsprayogi.my.id">
                axonbe.bgsprayogi.my.id
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Proxy Mode:</span>
              <span className="font-mono text-[11px] text-emerald-400">
                Vite Dev Proxy (Bypass CORS)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Response Status:</span>
              <span
                className={`font-semibold font-mono ${
                  isOnline ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {health.status} {health.latencyMs ? `(${health.latencyMs}ms)` : ''}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 mt-2">
              <p className="text-[11px] leading-relaxed break-words font-mono">
                {health.message}
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex justify-end">
            <button
              onClick={runHealthCheck}
              disabled={isChecking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isChecking ? 'animate-spin' : ''} />
              <span>{isChecking ? 'Checking...' : 'Tes Ulang Koneksi'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
