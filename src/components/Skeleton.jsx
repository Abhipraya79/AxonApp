import React from 'react';

/**
 * Komponen Skeleton universal untuk efek loading state
 */
export function SkeletonLine({ className = '', width = 'w-full', height = 'h-4' }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-700/50 ${width} ${height} ${className}`}
    />
  );
}

/**
 * Skeleton khusus untuk KPI Stat Card
 */
export function SkeletonStatCard() {
  return (
    <div className="stat-card animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3.5 bg-slate-700/60 rounded w-24" />
        <div className="w-9 h-9 rounded-lg bg-slate-700/40" />
      </div>
      <div className="h-8 bg-slate-700/70 rounded w-36 mb-2" />
      <div className="h-3 bg-slate-800 rounded w-20" />
      <div className="h-3 bg-slate-800 rounded w-28 mt-4" />
    </div>
  );
}

/**
 * Skeleton khusus untuk Chart Container
 */
export function SkeletonChart({ height = 280 }) {
  return (
    <div className="card flex flex-col animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="h-4 bg-slate-700/70 rounded w-40 mb-1" />
          <div className="h-3 bg-slate-800 rounded w-28" />
        </div>
      </div>
      <div
        style={{ height }}
        className="w-full rounded-lg bg-slate-800/30 border border-slate-750 flex items-end justify-between p-6 gap-3"
      >
        <div className="h-1/3 bg-slate-700/30 rounded w-full" />
        <div className="h-2/3 bg-slate-700/40 rounded w-full" />
        <div className="h-1/2 bg-slate-700/30 rounded w-full" />
        <div className="h-4/5 bg-slate-700/40 rounded w-full" />
        <div className="h-3/5 bg-slate-700/30 rounded w-full" />
        <div className="h-full bg-slate-700/40 rounded w-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton khusus untuk Data Table
 */
export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-slate-700/70 rounded w-36 mb-5" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex gap-4 items-center py-2 border-b border-slate-800/50">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={`h-4 bg-slate-700/40 rounded ${
                  cIdx === 0 ? 'w-12' : cIdx === 1 ? 'flex-1' : 'w-24'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const Skeleton = {
  SkeletonLine,
  SkeletonStatCard,
  SkeletonChart,
  SkeletonTable,
};

export default Skeleton;
