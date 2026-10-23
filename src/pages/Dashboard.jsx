import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Users,
  TrendingUp, RefreshCw, Briefcase,
} from 'lucide-react';
import {
  AreaChart, Area, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { StatCard } from '@/components/Card';
import ChartContainer, { CHART_COLORS, CHART_COLORS_ARRAY, chartTheme } from '@/components/ChartContainer';
import { SkeletonStatCard, SkeletonChart } from '@/components/Skeleton';
import ErrorAlert from '@/components/ErrorAlert';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { analyticsService, FALLBACK_ANALYTICS, getErrorMessage } from '@/services';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={chartTheme.tooltip.contentStyle} className="px-3 py-2">
      <p style={{ ...chartTheme.tooltip.labelStyle, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: 0 }}>
          {p.name === 'revenue' ? formatCurrency(p.value, true) : formatNumber(p.value)}{' '}
          {p.name !== 'revenue' && p.name}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Data states
  const [kpi, setKpi] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [customerDist, setCustomerDist] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');

  // Fetch all dashboard data from backend API
  const loadDashboardData = useCallback(async (isRefresh = false, year = selectedYear) => {
    if (isRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const trendParams = year !== 'All' ? { year: Number(year) } : undefined;

      // Panggil endpoints analitik secara paralel via service
      const [kpiRes, trendRes, distRes] = await Promise.allSettled([
        analyticsService.getKpi(),
        analyticsService.getSalesTrend(trendParams),
        analyticsService.getCustomerDistribution(),
      ]);

      let hasAnyError = false;
      let errorMsg = '';

      // 1. KPI Data
      if (kpiRes.status === 'fulfilled' && kpiRes.value?.data) {
        setKpi(kpiRes.value.data);
      } else {
        hasAnyError = true;
        errorMsg = getErrorMessage(kpiRes.reason);
      }

      // 2. Sales Trend Data
      if (trendRes.status === 'fulfilled' && trendRes.value?.data) {
        setSalesTrend(trendRes.value.data);
      } else {
        hasAnyError = true;
        errorMsg = errorMsg || getErrorMessage(trendRes.reason);
      }

      // 3. Customer Distribution Data
      if (distRes.status === 'fulfilled' && distRes.value?.data) {
        setCustomerDist(distRes.value.data);
      } else {
        hasAnyError = true;
        errorMsg = errorMsg || getErrorMessage(distRes.reason);
      }

      // Jika backend database remote mengembalikan error (misal migrasi tabel belum selesai),
      // aktifkan data fallback agar tampilan UI tetap bisa dieksplorasi
      if (hasAnyError) {
        setError(errorMsg);
        setIsUsingFallback(true);
        setKpi(FALLBACK_ANALYTICS.kpi);
        setSalesTrend(FALLBACK_ANALYTICS.salesTrend);
        setCustomerDist(FALLBACK_ANALYTICS.customerDistribution);
      } else {
        setIsUsingFallback(false);
      }
    } catch (err) {
      console.error('[Dashboard fetch error]', err);
      setError(getErrorMessage(err));
      setIsUsingFallback(true);
      setKpi(FALLBACK_ANALYTICS.kpi);
      setSalesTrend(FALLBACK_ANALYTICS.salesTrend);
      setCustomerDist(FALLBACK_ANALYTICS.customerDistribution);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="page-container">
      {/* ── Dashboard Page Header with Manual Refresh ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Executive Dashboard</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isUsingFallback
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isUsingFallback ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              {isUsingFallback ? 'Offline / Preview Mode' : 'Live API Connected'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time business performance & sales analytics from classicmodels database
          </p>
        </div>

        {/* Manual Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-dashboard"
            onClick={() => loadDashboardData(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-400' : 'text-slate-400'} />
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* ── Error Banner State ────────────────────────── */}
      {error && (
        <ErrorAlert
          title="Pemberitahuan Sinkronisasi API"
          message={error}
          onRetry={loadDashboardData}
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}

      {/* ── 1. KPI Stats Cards (GET /api/analytics/kpi) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={kpi?.totalRevenue ?? 0}
              format="currency"
              change={kpi?.revenueGrowth ?? 12.4}
              icon={DollarSign}
              accentColor="var(--accent-blue)"
              subtext="Accumulated Sales"
            />
            <StatCard
              title="Total Profit"
              value={kpi?.totalProfit ?? 0}
              format="currency"
              change={kpi?.orderGrowth ?? 8.7}
              icon={TrendingUp}
              accentColor="var(--accent-emerald)"
              subtext="Gross Profit margin"
            />
            <StatCard
              title="Total Customers"
              value={kpi?.totalCustomers ?? 0}
              format="number"
              change={kpi?.customerGrowth ?? -2.1}
              icon={Users}
              accentColor="var(--accent-amber)"
              subtext="Registered clients"
            />
            <StatCard
              title="Total Employees"
              value={kpi?.totalEmployees ?? 0}
              format="number"
              icon={Briefcase}
              accentColor="#8B5CF6"
              subtext="Global sales force"
            />
          </>
        )}
      </div>

      {/* ── 2. Sales Trend & Customer Distribution Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Sales Trend Chart (GET /api/analytics/sales-trend) */}
        {loading ? (
          <div className="xl:col-span-2">
            <SkeletonChart height={290} />
          </div>
        ) : (
          <ChartContainer
            title="Monthly Sales & Orders Trend"
            subtitle="GET /api/analytics/sales-trend"
            className="xl:col-span-2"
            height={290}
            action={
              <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
                {['All', '2003', '2004', '2005'].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => {
                      setSelectedYear(yr);
                      loadDashboardData(false, yr);
                    }}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedYear === yr
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            }
          >
            {salesTrend && salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...chartTheme.grid} />
                  <XAxis dataKey="month" tick={chartTheme.axis.tick} axisLine={false} tickLine={false} />
                  <YAxis
                    yAxisId="revenue"
                    tick={chartTheme.axis.tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    tick={chartTheme.axis.tick}
                    axisLine={false}
                    tickLine={false}
                  />
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
            ) : (
              <EmptyState title="Belum Ada Data Tren Penjualan" />
            )}
          </ChartContainer>
        )}

        {/* Customer Distribution by Country (GET /api/analytics/customer-distribution) */}
        {loading ? (
          <SkeletonChart height={290} />
        ) : (
          <ChartContainer
            title="Customer Distribution"
            subtitle="GET /api/analytics/customer-distribution"
            height={290}
          >
            {customerDist && customerDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={customerDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey={customerDist[0]?.customerCount !== undefined ? 'customerCount' : 'value'}
                      nameKey="country"
                    >
                      {customerDist.map((entry, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={CHART_COLORS_ARRAY[i % CHART_COLORS_ARRAY.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={chartTheme.tooltip.contentStyle}
                      formatter={(v, name) => [`${formatNumber(v)} customers`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Country Legend */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 max-h-24 overflow-y-auto pr-1">
                  {customerDist.slice(0, 6).map((item, i) => (
                    <div key={item.country || i} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: CHART_COLORS_ARRAY[i % CHART_COLORS_ARRAY.length] }}
                      />
                      <span className="truncate text-slate-400" title={item.country}>
                        {item.country}
                      </span>
                      <span className="ml-auto font-mono text-slate-300">
                        {item.customerCount ?? item.value ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="Tidak Ada Data Pelanggan" />
            )}
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
