import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  BarChart3,
  Settings,
  ChevronRight,
  Gauge,
} from 'lucide-react';

const navItems = [
  {
    section: 'MAIN',
    links: [
      { to: '/',               icon: LayoutDashboard, label: 'Dashboard'        },
      { to: '/sales',          icon: TrendingUp,      label: 'Sales Report'     },
      { to: '/customers',      icon: Users,           label: 'Customers'        },
      { to: '/products',       icon: Package,         label: 'Product Catalog'  },
    ],
  },
  {
    section: 'ANALYTICS',
    links: [
      { to: '/analytics',      icon: BarChart3,       label: 'Advanced Analytics'},
    ],
  },
  {
    section: 'SYSTEM',
    links: [
      { to: '/settings',       icon: Settings,        label: 'Settings'         },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: 'var(--accent-blue)' }}>
          <Gauge size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-white">AXON</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Sales Analytics
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.section} className="mb-4">
            <p className="px-6 mb-1 text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {group.section}
            </p>
            {group.links.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={17} />
                <span className="flex-1">{label}</span>
                {location.pathname === to && (
                  <ChevronRight size={14} style={{ color: 'var(--accent-blue)' }} />
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          >
            AX
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">Axon Admin</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              classicmodels
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
