import { Users, Search } from 'lucide-react';
import { Card } from '@/components/Card';
import { getInitials } from '@/utils/formatters';

const mockCustomers = [
  { id: 103, name: 'Atelier graphique',           country: 'France',     city: 'Nantes',        creditLimit: 21000,   rep: 'Gerard Hernandez' },
  { id: 112, name: 'Signal Gift Stores',           country: 'USA',        city: 'Las Vegas',     creditLimit: 71800,   rep: 'Leslie Thompson'  },
  { id: 114, name: 'Australian Collectors, Co.',   country: 'Australia',  city: 'Melbourne',     creditLimit: 117300,  rep: 'Peter Marsh'      },
  { id: 119, name: 'La Rochelle Gifts',            country: 'France',     city: 'Nantes',        creditLimit: 118200,  rep: 'Pamela Castillo'  },
  { id: 121, name: 'Baane Mini Imports',           country: 'Norway',     city: 'Stavern',       creditLimit: 81700,   rep: 'Barry Jones'      },
  { id: 124, name: 'Mini Gifts Distributors Ltd.', country: 'USA',        city: 'San Rafael',    creditLimit: 210500,  rep: 'Julie Firrelli'   },
  { id: 128, name: 'Blauer See Auto, Co.',         country: 'Germany',    city: 'Frankfurt',     creditLimit: 59700,   rep: 'Larry Bott'       },
  { id: 129, name: 'Mini Wheels Co.',              country: 'USA',        city: 'San Francisco', creditLimit: 64600,   rep: 'Foon Yue Tseng'   },
];

const creditClass = (limit) => {
  if (limit < 50000)  return { label: 'Low',    cls: 'badge-rose'    };
  if (limit < 100000) return { label: 'Medium', cls: 'badge-amber'   };
  return                     { label: 'High',   cls: 'badge-emerald' };
};

export default function CustomerList() {
  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="text-white font-medium">122</span> registered customers
        </p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border-subtle)' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search customers..."
            className="bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)', width: 180 }}
          />
        </div>
      </div>

      <Card title="Customer Database">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Location</th>
                <th>Credit Limit</th>
                <th>Credit Tier</th>
                <th>Sales Rep</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((c) => {
                const credit = creditClass(c.creditLimit);
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0"
                          style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}
                        >
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.city}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.country}</p>
                    </td>
                    <td className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                      ${c.creditLimit.toLocaleString()}
                    </td>
                    <td><span className={credit.cls}>{credit.label}</span></td>
                    <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.rep}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
