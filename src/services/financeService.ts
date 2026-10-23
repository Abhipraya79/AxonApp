/**
 * AxonApp — Finance & Cash Flow Service Layer
 * Bertanggung jawab menangani request keuangan dan arus kas ke backend Axon.
 * Endpoint:
 * - GET /api/finances/payments?page=1&limit=20
 * - GET /api/finances/revenue-vs-cash
 */
import apiClient from './apiClient';

// ── Types & Interfaces ──────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  stack?: string | null;
}

export interface PaymentItem {
  customerNumber: number;
  customerName?: string;
  checkNumber: string;
  paymentDate: string;
  amount: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaymentsPaginatedResult {
  items: PaymentItem[];
  pagination: PaginationMeta;
}

export interface RevenueVsCashData {
  expectedRevenue: number;
  actualCash: number;
  difference: number;
  collectionRate: number; // e.g. 92.19 (%)
  uncollectedInvoicesCount?: number;
  monthlyBreakdown?: Array<{
    month: string;
    revenue: number;
    cash: number;
  }>;
}

// ── Fallback Mock Data ──────────────────────────────────────────────
export const FALLBACK_FINANCE_DATA: {
  revenueVsCash: RevenueVsCashData;
  payments: PaymentsPaginatedResult;
} = {
  revenueVsCash: {
    expectedRevenue: 9604190.61,
    actualCash: 8853828.67,
    difference: 750361.94,
    collectionRate: 92.19,
    uncollectedInvoicesCount: 18,
    monthlyBreakdown: [
      { month: 'Jan', revenue: 224000, cash: 218000 },
      { month: 'Feb', revenue: 189000, cash: 180000 },
      { month: 'Mar', revenue: 312000, cash: 295000 },
      { month: 'Apr', revenue: 278000, cash: 260000 },
      { month: 'May', revenue: 345000, cash: 320000 },
      { month: 'Jun', revenue: 398000, cash: 375000 },
      { month: 'Jul', revenue: 421000, cash: 390000 },
      { month: 'Aug', revenue: 367000, cash: 340000 },
      { month: 'Sep', revenue: 452000, cash: 410000 },
      { month: 'Oct', revenue: 489000, cash: 445000 },
      { month: 'Nov', revenue: 531000, cash: 490000 },
      { month: 'Dec', revenue: 612000, cash: 560000 },
    ],
  },
  payments: {
    items: [
      { customerNumber: 103, customerName: 'Atelier graphique', checkNumber: 'HQ336336', paymentDate: '2004-10-19', amount: 6066.78 },
      { customerNumber: 112, customerName: 'Signal Gift Stores', checkNumber: 'ND268688', paymentDate: '2004-06-21', amount: 32641.98 },
      { customerNumber: 114, customerName: 'Australian Collectors, Co.', checkNumber: 'MA765515', paymentDate: '2004-12-15', amount: 82261.22 },
      { customerNumber: 119, customerName: 'La Rochelle Gifts', checkNumber: 'DB933704', paymentDate: '2004-11-20', amount: 19501.82 },
      { customerNumber: 121, customerName: 'Baane Mini Imports', checkNumber: 'AU467793', paymentDate: '2004-08-08', amount: 17819.40 },
      { customerNumber: 124, customerName: 'Mini Gifts Distributors Ltd.', checkNumber: 'AE215433', paymentDate: '2004-01-15', amount: 101244.59 },
      { customerNumber: 128, customerName: 'Blauer See Auto, Co.', checkNumber: 'BG255403', paymentDate: '2004-03-24', amount: 25244.69 },
      { customerNumber: 129, customerName: 'Mini Wheels Co.', checkNumber: 'FA865824', paymentDate: '2004-07-06', amount: 24923.93 },
      { customerNumber: 131, customerName: 'Land of Toys Inc.', checkNumber: 'HQ55022', paymentDate: '2004-05-18', amount: 11432.34 },
      { customerNumber: 141, customerName: 'Euro+ Shopping Channel', checkNumber: 'ED444876', paymentDate: '2004-11-05', amount: 116208.40 },
      { customerNumber: 144, customerName: 'Volvo Model Replicas, Co.', checkNumber: 'DM35105', paymentDate: '2004-02-12', amount: 15729.80 },
      { customerNumber: 145, customerName: 'Danish Wholesale Imports', checkNumber: 'CG380894', paymentDate: '2004-04-19', amount: 38281.51 },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 273,
      totalPages: 14,
    },
  },
};

// ── Service Definition ──────────────────────────────────────────────

export const financeService = {
  /**
   * Mengambil riwayat pembayaran dengan paginasi & search
   * Endpoint: GET /api/finances/payments?page=1&limit=20
   */
  async getPayments(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaymentsPaginatedResult>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const search = params?.search ?? '';

    return apiClient.get('/finances/payments', {
      params: { page, limit, search },
    });
  },

  /**
   * Mengambil perbandingan omset dan arus kas nyata (Revenue vs Cash)
   * Endpoint: GET /api/finances/revenue-vs-cash
   */
  async getRevenueVsCash(): Promise<ApiResponse<RevenueVsCashData>> {
    return apiClient.get('/finances/revenue-vs-cash');
  },

  /**
   * Mengambil seluruh data overview finance secara paralel
   */
  async getFinanceOverview(params?: { page?: number; limit?: number }) {
    const [revCashRes, paymentsRes] = await Promise.allSettled([
      financeService.getRevenueVsCash(),
      financeService.getPayments(params),
    ]);

    return {
      revenueVsCash: revCashRes.status === 'fulfilled' ? revCashRes.value.data : null,
      revenueVsCashError: revCashRes.status === 'rejected' ? revCashRes.reason : null,
      payments: paymentsRes.status === 'fulfilled' ? paymentsRes.value.data : null,
      paymentsError: paymentsRes.status === 'rejected' ? paymentsRes.reason : null,
    };
  },
};

export default financeService;
