import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

/**
 * Komponen Error Alert untuk menangani error state dari API
 */
export default function ErrorAlert({
  title = 'Gagal Memuat Data',
  message,
  onRetry,
  onDismiss,
  className = '',
}) {
  if (!message) return null;

  return (
    <div
      className={`rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 backdrop-blur-sm shadow-lg ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 mt-0.5 flex-shrink-0">
          <AlertCircle size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-rose-100">{title}</h4>
          <p className="text-xs text-rose-300 mt-1 break-words font-mono opacity-90">
            {message}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              Coba Lagi (Retry)
            </button>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-rose-400 hover:text-rose-200 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
