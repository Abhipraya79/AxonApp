/**
 * AxonApp — API Service Layer
 * Axios instance pre-configured untuk komunikasi dengan Express backend.
 * Semua endpoint dikelompokkan berdasarkan domain data classicmodels.
 */
import axios from 'axios';

// Base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — bisa ditambah auth token nantinya
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('axon_token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — centralized error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Unexpected error occurred';
    console.error('[AxonApp API Error]', message);
    return Promise.reject(new Error(message));
  }
);

// ============================================================
// DASHBOARD — Summary KPIs
// ============================================================
export const dashboardService = {
  /** GET /api/dashboard/summary — Total revenue, orders, customers, products */
  getSummary: () => api.get('/dashboard/summary'),

  /** GET /api/dashboard/revenue-trend — Revenue by month */
  getRevenueTrend: (year) => api.get('/dashboard/revenue-trend', { params: { year } }),

  /** GET /api/dashboard/top-products — Best selling products */
  getTopProducts: (limit = 5) => api.get('/dashboard/top-products', { params: { limit } }),

  /** GET /api/dashboard/orders-by-status — Count per status */
  getOrdersByStatus: () => api.get('/dashboard/orders-by-status'),
};

// ============================================================
// SALES REPORT
// ============================================================
export const salesService = {
  /** GET /api/sales — Paginated orders list */
  getOrders: (params = {}) => api.get('/sales/orders', { params }),

  /** GET /api/sales/orders/:id — Order detail */
  getOrderById: (id) => api.get(`/sales/orders/${id}`),

  /** GET /api/sales/by-year — Revenue grouped by year */
  getRevenueByYear: () => api.get('/sales/by-year'),

  /** GET /api/sales/by-productline — Revenue by product line */
  getRevenueByProductLine: () => api.get('/sales/by-productline'),
};

// ============================================================
// CUSTOMERS
// ============================================================
export const customerService = {
  /** GET /api/customers — Paginated customer list */
  getAll: (params = {}) => api.get('/customers', { params }),

  /** GET /api/customers/:id — Customer detail */
  getById: (id) => api.get(`/customers/${id}`),

  /** GET /api/customers/:id/orders — Orders by customer */
  getOrders: (id) => api.get(`/customers/${id}/orders`),

  /** GET /api/customers/by-country — Customer count per country */
  getByCountry: () => api.get('/customers/by-country'),
};

// ============================================================
// PRODUCTS
// ============================================================
export const productService = {
  /** GET /api/products — Paginated product catalog */
  getAll: (params = {}) => api.get('/products', { params }),

  /** GET /api/products/:code — Product detail */
  getByCode: (code) => api.get(`/products/${code}`),

  /** GET /api/products/by-line — Products grouped by product line */
  getByProductLine: () => api.get('/products/by-line'),

  /** GET /api/products/low-stock — Products with low inventory */
  getLowStock: (threshold = 100) => api.get('/products/low-stock', { params: { threshold } }),
};

export default api;
