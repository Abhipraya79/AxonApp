/**
 * AxonApp — Centralized Axios API Client  (Triple-Mode)
 * ─────────────────────────────────────────────────────────────────────
 * Mode 1 — Vercel Proxy (auto-detect, produksi non-localhost):
 *   Axios memanggil /api/... → Vercel rewrites forward ke backend (server-side).
 *   → CORS tidak pernah terblokir karena request keluar dari server Vercel.
 *   → Aktif otomatis jika bukan localhost DAN VITE_USE_PROXY != 'true'.
 *
 * Mode 2 — Vite Proxy (VITE_USE_PROXY=true, development):
 *   Axios memanggil /api/... → Vite dev-server proxy forward ke backend.
 *   → Berguna saat development jika Direct URL diblokir CORS.
 *
 * Mode 3 — Direct URL (VITE_USE_PROXY=false, lokal default):
 *   Axios langsung memanggil https://axonbe.bgsprayogi.my.id/api/...
 *   → CORS harus di-allow oleh backend.
 *
 * Toggle di .env:
 *   VITE_USE_PROXY=false   # Direct URL (lokal, recommended)
 *   VITE_USE_PROXY=true    # Via Vite proxy (lokal fallback)
 *   # Di Vercel/produksi: Vercel Proxy otomatis digunakan
 */
import axios from 'axios';
import { USE_MOCK, MOCK_DELAY_MS, resolveMock } from './mockConfig';

// ── Retry configuration ───────────────────────────────────────────────
const MAX_RETRIES    = 2;    // jumlah maksimum retry setelah gagal
const RETRY_DELAY_MS = 1500; // jeda antar retry (ms)

/**
 * Menentukan Base URL berdasarkan env variables dan environment runtime.
 *
 * Priority:
 *  1. USE_MOCK aktif          → base URL tidak relevan (adapter override)
 *  2. VITE_USE_PROXY=true     → '/api'  (lewat Vite proxy, lokal)
 *  3. Bukan localhost         → '/api'  (lewat Vercel rewrites, produksi)
 *  4. VITE_USE_PROXY=false    → VITE_API_BASE_URL + '/api'  (direct, lokal)
 *  5. Tidak ada env sama sekali → direct ke hardcoded backend URL
 */
function resolveBaseUrl() {
  const useProxy  = import.meta.env.VITE_USE_PROXY === 'true';
  const isLocalhost = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost'
        || window.location.hostname === '127.0.0.1'
        || window.location.hostname === '0.0.0.0');

  // Mode Vite proxy (eksplisit, lokal dev)
  if (useProxy) {
    return '/api';
  }

  // Mode Vercel/produksi: gunakan path relatif agar Vercel rewrites berlaku
  // (server-side proxy → tidak ada CORS issue di browser)
  if (!isLocalhost) {
    return '/api';
  }

  // Mode direct (lokal, VITE_USE_PROXY=false)
  const rawBase   = import.meta.env.VITE_API_BASE_URL ?? 'https://axonbe.bgsprayogi.my.id';
  const cleanBase = rawBase.replace(/\/+$/, ''); // hapus trailing slash
  return cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;
}

/** True jika request dikirim via proxy (Vite dev proxy ATAU Vercel rewrites) */
function resolveIsProxy() {
  const useProxy  = import.meta.env.VITE_USE_PROXY === 'true';
  const isLocalhost = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost'
        || window.location.hostname === '127.0.0.1'
        || window.location.hostname === '0.0.0.0');
  return useProxy || !isLocalhost;
}

export const BASE_URL    = resolveBaseUrl();
export const IS_PROXY    = resolveIsProxy();
export const IS_VERCEL   = IS_PROXY && import.meta.env.VITE_USE_PROXY !== 'true';
export const BACKEND_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://axonbe.bgsprayogi.my.id';

console.info(
  `[AxonAPI] Mode: ${USE_MOCK ? '🟡 MOCK' : IS_VERCEL ? '☁️ Vercel Proxy' : IS_PROXY ? '🔀 Vite Proxy' : '🟢 Direct URL'} | baseURL: ${BASE_URL}`
);

// ── Axios instance ────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 s — lebih dari cukup untuk koneksi normal
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Helper internal: emit toast notification via Custom DOM Event.
 * UI layer listen ke window event 'axon:toast'.
 * Contoh listener di App.jsx:
 *   window.addEventListener('axon:toast', (e) => toast[e.detail.type](e.detail.message));
 */
function _emitToast(message, type = 'warning') {
  window.dispatchEvent(new CustomEvent('axon:toast', { detail: { message, type } }));
}

