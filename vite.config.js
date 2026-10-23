import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  server: {
    port: 5173,
    proxy: {
      /**
       * Proxy /api → backend (FALLBACK — hanya aktif jika VITE_USE_PROXY=true).
       * Mode default sekarang: Direct URL (Axios langsung ke VITE_API_BASE_URL).
       * Proxy tetap di-konfigurasi di sini sebagai cadangan jika CORS tiba-tiba
       * diblokir server, atau saat deploy ke environment tanpa akses langsung.
       */
      '/api': {
        target: 'https://axonbe.bgsprayogi.my.id',
        changeOrigin: true,
        secure: false,
        timeout: 30000,      // 30 s — socket timeout sisi client
        proxyTimeout: 30000, // 30 s — socket timeout sisi backend

        configure(proxy) {
          // Log setiap proxy request agar mudah di-debug di terminal
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log(`[Vite Proxy] → ${req.method} ${req.url}`);
          });

          // Tangani error soket (ETIMEDOUT, ECONNRESET, dll) agar Vite
          // tidak crash dan menampilkan pesan yang jelas di terminal
          proxy.on('error', (err, req, res) => {
            const code = err.code ?? 'UNKNOWN';
            console.error(`[Vite Proxy Error] ${code} on ${req.method} ${req.url} —`, err.message);

            // Kirim JSON error ke browser (bukan 502 HTML bawaan Vite)
            if (res && !res.headersSent) {
              res.writeHead(504, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                message: `Proxy error (${code}): tidak dapat menjangkau backend. Cek koneksi atau gunakan Direct URL mode.`,
                code,
              }));
            }
          });

          proxy.on('proxyRes', (proxyRes, req) => {
            console.log(`[Vite Proxy] ← ${proxyRes.statusCode} ${req.url}`);
          });
        },
      },
    },
  },
})
