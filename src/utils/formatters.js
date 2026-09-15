/**
 * AxonApp — Utility Formatters
 * Helper functions for formatting data values across the dashboard.
 */

/**
 * Format angka sebagai mata uang USD
 * @param {number} value
 * @param {boolean} compact - gunakan format singkat (e.g. $1.2M)
 * @returns {string}
 */
export function formatCurrency(value, compact = false) {
  if (value == null || isNaN(value)) return '—';
  
  if (compact) {
    if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format angka dengan separator ribuan
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format tanggal ISO/MySQL menjadi format human-readable
 * @param {string|Date} dateInput
 * @param {string} style - 'short' | 'medium' | 'long'
 * @returns {string}
 */
export function formatDate(dateInput, style = 'medium') {
  if (!dateInput) return '—';
  
  const date = new Date(dateInput);
  if (isNaN(date)) return String(dateInput);

  const options = {
    short:  { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'long', day: 'numeric', year: 'numeric' },
    long:   { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' },
  };

  return date.toLocaleDateString('en-US', options[style] || options.medium);
}

/**
 * Format persentase dengan tanda +/- dan warna
 * @param {number} value
 * @returns {{ text: string, isPositive: boolean }}
 */
export function formatPercent(value) {
  if (value == null || isNaN(value)) return { text: '—', isPositive: null };
  const isPositive = value >= 0;
  const text = `${isPositive ? '+' : ''}${value.toFixed(2)}%`;
  return { text, isPositive };
}

/**
 * Singkat nama panjang untuk tampilan tabel
 * @param {string} name
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(name, maxLength = 28) {
  if (!name) return '—';
  return name.length > maxLength ? name.slice(0, maxLength) + '…' : name;
}

/**
 * Dapatkan inisial dari nama (untuk avatar)
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Kapitalisasi tiap kata
 * @param {string} str
 * @returns {string}
 */
export function titleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, char => char.toUpperCase());
}
