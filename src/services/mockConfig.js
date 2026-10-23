/**
 * AxonApp — Mock Data Configuration
 * ─────────────────────────────────
 * Set USE_MOCK = true  → semua request direspon dengan data lokal (no network)
 * Set USE_MOCK = false → request diteruskan ke backend via Vite proxy seperti biasa
 *
 * Ketika backend kembali online, cukup ganti USE_MOCK = false lalu simpan file ini.
 * Hot-reload Vite akan langsung mencabut mock tanpa perlu restart.
 */

// ── 🚨 Toggle utama ──────────────────────────────────────────────────
export const USE_MOCK = false;

// ── Simulated network delay (ms) ────────────────────────────────────
// Beri jeda agar UX skeleton loading tetap bisa terlihat saat development
export const MOCK_DELAY_MS = 400;

// ── Route → Mock data map ────────────────────────────────────────────
// Kunci: URL path yang di-GET (tanpa /api prefix, sesuai baseURL apiClient)
// Value: fungsi yang mengembalikan { success, data } sesuai struktur API real

import { FALLBACK_ANALYTICS } from './analyticsService';
import { FALLBACK_PRODUCTS_DATA } from './productsService';
import { FALLBACK_FINANCE_DATA } from './financeService';

/** Cocokkan url ke mock handler. Return null jika tidak ada match. */
export function resolveMock(method, url, params) {
  const path = url.replace(/\?.*$/, ''); // strip query string

  // ── Analytics ──────────────────────────────────────────────────
  if (method === 'get' && path === '/analytics/kpi') {
    return { success: true, data: FALLBACK_ANALYTICS.kpi };
  }

  if (method === 'get' && path === '/analytics/sales-trend') {
    const year = params?.year ? Number(params.year) : null;
    const data = year
      ? FALLBACK_ANALYTICS.salesTrend.filter((d) => d.year === year || !d.year)
      : FALLBACK_ANALYTICS.salesTrend;
    return { success: true, data };
  }

  if (method === 'get' && path === '/analytics/customer-distribution') {
    return { success: true, data: FALLBACK_ANALYTICS.customerDistribution };
  }

  // ── Products ───────────────────────────────────────────────────
  if (method === 'get' && path === '/products') {
    const page  = Number(params?.page  ?? 1);
    const limit = Number(params?.limit ?? 20);
    const search = (params?.search ?? '').toLowerCase();
    const filtered = search
      ? FALLBACK_PRODUCTS_DATA.products.items.filter((p) =>
          p.productName.toLowerCase().includes(search) ||
          p.productLine.toLowerCase().includes(search)
        )
      : FALLBACK_PRODUCTS_DATA.products.items;
    const start = (page - 1) * limit;
    return {
      success: true,
      data: {
        items: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      },
    };
  }

  if (method === 'get' && path === '/products/top-selling') {
    const limit = Number(params?.limit ?? 10);
    return { success: true, data: FALLBACK_PRODUCTS_DATA.topSelling.slice(0, limit) };
  }

  if (method === 'get' && path === '/products/categories') {
    return { success: true, data: FALLBACK_PRODUCTS_DATA.categories };
  }

  if (method === 'get' && path === '/products/unsold') {
    return { success: true, data: FALLBACK_PRODUCTS_DATA.unsold };
  }

  // ── Finance ────────────────────────────────────────────────────
  if (method === 'get' && path === '/finances/revenue-vs-cash') {
    return { success: true, data: FALLBACK_FINANCE_DATA.revenueVsCash };
  }

  if (method === 'get' && path === '/finances/payments') {
    const page   = Number(params?.page  ?? 1);
    const limit  = Number(params?.limit ?? 20);
    const search = (params?.search ?? '').toLowerCase();
    const items  = FALLBACK_FINANCE_DATA.payments.items;
    const filtered = search
      ? items.filter((p) => p.customerName?.toLowerCase().includes(search))
      : items;
    const start = (page - 1) * limit;
    return {
      success: true,
      data: {
        items: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      },
    };
  }

  // ── Health check ───────────────────────────────────────────────
  if (method === 'get' && path === '/health') {
    return { success: true, status: 'MOCK', message: 'Mock mode active — backend bypassed' };
  }

  // Tidak ada mock untuk endpoint ini
  return null;
}
