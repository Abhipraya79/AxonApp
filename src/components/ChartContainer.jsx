import { useState } from 'react';
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react';

/**
 * ChartContainer — Wrapper universal untuk semua chart Recharts
 * Menangani loading, error, empty state, dan header chart.
 *
 * @param {string}         title       - Judul chart
 * @param {string}         subtitle    - Keterangan singkat (opsional)
 * @param {boolean}        loading     - State loading
 * @param {string|null}    error       - Error message (null = no error)
 * @param {React.ReactNode} children   - Recharts component
 * @param {React.ReactNode} action     - Extra button/filter di header
 * @param {string}         className   - Extra Tailwind classes
 * @param {number}         height      - Tinggi area chart (default 280)
 */
export default function ChartContainer({
  title,
  subtitle,
  loading = false,
  error = null,
  children,
  action,
  className = '',
  height = 280,
}) {
  return (
    <div className={`card flex flex-col ${className}`}>
      {/* Header */}
      {(title || action) && (
        <div className="flex items-start justify-between mb-5">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      {/* Chart Body */}
      <div style={{ height, position: 'relative' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2
                size={24}
                className="animate-spin"
                style={{ color: 'var(--accent-blue)' }}
              />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Loading data...
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <AlertCircle size={24} style={{ color: 'var(--accent-rose)' }} />
              <p className="text-xs" style={{ color: 'var(--accent-rose)' }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && !children && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <BarChart3 size={24} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No data available
              </p>
            </div>
          </div>
        )}

        {!loading && !error && children && children}
      </div>
    </div>
  );
}

// ============================================================
// RECHARTS THEME CONSTANTS
// Gunakan ini di seluruh chart untuk konsistensi visual.
// ============================================================
export const CHART_COLORS = {
  blue:    '#3B82F6',
  violet:  '#8B5CF6',
  emerald: '#10B981',
  amber:   '#F59E0B',
  rose:    '#F43F5E',
  cyan:    '#06B6D4',
  orange:  '#F97316',
};

export const CHART_COLORS_ARRAY = Object.values(CHART_COLORS);

export const chartTheme = {
  grid: {
    stroke: 'rgba(51, 65, 85, 0.5)',
    strokeDasharray: '4 4',
  },
  axis: {
    tick:  { fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
    line:  { stroke: 'rgba(51, 65, 85, 0.5)' },
  },
  tooltip: {
    contentStyle: {
      background:   '#1E293B',
      border:       '1px solid rgba(59, 130, 246, 0.25)',
      borderRadius: '8px',
      color:        '#F1F5F9',
      fontFamily:   'Outfit, sans-serif',
      fontSize:     '12px',
    },
    labelStyle: {
      color:      '#94A3B8',
      fontWeight: 600,
    },
    cursor: { fill: 'rgba(59, 130, 246, 0.06)' },
  },
};