/** Jeda async sederhana */
const _sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 1. Request Interceptor ────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Normalisasi URL: Jika pemanggil mengirim URL yang diawali '/api',
    // hilangkan agar tidak menjadi dobel /api/api saat baseURL sudah '/api'
    if (config.url?.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    // Auth token
    const token = localStorage.getItem('axon_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Inisialisasi retry counter
    config._retryCount = config._retryCount ?? 0;

    // ── Mock Adapter ──────────────────────────────────────────────
    // Ketika USE_MOCK aktif, request tidak pernah keluar ke network.
    if (USE_MOCK) {
      config.adapter = async (cfg) => {
        const method   = (cfg.method ?? 'get').toLowerCase();
        const mockData = resolveMock(method, cfg.url ?? '', cfg.params);

        await _sleep(MOCK_DELAY_MS);

        if (mockData !== null) {
          return { data: mockData, status: 200, statusText: 'OK (Mock)', headers: {}, config: cfg };
        }

        console.warn(`[Mock] No handler for ${method.toUpperCase()} ${cfg.url}`);
        return {
          data: { success: false, message: `Mock not implemented: ${cfg.url}`, data: null },
          status: 200, statusText: 'OK (Mock — no handler)', headers: {}, config: cfg,
        };
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── 2. Response Interceptor (+ Retry logic) ───────────────────────────
apiClient.interceptors.response.use(
  // Sukses: unwrap envelope { success, data, message }
  (response) => response.data,

  async (error) => {
    const config     = error.config;
    const resData    = error.response?.data;
    const serverMsg  = resData?.message;
    const statusCode = error.response?.status;

    // ── Auto Retry untuk timeout / network error ──────────────────
    const isTimeout =
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'    ||
      error.message?.includes('timeout');
    const isNetworkError = error.code === 'ERR_NETWORK' || !error.response;

    if ((isTimeout || isNetworkError) && config && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;
      console.warn(
        `[AxonAPI] Retry ${config._retryCount}/${MAX_RETRIES} untuk ${config.method?.toUpperCase()} ${config.url}`
      );
      await _sleep(RETRY_DELAY_MS * config._retryCount); // backoff bertahap
      return apiClient(config);
    }

    // ── Buat pesan error yang ramah pengguna ─────────────────────
    let friendlyMessage = 'Terjadi kesalahan pada sistem.';

    if (serverMsg) {
      // Bersihkan pesan teknis Prisma ORM
      if (serverMsg.includes('does not exist') || serverMsg.includes('Invalid `prisma')) {
        friendlyMessage = `Database Schema Notice: ${serverMsg.split('\n')[0] || serverMsg}`;
      } else {
        friendlyMessage = serverMsg;
      }
    } else if (isTimeout) {
      friendlyMessage =
        `Koneksi ke server timeout setelah ${MAX_RETRIES} kali retry. ` +
        'Server mungkin sedang sibuk — coba beberapa saat lagi.';
      _emitToast(friendlyMessage, 'warning');
    } else if (isNetworkError) {
      if (IS_VERCEL) {
        friendlyMessage = 'Gagal terhubung ke backend via Vercel proxy. Periksa apakah backend aktif atau cek konfigurasi vercel.json.';
      } else if (IS_PROXY) {
        friendlyMessage = 'Gagal terhubung ke backend via Vite proxy. Cek koneksi internet atau coba Direct URL mode (VITE_USE_PROXY=false).';
      } else {
        friendlyMessage = 'Gagal terhubung langsung ke backend. Periksa koneksi internet atau CORS policy server.';
      }
      _emitToast(friendlyMessage, 'error');
    } else if (statusCode === 404) {
      friendlyMessage = 'Endpoint API tidak ditemukan (404).';
    } else if (statusCode === 401 || statusCode === 403) {
      friendlyMessage = 'Sesi tidak valid atau tidak memiliki izin akses (401/403).';
    } else if (statusCode >= 500) {
      friendlyMessage = `Server backend mengalami error (${statusCode}). Tim teknis telah dinotifikasi.`;
      _emitToast(friendlyMessage, 'error');
    }

    const customError         = new Error(friendlyMessage);
    customError.status        = statusCode;
    customError.success       = false;
    customError.rawMessage    = serverMsg || error.message;
    customError.stackTrace    = resData?.stack || null;
    customError.raw           = error;
    customError.isTimeout     = isTimeout;
    customError.isNetworkError = isNetworkError;
    customError.retryCount    = config?._retryCount ?? 0;

    console.error(`[AxonAPI Error] [${statusCode || error.code || 'Network'}]`, friendlyMessage, error);

    return Promise.reject(customError);
  }
);

// ── 3. Health Check ───────────────────────────────────────────────────
/**
 * Cek koneksi ke GET /api/health.
 * Gunakan ini di BackendHealthBadge atau halaman Settings.
 */
export async function checkBackendHealth() {
  const startTime = performance.now();
  try {
    const response = await apiClient.get('/health');
    const latency  = Math.round(performance.now() - startTime);
    return {
      online: response?.status === 'UP' || response?.success === true,
      status: response?.status || 'UP',
      message: response?.message || 'Backend is reachable',
      mode: USE_MOCK ? 'mock' : IS_VERCEL ? 'vercel-proxy' : IS_PROXY ? 'vite-proxy' : 'direct',
      uptime: response?.uptime ?? null,
      timestamp: response?.timestamp ?? new Date().toISOString(),
      latencyMs: latency,
    };
  } catch (err) {
    const latency = Math.round(performance.now() - startTime);
    return {
      online: false,
      status: 'DOWN',
      message: err.message || 'Tidak dapat terhubung ke /api/health',
      mode: USE_MOCK ? 'mock' : IS_VERCEL ? 'vercel-proxy' : IS_PROXY ? 'vite-proxy' : 'direct',
      uptime: null,
      timestamp: new Date().toISOString(),
      latencyMs: latency,
      error: err,
    };
  }
}

// ── 4. Error message extractor ────────────────────────────────────────
export function getErrorMessage(err) {
  if (typeof err === 'string') return err;
  return err?.message || err?.rawMessage || 'Terjadi kesalahan yang tidak terduga.';
}

export default apiClient;
