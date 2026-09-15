import {
  DollarSign, ShoppingCart, Users, Package,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { StatCard, Card } from '@/components/Card';
import ChartContainer, { CHART_COLORS, chartTheme } from '@/components/ChartContainer';
import { formatCurrency } from '@/utils/formatters';

// ── Mock data (replace with API calls when backend is ready) ──────────────
const revenueData = [
  { month: 'Jan', revenue: 224000, orders: 38 },
  { month: 'Feb', revenue: 189000, orders: 31 },
  { month: 'Mar', revenue: 312000, orders: 54 },
  { month: 'Apr', revenue: 278000, orders: 47 },
  { month: 'May', revenue: 345000, orders: 62 },
  { month: 'Jun', revenue: 398000, orders: 71 },
  { month: 'Jul', revenue: 421000, orders: 78 },
  { month: 'Aug', revenue: 367000, orders: 65 },
  { month: 'Sep', revenue: 452000, orders: 83 },
  { month: 'Oct', revenue: 489000, orders: 91 },
  { month: 'Nov', revenue: 531000, orders: 97 },
  { month: 'Dec', revenue: 612000, orders: 112 },
];

const productLineData = [
  { name: 'Classic Cars',    value: 38.5, color: CHART_COLORS.blue    },
  { name: 'Vintage Cars',    value: 21.2, color: CHART_COLORS.violet  },
  { name: 'Motorcycles',     value: 14.8, color: CHART_COLORS.emerald },
  { name: 'Trucks & Buses',  value: 11.3, color: CHART_COLORS.amber   },
  { name: 'Planes',          value:  8.7, color: CHART_COLORS.cyan    },
  { name: 'Ships',           value:  5.5, color: CHART_COLORS.rose    },
];

const topProducts = [
  { name: '1992 Ferrari 360 Spider red', sold: 1808, revenue: 276839 },
  { name: '2001 Ferrari Enzo',           sold: 1645, revenue: 190755 },
  { name: '1952 Alpine Renault 1300',    sold: 1384, revenue: 190017 },
  { name: '2003 Harley-Davidson Eagle',  sold: 1382, revenue: 170686 },
  { name: '1968 Dodge Charger',          sold: 1310, revenue: 160194 },
];

const orderStatusData = [
  { name: 'Shipped',   count: 303, color: CHART_COLORS.emerald },
  { name: 'Resolved',  count:  47, color: CHART_COLORS.blue    },
  { name: 'Cancelled', count:  16, color: CHART_COLORS.rose    },
  { name: 'On Hold',   count:  14, color: CHART_COLORS.amber   },
  { name: 'Disputed',  count:  14, color: CHART_COLORS.violet  },
  { name: 'In Process',count:  17, color: CHART_COLORS.cyan    },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={chartTheme.tooltip.contentStyle} className="px-3 py-2">
      <p style={{ ...chartTheme.tooltip.labelStyle, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: 0 }}>
          {p.name === 'revenue' ? formatCurrency(p.value, true) : p.value} {p.name !== 'revenue' && 'orders'}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="page-container">
      {/* ── KPI Stats ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={9604190.61}
          format="currency"
          change={12.4}
          icon={DollarSign}
          accentColor="var(--accent-blue)"
          subtext="FY 2003–2005"
        />
        <StatCard
          title="Total Orders"
          value={326}
          format="number"
          change={8.7}
          icon={ShoppingCart}
          accentColor="var(--accent-emerald)"
          subtext="All time"
        />
        <StatCard
          title="Customers"
          value={122}
          format="number"
          change={-2.1}
          icon={Users}
          accentColor="var(--accent-amber)"
          subtext="Active accounts"
        />
        <StatCard
          title="Products"
          value={110}
          format="number"
          icon={Package}
          accentColor="#8B5CF6"
          subtext="6 product lines"
        />
      </div>

      {/* ── Revenue Area Chart + Pie Chart ──────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <ChartContainer
          title="Monthly Revenue & Orders"
          subtitle="Full year trend overview"
          className="xl:col-span-2"
          height={290}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={CHART_COLORS.blue} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid {...chartTheme.grid} />
              <XAxis dataKey="month" tick={chartTheme.axis.tick} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="revenue"
                tick={chartTheme.axis.tick}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`}
              />
              <YAxis yAxisId="orders" orientation="right" tick={chartTheme.axis.tick} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke={CHART_COLORS.blue}
                strokeWidth={2}
                fill="url(#gradRevenue)"
                dot={false}
                activeDot={{ r: 5, fill: CHART_COLORS.blue }}
              />
              <Bar
                yAxisId="orders"
                dataKey="orders"
                name="orders"
                fill={CHART_COLORS.violet}
                fillOpacity={0.4}
                radius={[3, 3, 0, 0]}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Revenue by Product Line" height={290}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={productLineData}
                cx="50%"
                cy="48%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {productLineData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTheme.tooltip.contentStyle}
                formatter={(v) => [`${v}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {productLineData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {item.name}
                </span>
                <span className="text-xs ml-auto font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>

      {/* ── Top Products + Order Status ──────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top Products Table */}
        <Card title="Top 5 Products by Revenue">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th className="text-right">Units</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i}>
                  <td>
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold"
                      style={{
                        background: i === 0 ? 'rgba(251,191,36,0.15)' : 'rgba(51,65,85,0.5)',
                        color: i === 0 ? 'var(--accent-amber)' : 'var(--text-muted)',
                      }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="font-medium" style={{ color: 'var(--text-primary)', maxWidth: 200 }}>
                    <span className="block truncate" title={p.name}>{p.name}</span>
                  </td>
                  <td className="text-right font-mono text-xs">{p.sold.toLocaleString()}</td>
                  <td className="text-right font-mono text-xs" style={{ color: 'var(--accent-emerald)' }}>
                    {formatCurrency(p.revenue, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Order Status */}
        <Card title="Order Status Breakdown">
          <ChartContainer height={200} className="border-0 shadow-none p-0 bg-transparent">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid horizontal={false} {...chartTheme.grid} />
                <XAxis type="number" tick={chartTheme.axis.tick} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={chartTheme.axis.tick} axisLine={false} tickLine={false} width={75} />
                <Tooltip
                  contentStyle={chartTheme.tooltip.contentStyle}
                  cursor={chartTheme.tooltip.cursor}
                />
                <Bar dataKey="count" name="Orders" radius={[0, 4, 4, 0]}>
                  {orderStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {orderStatusData.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center justify-center p-2 rounded-lg text-center"
                style={{ background: `${item.color}10` }}
              >
                <span className="text-lg font-bold font-mono" style={{ color: item.color }}>
                  {item.count}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
