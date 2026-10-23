import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, CheckCircle2, AlertTriangle, ArrowUpRight,
  TrendingDown, RefreshCw, Search, ChevronLeft, ChevronRight,
  Calendar, CreditCard, ShieldAlert,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { StatCard, Card } from '@/components/Card';
import ChartContainer, { CHART_COLORS, chartTheme } from '@/components/ChartContainer';
import { SkeletonStatCard, SkeletonChart, SkeletonTable } from '@/components/Skeleton';
import ErrorAlert from '@/components/ErrorAlert';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { financeService, FALLBACK_FINANCE_DATA, getErrorMessage } from '@/services';

export default function Finance() {
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Data states
  const [financeOverview, setFinanceOverview] = useState(null);
  const [paymentsList, setPaymentsList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch paginated payments table
  const fetchPayments = useCallback(async (page, search) => {
    setTableLoading(true);
    try {
      const res = await financeService.getPayments({ page, limit: 10, search });
      if (res?.data) {
        const items = res.data.items || (Array.isArray(res.data) ? res.data : []);
        const meta = res.data.pagination || {
          page,
          limit: 10,
          total: items.length,
          totalPages: Math.max(1, Math.ceil(items.length / 10)),
        };
        setPaymentsList(items);
        setPagination(meta);
      }
    } catch (err) {
      console.warn('[Payments fetch error, fallback applied]', err);
      const allFallback = FALLBACK_FINANCE_DATA.payments.items;
      const filtered = search
        ? allFallback.filter(
            (p) =>
              (p.customerName && p.customerName.toLowerCase().includes(search.toLowerCase())) ||
              (p.checkNumber && p.checkNumber.toLowerCase().includes(search.toLowerCase())) ||
              String(p.customerNumber).includes(search)
          )
        : allFallback;

      const pageSize = 10;
      const startIndex = (page - 1) * pageSize;
      const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

      setPaymentsList(paginatedItems);
      setPagination({
        page,
        limit: pageSize,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
      });
    } finally {
      setTableLoading(false);
    }
  }, []);

  // Fetch initial/all finance data
  const loadFinanceData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    setError(null);

    try {
      const [revCashRes, paymentsRes] = await Promise.allSettled([
        financeService.getRevenueVsCash(),
        financeService.getPayments({ page: currentPage, limit: 10, search: debouncedSearch }),
      ]);

      let hasError = false;
      let errorMsg = '';

      // 1. Revenue vs Cash Data
      if (revCashRes.status === 'fulfilled' && revCashRes.value?.data) {
        setFinanceOverview(revCashRes.value.data);
      } else {
        hasError = true;
        errorMsg = getErrorMessage(revCashRes.reason);
      }

      // 2. Payments Data
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.data) {
        const raw = paymentsRes.value.data;
        const items = raw.items || (Array.isArray(raw) ? raw : []);
        setPaymentsList(items);
        setPagination(
          raw.pagination || {
            page: currentPage,
            limit: 10,
            total: items.length,
            totalPages: Math.max(1, Math.ceil(items.length / 10)),
          }
        );
      } else {
        hasError = true;
        errorMsg = errorMsg || getErrorMessage(paymentsRes.reason);
      }

      // Handle backend database error
      if (hasError) {
        setError(errorMsg);
        setIsUsingFallback(true);
        setFinanceOverview(FALLBACK_FINANCE_DATA.revenueVsCash);
        setPaymentsList(FALLBACK_FINANCE_DATA.payments.items.slice(0, 10));
        setPagination(FALLBACK_FINANCE_DATA.payments.pagination);
      } else {
        setIsUsingFallback(false);
      }
    } catch (err) {
      console.error('[Finance load error]', err);
      setError(getErrorMessage(err));
      setIsUsingFallback(true);
      setFinanceOverview(FALLBACK_FINANCE_DATA.revenueVsCash);
      setPaymentsList(FALLBACK_FINANCE_DATA.payments.items.slice(0, 10));
      setPagination(FALLBACK_FINANCE_DATA.payments.pagination);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    fetchPayments(newPage, debouncedSearch);
  };

  // Metrik Finansial
  const expectedRevenue = financeOverview?.expectedRevenue ?? 0;
  const actualCash = financeOverview?.actualCash ?? 0;
  const difference = financeOverview?.difference ?? 0;
  const collectionRate = Number((financeOverview?.collectionRate ?? 0).toFixed(2));
  const isRateCritical = collectionRate < 80;

  // Data untuk Semi-Circle Gauge Chart
  const gaugeData = [
    { name: 'Collected', value: Math.min(100, collectionRate), color: isRateCritical ? '#F43F5E' : '#10B981' },
    { name: 'Remaining Gap', value: Math.max(0, 100 - collectionRate), color: 'rgba(51, 65, 85, 0.4)' },
  ];

  return (
    <div className="page-container">
      {/* ── Page Header with Actions ──────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Finance & Cash Flow</h1>
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
            Cash reconciliation, collection efficiency rate, and incoming customer payments ledger
          </p>
        </div>

        {/* Manual Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-finance"
            onClick={() => loadFinanceData(true)}
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
          title="Pemberitahuan Sinkronisasi API Finance"
          message={error}
          onRetry={() => loadFinanceData(true)}
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}

      {/* ── Conditional Alert: Collection Rate < 80% ─── */}
      {isRateCritical ? (
        <div className="mb-6 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 to-slate-900/40 p-4 text-rose-200 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 flex-shrink-0 mt-0.5">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-rose-100">
                  🚨 Critical Warning: Collection Rate Rendah ({collectionRate}%)
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                  &lt; 80% TARGET
                </span>
              </div>
              <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                Tingkat konversi piutang menjadi uang tunai berada di bawah ambang batas aman (80%).
                Terdapat <strong className="text-white font-mono">{formatCurrency(difference, true)}</strong> dana
                tertahan di pelanggan. Segera prioritaskan rekonsiliasi invoice dan dunning follow-up.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-emerald-200 font-medium">
              <strong>Healthy Collection Status:</strong> Rasio penagihan kas saat ini mencapai{' '}
              <span className="font-mono font-bold text-emerald-300">{collectionRate}%</span> (Melampaui target minimum 80%).
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Optimal Liquidity
          </span>
        </div>
      )}

      {/* ── 1. 4 KPI Cards (GET /api/finances/revenue-vs-cash) ── */}
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
              title="Expected Revenue"
              value={expectedRevenue}
              format="currency"
              icon={DollarSign}
              accentColor="var(--accent-blue)"
              subtext="Total value invoiced"
            />
            <StatCard
              title="Actual Cash"
              value={actualCash}
              format="currency"
              icon={CheckCircle2}
              accentColor="var(--accent-emerald)"
              subtext="Cash successfully collected"
            />
            <StatCard
              title="Difference (Outstanding)"
              value={difference}
              format="currency"
              icon={difference > 0 ? AlertTriangle : ArrowUpRight}
              accentColor={difference > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)'}
              subtext="Uncollected receivables gap"
            />
            <StatCard
              title="Collection Rate"
              value={`${collectionRate}%`}
              format="plain"
              icon={isRateCritical ? TrendingDown : ArrowUpRight}
              accentColor={isRateCritical ? 'var(--accent-rose)' : 'var(--accent-emerald)'}
              subtext={isRateCritical ? 'Below 80% threshold' : 'Target reached (≥80%)'}
            />
          </>
        )}
      </div>

      {/* ── 2. Gauge Chart & Cash Breakdown ───────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Semi-Circle Gauge Chart for Collection Rate */}
        {loading ? (
          <SkeletonChart height={280} />
        ) : (
          <ChartContainer
            title="Collection Rate Efficiency"
            subtitle="Cash in hand vs Billed Revenue Target"
            height={280}
          >
            <div className="flex flex-col items-center justify-center h-full relative">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="75%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={`gauge-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Gauge Center Metric */}
              <div className="absolute top-[52%] flex flex-col items-center">
                <span
                  className="text-3xl font-bold font-mono tracking-tight"
                  style={{ color: isRateCritical ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}
                >
                  {collectionRate}%
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  {isRateCritical ? 'Critical Lag' : 'Healthy Target'}
                </span>
              </div>

              {/* Progress Bar & Subtext */}
              <div className="w-full px-4 mt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                  <span>0%</span>
                  <span className="text-amber-400">Target: 80%</span>
                  <span>100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                  <div
                    className={`h-full transition-all duration-700 ${
                      isRateCritical ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, collectionRate)}%` }}
                  />
                </div>
              </div>
            </div>
          </ChartContainer>
        )}

        {/* Monthly Revenue vs Cash Breakdown Bar Chart */}
        {loading ? (
          <div className="xl:col-span-2">
            <SkeletonChart height={280} />
          </div>
        ) : (
          <ChartContainer
            title="Monthly Revenue vs Actual Cash Inflow"
            subtitle="GET /api/finances/revenue-vs-cash"
            className="xl:col-span-2"
            height={280}
          >
            {financeOverview?.monthlyBreakdown && financeOverview.monthlyBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={financeOverview.monthlyBreakdown}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid {...chartTheme.grid} />
                  <XAxis dataKey="month" tick={chartTheme.axis.tick} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={chartTheme.axis.tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={chartTheme.tooltip.contentStyle}
                    formatter={(val, name) => [
                      formatCurrency(val, true),
                      name === 'revenue' ? 'Billed Revenue' : 'Cash Collected',
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: 12, fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" name="Billed Revenue" fill={CHART_COLORS.blue} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="cash" name="Cash Inflow" fill={CHART_COLORS.emerald} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="Belum Ada Data Arus Kas Bulanan" />
            )}
          </ChartContainer>
        )}
      </div>

      {/* ── 3. Payments Ledger Table (GET /api/finances/payments) ── */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <CreditCard size={17} className="text-emerald-400" />
            <span>Payments History Ledger (GET /api/finances/payments)</span>
          </div>
        }
        action={
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              id="input-payment-search"
              type="text"
              placeholder="Cari customer, cek, atau nomor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 sm:w-72 pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900/80 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        }
      >
        {tableLoading ? (
          <SkeletonTable rows={8} cols={4} />
        ) : paymentsList.length === 0 ? (
          <EmptyState
            title="Tidak Ada Riwayat Pembayaran"
            description={
              searchQuery
                ? `Tidak ada transaksi pembayaran yang cocok dengan kata kunci "${searchQuery}".`
                : 'Belum ada catatan pembayaran yang tercatat.'
            }
            actionLabel={searchQuery ? 'Reset Pencarian' : 'Muat Ulang'}
            onAction={() => {
              if (searchQuery) setSearchQuery('');
              else loadFinanceData(true);
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Check Number</th>
                    <th>Customer Name</th>
                    <th>Customer #</th>
                    <th>Payment Date</th>
                    <th className="text-right">Payment Amount</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsList.map((p, idx) => {
                    const check = p.checkNumber || '—';
                    const name = p.customerName || `Customer #${p.customerNumber}`;
                    const custNo = p.customerNumber;
                    const date = p.paymentDate;
                    const amount = p.amount;

                    return (
                      <tr key={`${check}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                        <td>
                          <span className="font-mono text-xs font-semibold text-emerald-400">
                            {check}
                          </span>
                        </td>
                        <td className="font-medium text-slate-200">
                          <span className="block truncate max-w-xs" title={name}>
                            {name}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-slate-400">
                            #{custNo}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Calendar size={12} className="text-slate-500" />
                            <span>{formatDate(date, 'medium')}</span>
                          </div>
                        </td>
                        <td className="text-right">
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {formatCurrency(amount)}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <CheckCircle2 size={11} />
                            Settled
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Controls ─────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">
                Menampilkan <span className="font-mono text-slate-200">{paymentsList.length}</span> dari{' '}
                <span className="font-mono text-slate-200">{pagination.total}</span> transaksi (Halaman{' '}
                <span className="font-mono text-slate-200">{pagination.page}</span> dari{' '}
                <span className="font-mono text-slate-200">{pagination.totalPages}</span>)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  id="btn-prev-payment-page"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={13} />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, idx) => {
                    let pageNum = idx + 1;
                    if (pagination.totalPages > 5 && pagination.page > 3) {
                      pageNum = Math.min(
                        pagination.totalPages - 4 + idx,
                        Math.max(1, pagination.page - 2 + idx)
                      );
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                            : 'bg-slate-800/60 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  id="btn-next-payment-page"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
