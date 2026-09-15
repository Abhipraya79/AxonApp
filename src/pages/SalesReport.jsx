import { TrendingUp, Download, Filter } from 'lucide-react';
import { Card } from '@/components/Card';
import { formatCurrency, formatDate } from '@/utils/formatters';

const mockOrders = [
  { orderNumber: 10100, customer: 'Online Diecast Creations Co.', orderDate: '2003-01-06', status: 'Shipped',    total: 10223.83 },
  { orderNumber: 10101, customer: 'Blauer See Auto, Co.',          orderDate: '2003-01-09', status: 'Shipped',    total: 10549.01 },
  { orderNumber: 10102, customer: 'Vitachrome Inc.',               orderDate: '2003-01-10', status: 'Shipped',    total:  5494.78 },
  { orderNumber: 10103, customer: 'Baane Mini Imports',            orderDate: '2003-01-29', status: 'Shipped',    total: 50218.95 },
  { orderNumber: 10104, customer: 'Euro+ Shopping Channel',        orderDate: '2003-01-31', status: 'Shipped',    total: 40206.20 },
  { orderNumber: 10105, customer: 'Royale Belge',                  orderDate: '2003-02-11', status: 'Shipped',    total: 51001.34 },
  { orderNumber: 10106, customer: 'Saveley & Henriot, Co.',        orderDate: '2003-02-17', status: 'Shipped',    total: 84926.41 },
  { orderNumber: 10107, customer: 'Dragon Souveniers, Ltd.',       orderDate: '2003-02-24', status: 'Shipped',    total: 44380.15 },
  { orderNumber: 10108, customer: 'Marseille Mini Autos',          orderDate: '2003-03-03', status: 'On Hold',    total: 43369.30 },
  { orderNumber: 10109, customer: 'Auto-Moto Classics Inc.',       orderDate: '2003-03-10', status: 'Cancelled',  total: 28372.40 },
];

const statusColors = {
  'Shipped':    'badge-emerald',
  'On Hold':    'badge-amber',
  'Cancelled':  'badge-rose',
  'Resolved':   'badge-blue',
  'Disputed':   'badge-rose',
  'In Process': 'badge-blue',
};

export default function SalesReport() {
  return (
    <div className="page-container">
      {/* Header actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Showing <span className="text-white font-medium">326</span> total orders · FY 2003–2005
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost">
            <Filter size={14} /> Filter
          </button>
          <button className="btn-primary">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <Card title="All Orders">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Status</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr key={order.orderNumber}>
                  <td>
                    <span className="font-mono text-xs" style={{ color: 'var(--accent-blue)' }}>
                      #{order.orderNumber}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-primary)' }}>{order.customer}</td>
                  <td className="font-mono text-xs">{formatDate(order.orderDate, 'short')}</td>
                  <td>
                    <span className={statusColors[order.status] || 'badge-blue'}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-right font-mono text-xs" style={{ color: 'var(--accent-emerald)' }}>
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
