import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';

/**
 * Komponen Empty State untuk kondisi data kosong
 */
export default function EmptyState({
  title = 'Tidak Ada Data',
  description = 'Belum ada data yang tersedia untuk parameter pencarian atau filter ini.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`card flex flex-col items-center justify-center py-12 text-center border-dashed border-slate-700/80 bg-slate-900/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
        <Icon size={24} />
      </div>

      <h3 className="text-sm font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-md cursor-pointer"
        >
          <RefreshCw size={12} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
