import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';

/**
 * StatCard — KPI metric card dengan trend indicator
 * @param {string}  title     - Label metrik
 * @param {number}  value     - Nilai utama
 * @param {'currency'|'number'|'plain'} format
 * @param {number}  change    - % perubahan dari periode sebelumnya (opsional)
 * @param {React.ReactNode} icon - Lucide icon component
 * @param {string}  accentColor - CSS var atau hex color untuk accent
 * @param {string}  subtext   - Teks kecil di bawah value (opsional)
 */
export function StatCard({
  title,
  value,
  format = 'number',
  change,
  icon: Icon,
  accentColor = 'var(--accent-blue)',
  subtext,
}) {
  const displayValue =
    format === 'currency' ? formatCurrency(value, true) :
    format === 'number'   ? formatNumber(value) :
    String(value ?? '—');

  const trend = change != null ? formatPercent(change) : null;

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-4">
        <p className="stat-label">{title}</p>
        {Icon && (
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-transform group-hover:scale-110"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            <Icon size={17} />
          </div>
        )}
      </div>

      <p className="stat-value mb-1" style={{ color: accentColor }}>
        {displayValue}
      </p>

      {subtext && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {subtext}
        </p>
      )}

      {trend && (
        <div className="flex items-center gap-1 mt-3">
          {trend.isPositive === true && (
            <TrendingUp size={13} style={{ color: 'var(--accent-emerald)' }} />
          )}
          {trend.isPositive === false && (
            <TrendingDown size={13} style={{ color: 'var(--accent-rose)' }} />
          )}
          {trend.isPositive === null && (
            <Minus size={13} style={{ color: 'var(--text-muted)' }} />
          )}
          <span
            className="text-xs font-medium font-mono"
            style={{
              color: trend.isPositive === true
                ? 'var(--accent-emerald)'
                : trend.isPositive === false
                ? 'var(--accent-rose)'
                : 'var(--text-muted)',
            }}
          >
            {trend.text}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            vs last period
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Card — Generic container card
 */
export function Card({ children, className = '', title, action }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
