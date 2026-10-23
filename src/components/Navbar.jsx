import { useLocation } from 'react-router-dom';
import { Bell, Search, RefreshCw } from 'lucide-react';
import BackendHealthBadge from '@/components/BackendHealthBadge';

const PAGE_TITLES = {
  '/':          { title: 'Dashboard',         subtitle: 'Overview & key metrics'           },
  '/sales':     { title: 'Sales Report',      subtitle: 'Orders, revenue & trends'         },
  '/customers': { title: 'Customers',         subtitle: 'Customer database & segmentation' },
  '/products':  { title: 'Product Catalog',   subtitle: 'Inventory & product performance'  },
  '/analytics': { title: 'Advanced Analytics',subtitle: 'Deep-dive SQL insights'           },
  '/settings':  { title: 'Settings',          subtitle: 'System configuration'             },
};

export default function Navbar() {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title: 'AxonApp', subtitle: '' };

  // Format tanggal sekarang
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <header className="top-navbar">
      {/* Left — Page title */}
      <div>
        <h1 className="text-base font-semibold text-white leading-tight">{page.title}</h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{page.subtitle}</p>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-3">
        {/* Backend API Health Status Indicator */}
        <BackendHealthBadge />

        {/* Date badge */}
        <span
          className="hidden sm:block text-xs px-3 py-1 rounded-full border"
          style={{
            color: 'var(--text-muted)',
            borderColor: 'var(--border-subtle)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {dateStr}
        </span>

        {/* Search button */}
        <button
          className="btn-ghost p-2"
          title="Search"
          aria-label="Search"
        >
          <Search size={16} />
        </button>

        {/* Refresh button */}
        <button
          className="btn-ghost p-2"
          title="Refresh data"
          aria-label="Refresh data"
        >
          <RefreshCw size={16} />
        </button>

        {/* Notifications */}
        <button
          className="relative btn-ghost p-2"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent-amber)' }}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: 'var(--border-subtle)' }} />

        {/* User avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          >
            AX
          </div>
        </div>
      </div>
    </header>
  );
}
