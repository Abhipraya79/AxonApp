/**
 * AxonApp — Analytics Service Layer
 * Bertanggung jawab menangani semua request analitik ke backend Axon.
 * Endpoint:
 * - GET /api/analytics/kpi
 * - GET /api/analytics/sales-trend
 * - GET /api/analytics/customer-distribution
 */
import apiClient from './apiClient';

// ── Types & Interfaces ──────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  stack?: string | null;
}

export interface KpiData {
  totalRevenue: number;
  totalProfit: number;
  totalCustomers: number;
  totalEmployees: number;
  revenueGrowth?: number;
  orderGrowth?: number;
  customerGrowth?: number;
}

export interface SalesTrendItem {
  month: string;
  revenue: number;
  orders: number;
  profit?: number;
  year?: number;
}

export interface CustomerDistributionItem {
  country: string;
  customerCount: number;
  percentage?: number;
  totalRevenue?: number;
}

// ── Fallback Mock Data ──────────────────────────────────────────────
// Berguna saat server remote backend sedang dalam maintenance / Prisma DB migration
export const FALLBACK_ANALYTICS = {
  kpi: {
    totalRevenue: 9604190.61,
    totalProfit: 3841676.24,
    totalCustomers: 122,
    totalEmployees: 23,
    revenueGrowth: 12.4,
    orderGrowth: 8.7,
    customerGrowth: -2.1,
  } as KpiData,
  salesTrend: [
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
  ] as SalesTrendItem[],
  customerDistribution: [
    { country: 'USA', customerCount: 36, percentage: 29.5 },
    { country: 'Germany', customerCount: 13, percentage: 10.7 },
    { country: 'France', customerCount: 12, percentage: 9.8 },
    { country: 'Spain', customerCount: 9, percentage: 7.4 },
    { country: 'Australia', customerCount: 8, percentage: 6.6 },
    { country: 'UK', customerCount: 7, percentage: 5.7 },
    { country: 'Other', customerCount: 37, percentage: 30.3 },
  ] as CustomerDistributionItem[],
};

// ── Service Definition ──────────────────────────────────────────────

export const analyticsService = {
  /**
   * Mengambil 4 KPI cards: Total Revenue, Total Profit, Total Customers, Total Employees
   * Endpoint: GET /api/analytics/kpi
   */
  async getKpi(): Promise<ApiResponse<KpiData>> {
    return apiClient.get('/analytics/kpi');
  },

  /**
   * Mengambil tren penjualan bulanan untuk Line / Bar / Area Chart
   * Endpoint: GET /api/analytics/sales-trend
   * @param params Opsional filter seperti { year: 2004 }
   */
  async getSalesTrend(params?: { year?: number }): Promise<ApiResponse<SalesTrendItem[]>> {
    return apiClient.get('/analytics/sales-trend', { params });
  },

  /**
   * Mengambil distribusi pelanggan per negara untuk Pie / Donut Chart
   * Endpoint: GET /api/analytics/customer-distribution
   */
  async getCustomerDistribution(): Promise<ApiResponse<CustomerDistributionItem[]>> {
    return apiClient.get('/analytics/customer-distribution');
  },

  /**
   * Fetch gabungan dashboard dengan Promise.allSettled untuk ketahanan UI tinggi.
   * Jika satu chart error, chart lain tetap bisa tampil.
   */
  async getDashboardOverview() {
    const [kpiRes, trendRes, distRes] = await Promise.allSettled([
      analyticsService.getKpi(),
      analyticsService.getSalesTrend(),
      analyticsService.getCustomerDistribution(),
    ]);

    return {
      kpi: kpiRes.status === 'fulfilled' ? kpiRes.value.data : null,
      kpiError: kpiRes.status === 'rejected' ? kpiRes.reason : null,
      salesTrend: trendRes.status === 'fulfilled' ? trendRes.value.data : null,
      salesTrendError: trendRes.status === 'rejected' ? trendRes.reason : null,
      customerDistribution: distRes.status === 'fulfilled' ? distRes.value.data : null,
      distError: distRes.status === 'rejected' ? distRes.reason : null,
    };
  },
};

export default analyticsService;
