import { Package, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/Card';
import { formatCurrency, truncate } from '@/utils/formatters';

const mockProducts = [
  { code: 'S18_3232', name: '1992 Ferrari 360 Spider red', line: 'Classic Cars',   stock: 8347,  msrp: 77.90,  price: 43.26 },
  { code: 'S18_1342', name: '1937 Lincoln Berline',         line: 'Vintage Cars',   stock: 8693,  msrp: 60.62,  price: 35.73 },
  { code: 'S12_1099', name: '1968 Ford Mustang',            line: 'Classic Cars',   stock: 68,    msrp: 194.57, price: 95.34 },
  { code: 'S10_1678', name: '1969 Harley Davidson Ultimate Chopper', line: 'Motorcycles', stock: 7933, msrp: 95.70, price: 48.81 },
  { code: 'S32_2206', name: '1982 Ducati 996 R',            line: 'Motorcycles',   stock: 9241,  msrp: 40.33,  price: 24.14 },
  { code: 'S72_3212', name: 'Pont Yacht',                   line: 'Ships',         stock: 414,   msrp: 54.60,  price: 33.30 },
  { code: 'S18_4409', name: '1932 Alfa Romeo 8C2300 Spider', line: 'Vintage Cars',  stock: 56,    msrp: 92.03,  price: 43.26 },
  { code: 'S24_3856', name: '1956 Porsche 356A Coupe',      line: 'Classic Cars',   stock: 6600,  msrp: 98.30,  price: 44.77 },
];

const lineColors = {
  'Classic Cars':   '#3B82F6',
  'Vintage Cars':   '#8B5CF6',
  'Motorcycles':    '#10B981',
  'Trucks & Buses': '#F59E0B',
  'Planes':         '#06B6D4',
  'Ships':          '#F43F5E',
};

export default function ProductCatalog() {
  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="text-white font-medium">110</span> products across 6 product lines
        </p>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
          <AlertTriangle size={13} />
          3 products low on stock
        </div>
      </div>

      <Card title="Product Catalog">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product Name</th>
                <th>Line</th>
                <th className="text-right">Stock</th>
                <th className="text-right">Buy Price</th>
                <th className="text-right">MSRP</th>
                <th className="text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((p) => {
                const margin = (((p.msrp - p.price) / p.msrp) * 100).toFixed(1);
                const isLowStock = p.stock < 100;
                return (
                  <tr key={p.code}>
                    <td>
                      <span className="font-mono text-xs" style={{ color: 'var(--accent-blue)' }}>
                        {p.code}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }} title={p.name}>
                        {truncate(p.name, 32)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge text-xs"
                        style={{
                          background: `${lineColors[p.line] || '#64748B'}18`,
                          color: lineColors[p.line] || '#64748B',
                        }}
                      >
                        {p.line}
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className="font-mono text-xs"
                        style={{ color: isLowStock ? 'var(--accent-rose)' : 'var(--text-primary)' }}
                      >
                        {isLowStock && <AlertTriangle size={11} className="inline mr-1" />}
                        {p.stock.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right font-mono text-xs">{formatCurrency(p.price)}</td>
                    <td className="text-right font-mono text-xs">{formatCurrency(p.msrp)}</td>
                    <td className="text-right">
                      <span className="font-mono text-xs" style={{ color: 'var(--accent-emerald)' }}>
                        {margin}%
                      </span>
                    </td>
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
