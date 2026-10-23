import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package, AlertTriangle, Search, RefreshCw,
  Layers, AlertCircle, ChevronLeft, ChevronRight,
  Flame, ShieldAlert,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Card } from '@/components/Card';
import ChartContainer, { CHART_COLORS, CHART_COLORS_ARRAY, chartTheme } from '@/components/ChartContainer';
import { SkeletonChart, SkeletonTable } from '@/components/Skeleton';
import ErrorAlert from '@/components/ErrorAlert';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, formatNumber, truncate } from '@/utils/formatters';
import { productsService, FALLBACK_PRODUCTS_DATA, getErrorMessage } from '@/services';

const LINE_COLORS = {
  'Classic Cars':   '#3B82F6',
  'Vintage Cars':   '#8B5CF6',
  'Motorcycles':    '#10B981',
  'Trucks & Buses': '#F59E0B',
  'Planes':         '#06B6D4',
  'Ships':          '#F43F5E',
  'Trains':         '#EC4899',
};

export default function ProductCatalog() {
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Data states
  const [productsList, setProductsList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [topSelling, setTopSelling] = useState([]);
  const [categories, setCategories] = useState([]);
  const [unsold, setUnsold] = useState([]);

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1); // Reset ke page 1 saat ganti kata kunci
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch paginated products only (digunakan saat pagination / search berubah)
  const fetchProductsPage = useCallback(async (page, search) => {
    setTableLoading(true);
    try {
      const res = await productsService.getProducts({ page, limit: 10, search });
      if (res?.data) {
        // Backend bisa mengembalikan { items: [], pagination: {} } atau langsung array
        const items = res.data.items || (Array.isArray(res.data) ? res.data : []);
        const meta = res.data.pagination || {
          page,
          limit: 10,
          total: items.length,
          totalPages: Math.max(1, Math.ceil(items.length / 10)),
        };
        setProductsList(items);
        setPagination(meta);
      }
    } catch (err) {
      console.warn('[Products page fetch error, using fallback filter]', err);
      // Filter dari fallback data untuk pengalaman offline/preview yang mulus
      const allFallback = FALLBACK_PRODUCTS_DATA.products.items;
      const filtered = search
        ? allFallback.filter(
            (p) =>
              p.productName.toLowerCase().includes(search.toLowerCase()) ||
              p.productCode.toLowerCase().includes(search.toLowerCase()) ||
              p.productLine.toLowerCase().includes(search.toLowerCase())
          )
        : allFallback;

      const pageSize = 10;
      const startIndex = (page - 1) * pageSize;
      const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

      setProductsList(paginatedItems);
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

  // Fetch all products data (katalog, top selling, kategori, unsold)
  const loadAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    setError(null);

    try {
      const [productsRes, topRes, catRes, unsoldRes] = await Promise.allSettled([
        productsService.getProducts({ page: currentPage, limit: 10, search: debouncedSearch }),
        productsService.getTopSelling(10),
        productsService.getCategories(),
        productsService.getUnsold(),
      ]);

      let hasError = false;
      let errorMsg = '';

      // 1. Paginated Products
      if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
        const raw = productsRes.value.data;
        const items = raw.items || (Array.isArray(raw) ? raw : []);
        setProductsList(items);
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
        errorMsg = getErrorMessage(productsRes.reason);
      }

      // 2. Top Selling Products
      if (topRes.status === 'fulfilled' && topRes.value?.data) {
        setTopSelling(topRes.value.data);
      } else {
        hasError = true;
        errorMsg = errorMsg || getErrorMessage(topRes.reason);
      }

      // 3. Category Performance
      if (catRes.status === 'fulfilled' && catRes.value?.data) {
        setCategories(catRes.value.data);
      } else {
        hasError = true;
        errorMsg = errorMsg || getErrorMessage(catRes.reason);
      }

      // 4. Unsold / Dead Stock
      if (unsoldRes.status === 'fulfilled' && unsoldRes.value?.data) {
        setUnsold(unsoldRes.value.data);
      } else {
        hasError = true;
        errorMsg = errorMsg || getErrorMessage(unsoldRes.reason);
      }

      // Jika remote backend Prisma database belum migrasi, aktifkan fallback data
      if (hasError) {
        setError(errorMsg);
        setIsUsingFallback(true);
        setProductsList(FALLBACK_PRODUCTS_DATA.products.items.slice(0, 10));
        setPagination(FALLBACK_PRODUCTS_DATA.products.pagination);
        setTopSelling(FALLBACK_PRODUCTS_DATA.topSelling);
        setCategories(FALLBACK_PRODUCTS_DATA.categories);
        setUnsold(FALLBACK_PRODUCTS_DATA.unsold);
      } else {
        setIsUsingFallback(false);
      }
    } catch (err) {
      console.error('[Products load error]', err);
      setError(getErrorMessage(err));
      setIsUsingFallback(true);
      setProductsList(FALLBACK_PRODUCTS_DATA.products.items.slice(0, 10));
      setPagination(FALLBACK_PRODUCTS_DATA.products.pagination);
      setTopSelling(FALLBACK_PRODUCTS_DATA.topSelling);
      setCategories(FALLBACK_PRODUCTS_DATA.categories);
      setUnsold(FALLBACK_PRODUCTS_DATA.unsold);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  // Load awal saat mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Trigger paginasi atau search hanya untuk tabel
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    fetchProductsPage(newPage, debouncedSearch);
  };

  // Hitung total potensi kapital dead stock
  const deadStockCapital = useMemo(() => {
    return unsold.reduce((acc, item) => {
      const stock = item.quantityInStock ?? item.stock ?? 0;
      const price = item.buyPrice ?? item.price ?? 0;
      return acc + stock * price;
    }, 0);
  }, [unsold]);

  return (
    <div className="page-container">
      {/* ── Page Header with Actions ──────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Products & Inventory</h1>
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
            Real-time catalog analytics, best-selling SKUs, category distribution & dead stock surveillance
          </p>
        </div>

        {/* Refresh button */}
        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-products"
            onClick={() => loadAllData(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-400' : 'text-slate-400'} />
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────── */}
      {error && (
        <ErrorAlert
          title="Pemberitahuan Sinkronisasi API Produk"
          message={error}
          onRetry={() => loadAllData(true)}
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}

      {/* ── Quick Summary Cards ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Total SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <p className="stat-value text-blue-400">{pagination.total || 110}</p>
          <p className="text-xs text-slate-400 mt-1">Across 7 product lines</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Top Selling Item</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <p className="text-sm font-semibold text-emerald-400 truncate mt-1" title={topSelling[0]?.productName}>
            {topSelling[0]?.productName || '1992 Ferrari 360 Spider'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {formatNumber(topSelling[0]?.totalSold || 1808)} units sold
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Categories Tracked</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <p className="stat-value text-purple-400">{categories.length || 6}</p>
          <p className="text-xs text-slate-400 mt-1">Active product lines</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Dead Stock Alert</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
          </div>
          <p className="stat-value text-rose-400">{unsold.length} SKUs</p>
          <p className="text-xs text-slate-400 mt-1">
            {formatCurrency(deadStockCapital, true)} locked capital
          </p>
        </div>
      </div>

      {/* ── Charts: Top 10 Selling & Category Performance ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Top 10 Selling Products Horizontal Chart */}
        {loading ? (
          <div className="xl:col-span-2">
            <SkeletonChart height={320} />
          </div>
        ) : (
          <ChartContainer
            title="Top 10 Best-Selling Products"
            subtitle="GET /api/products/top-selling?limit=10"
            className="xl:col-span-2"
            height={320}
          >
            {topSelling && topSelling.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSelling.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid horizontal={false} {...chartTheme.grid} />
                  <XAxis
                    type="number"
                    tick={chartTheme.axis.tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatNumber(v)}
                  />
                  <YAxis
                    dataKey="productName"
                    type="category"
                    tick={chartTheme.axis.tick}
                    axisLine={false}
                    tickLine={false}
                    width={150}
                    tickFormatter={(name) => truncate(name, 20)}
                  />
                  <Tooltip
                    contentStyle={chartTheme.tooltip.contentStyle}
                    formatter={(val, name) => [
                      name === 'totalRevenue' ? formatCurrency(val, true) : `${formatNumber(val)} units`,
                      name === 'totalRevenue' ? 'Revenue' : 'Units Sold',
                    ]}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="totalSold" name="Units Sold" radius={[0, 4, 4, 0]}>
                    {topSelling.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? '#F59E0B' // Gold
                            : index === 1
                            ? '#94A3B8' // Silver
                            : index === 2
                            ? '#B45309' // Bronze
                            : CHART_COLORS.blue
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="Belum Ada Data Produk Terlaris" />
            )}
          </ChartContainer>
        )}

        {/* Product Category Performance */}
        {loading ? (
          <SkeletonChart height={320} />
        ) : (
          <ChartContainer
            title="Revenue per Product Line"
            subtitle="GET /api/products/categories"
            height={320}
          >
            {categories && categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 5, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid {...chartTheme.grid} />
                  <XAxis
                    dataKey="productLine"
                    tick={chartTheme.axis.tick}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={chartTheme.axis.tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={chartTheme.tooltip.contentStyle}
                    formatter={(val) => [formatCurrency(val, true), 'Revenue']}
                  />
                  <Bar dataKey="totalRevenue" name="Revenue" radius={[4, 4, 0, 0]}>
                    {categories.map((entry, idx) => (
                      <Cell
                        key={`cat-cell-${idx}`}
                        fill={LINE_COLORS[entry.productLine] || CHART_COLORS_ARRAY[idx % CHART_COLORS_ARRAY.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="Tidak Ada Data Kategori" />
            )}
          </ChartContainer>
        )}
      </div>

      {/* ── Dead Stock / Unsold Alert Warning Table ──── */}
      <div className="mb-6">
        <Card
          title={
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle size={18} />
              <span>Dead Stock & Unsold Products Alert (GET /api/products/unsold)</span>
            </div>
          }
          action={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Action Required: {unsold.length} SKUs Stagnant
            </span>
          }
          className="border-rose-500/30 bg-rose-950/10"
        >
          {loading ? (
            <SkeletonTable rows={3} cols={5} />
          ) : unsold.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Semua SKU memiliki riwayat penjualan aktif (Tidak ada Dead Stock).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th className="text-right">Stock in Warehouse</th>
                    <th className="text-right">Unit Buy Price</th>
                    <th className="text-right">Locked Capital</th>
                    <th className="text-center">Surveillance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {unsold.map((p) => {
                    const code = p.productCode || p.code;
                    const name = p.productName || p.name;
                    const line = p.productLine || p.line;
                    const stock = p.quantityInStock ?? p.stock ?? 0;
                    const price = p.buyPrice ?? p.price ?? 0;
                    const locked = stock * price;

                    return (
                      <tr key={code} className="hover:bg-rose-500/5 transition-colors">
                        <td className="font-mono text-xs text-rose-400 font-semibold">{code}</td>
                        <td className="font-medium text-slate-200">
                          <span className="block truncate max-w-xs" title={name}>
                            {name}
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge text-xs"
                            style={{
                              background: `${LINE_COLORS[line] || '#64748B'}18`,
                              color: LINE_COLORS[line] || '#64748B',
                            }}
                          >
                            {line}
                          </span>
                        </td>
                        <td className="text-right font-mono text-xs text-slate-200 font-medium">
                          {formatNumber(stock)} units
                        </td>
                        <td className="text-right font-mono text-xs text-slate-400">
                          {formatCurrency(price)}
                        </td>
                        <td className="text-right font-mono text-xs text-rose-300 font-bold">
                          {formatCurrency(locked)}
                        </td>
                        <td className="text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <AlertCircle size={11} />
                            No Orders / Stagnant
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Master Product Catalog Table ─────────────── */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Package size={17} className="text-blue-400" />
            <span>Master Product Catalog (GET /api/products)</span>
          </div>
        }
        action={
          <div className="flex items-center gap-3">
            {/* Search Input Box */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                id="input-product-search"
                type="text"
                placeholder="Cari kode, nama, atau kategori..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-56 sm:w-72 pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900/80 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        }
      >
        {tableLoading ? (
          <SkeletonTable rows={8} cols={7} />
        ) : productsList.length === 0 ? (
          <EmptyState
            title="Tidak Ada Produk Ditemukan"
            description={
              searchInput
                ? `Tidak ada produk yang cocok dengan kata kunci "${searchInput}".`
                : 'Belum ada produk yang terdaftar di database.'
            }
            actionLabel={searchInput ? 'Reset Pencarian' : 'Muat Ulang'}
            onAction={() => {
              if (searchInput) setSearchInput('');
              else loadAllData(true);
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Product Name</th>
                    <th>Product Line</th>
                    <th className="text-right">Stock</th>
                    <th className="text-right">Buy Price</th>
                    <th className="text-right">MSRP</th>
                    <th className="text-right">Gross Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {productsList.map((p) => {
                    const code = p.productCode || p.code;
                    const name = p.productName || p.name;
                    const line = p.productLine || p.line;
                    const stock = p.quantityInStock ?? p.stock ?? 0;
                    const price = p.buyPrice ?? p.price ?? 0;
                    const msrp = p.MSRP ?? p.msrp ?? 0;
                    const margin = msrp > 0 ? (((msrp - price) / msrp) * 100).toFixed(1) : 0;
                    const isLowStock = stock < 100;

                    return (
                      <tr key={code} className="hover:bg-slate-800/40 transition-colors">
                        <td>
                          <span className="font-mono text-xs font-semibold text-blue-400">
                            {code}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs font-medium text-slate-200" title={name}>
                            {truncate(name, 34)}
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge text-xs"
                            style={{
                              background: `${LINE_COLORS[line] || '#64748B'}18`,
                              color: LINE_COLORS[line] || '#64748B',
                            }}
                          >
                            {line}
                          </span>
                        </td>
                        <td className="text-right">
                          <span
                            className={`font-mono text-xs font-semibold ${
                              isLowStock ? 'text-rose-400' : 'text-slate-200'
                            }`}
                          >
                            {isLowStock && <AlertTriangle size={11} className="inline mr-1 text-rose-400" />}
                            {formatNumber(stock)}
                          </span>
                        </td>
                        <td className="text-right font-mono text-xs text-slate-400">
                          {formatCurrency(price)}
                        </td>
                        <td className="text-right font-mono text-xs text-slate-200 font-medium">
                          {formatCurrency(msrp)}
                        </td>
                        <td className="text-right">
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {margin}%
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
                Menampilkan <span className="font-mono text-slate-200">{productsList.length}</span> dari{' '}
                <span className="font-mono text-slate-200">{pagination.total}</span> produk (Halaman{' '}
                <span className="font-mono text-slate-200">{pagination.page}</span> dari{' '}
                <span className="font-mono text-slate-200">{pagination.totalPages}</span>)
              </span>

              <div className="flex items-center gap-1.5">
                {/* Tombol Sebelumnya */}
                <button
                  id="btn-prev-page"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={13} />
                  <span>Prev</span>
                </button>

                {/* Nomor Halaman */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, idx) => {
                    // Logic window halaman sekitar current page
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

                {/* Tombol Berikutnya */}
                <button
                  id="btn-next-page"
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
