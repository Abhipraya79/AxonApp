/**
 * MockBanner — Status bar ditampilkan saat USE_MOCK aktif.
 * Memberi sinyal visual jelas bahwa app sedang berjalan dengan data lokal,
 * bukan data real dari backend.
 */
import { USE_MOCK } from '@/services/mockConfig';

export default function MockBanner() {
  if (!USE_MOCK) return null;

  return (
    <div
      id="mock-mode-banner"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '7px 16px',
        background: 'linear-gradient(90deg, #92400e 0%, #78350f 50%, #92400e 100%)',
        backgroundSize: '200% 100%',
        animation: 'mockBannerShimmer 4s ease infinite',
        borderBottom: '1px solid rgba(251,191,36,0.35)',
        fontSize: '12px',
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        fontWeight: 500,
        letterSpacing: '0.04em',
        color: '#fde68a',
        userSelect: 'none',
        boxShadow: '0 1px 12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Pulsing dot */}
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#fbbf24',
          flexShrink: 0,
          animation: 'mockDotPulse 1.4s ease-in-out infinite',
          boxShadow: '0 0 0 0 rgba(251,191,36,0.7)',
        }}
      />

      <span>
        ⚠ MOCK DATA MODE —{' '}
        <strong style={{ color: '#fef3c7' }}>Backend Offline / Bypassed</strong>
        {' '}· Data yang ditampilkan adalah data lokal, bukan data real.
      </span>

      <span
        style={{
          marginLeft: 8,
          padding: '1px 8px',
          borderRadius: 99,
          border: '1px solid rgba(251,191,36,0.4)',
          background: 'rgba(251,191,36,0.1)',
          fontSize: 10,
          color: '#fcd34d',
          whiteSpace: 'nowrap',
        }}
      >
        Set USE_MOCK = false di mockConfig.js untuk Live Mode
      </span>

      <style>{`
        @keyframes mockBannerShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes mockDotPulse {
          0%   { box-shadow: 0 0 0 0 rgba(251,191,36,0.7); }
          70%  { box-shadow: 0 0 0 6px rgba(251,191,36,0); }
          100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
        }
      `}</style>
    </div>
  );
}
