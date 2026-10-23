/**
 * AxonApp — Products & Inventory Service Layer
 * Bertanggung jawab menangani semua request produk & inventaris ke backend Axon.
 * Endpoint:
 * - GET /api/products?page=1&limit=20&search=
 * - GET /api/products/top-selling?limit=10
 * - GET /api/products/categories
 * - GET /api/products/unsold
 */
import apiClient from './apiClient';

// ── Types & Interfaces ──────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  stack?: string | null;
}

export interface Product {
  productCode: string;
  productName: string;
  productLine: string;
  productScale?: string;
  productVendor?: string;
  productDescription?: string;
  quantityInStock: number;
  buyPrice: number;
  MSRP: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsPaginatedResult {
  items: Product[];
  pagination: PaginationMeta;
}

export interface TopSellingProduct {
  productCode: string;
  productName: string;
  productLine?: string;
  totalSold: number;
  totalRevenue: number;
}

export interface ProductCategoryPerformance {
  productLine: string;
  totalProducts?: number;
  totalSold?: number;
  totalRevenue: number;
}

export interface UnsoldProduct {
  productCode: string;
  productName: string;
  productLine: string;
  quantityInStock: number;
  buyPrice: number;
  MSRP: number;
  lastOrderedDate?: string | null;
}

// ── Fallback Mock Data ──────────────────────────────────────────────
export const FALLBACK_PRODUCTS_DATA: {
  products: ProductsPaginatedResult;
  topSelling: TopSellingProduct[];
  categories: ProductCategoryPerformance[];
  unsold: UnsoldProduct[];
} = {
  products: {
    items: [
      { productCode: 'S18_3232', productName: '1992 Ferrari 360 Spider red', productLine: 'Classic Cars', quantityInStock: 8347, buyPrice: 77.90, MSRP: 169.34 },
      { productCode: 'S18_1342', productName: '1937 Lincoln Berline', productLine: 'Vintage Cars', quantityInStock: 8693, buyPrice: 35.73, MSRP: 60.62 },
      { productCode: 'S12_1099', productName: '1968 Ford Mustang', productLine: 'Classic Cars', quantityInStock: 68, buyPrice: 95.34, MSRP: 194.57 },
      { productCode: 'S10_1678', productName: '1969 Harley Davidson Ultimate Chopper', productLine: 'Motorcycles', quantityInStock: 7933, buyPrice: 48.81, MSRP: 95.70 },
      { productCode: 'S32_2206', productName: '1982 Ducati 996 R', productLine: 'Motorcycles', quantityInStock: 9241, buyPrice: 24.14, MSRP: 40.33 },
      { productCode: 'S72_3212', productName: 'Pont Yacht', productLine: 'Ships', quantityInStock: 414, buyPrice: 33.30, MSRP: 54.60 },
      { productCode: 'S18_4409', productName: '1932 Alfa Romeo 8C2300 Spider', productLine: 'Vintage Cars', quantityInStock: 56, buyPrice: 43.26, MSRP: 92.03 },
      { productCode: 'S24_3856', productName: '1956 Porsche 356A Coupe', productLine: 'Classic Cars', quantityInStock: 6600, buyPrice: 44.77, MSRP: 98.30 },
      { productCode: 'S10_1949', productName: '1952 Alpine Renault 1300', productLine: 'Classic Cars', quantityInStock: 7305, buyPrice: 98.58, MSRP: 214.30 },
      { productCode: 'S10_4698', productName: '2003 Harley-Davidson Eagle Drag Bike', productLine: 'Motorcycles', quantityInStock: 5582, buyPrice: 91.02, MSRP: 193.66 },
      { productCode: 'S12_1108', productName: '2001 Ferrari Enzo', productLine: 'Classic Cars', quantityInStock: 3619, buyPrice: 95.59, MSRP: 207.80 },
      { productCode: 'S18_2795', productName: '1928 Mercedes-Benz SSK', productLine: 'Vintage Cars', quantityInStock: 548, buyPrice: 72.56, MSRP: 168.75 },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 110,
      totalPages: 6,
    },
  },
  topSelling: [
    { productCode: 'S18_3232', productName: '1992 Ferrari 360 Spider red', productLine: 'Classic Cars', totalSold: 1808, totalRevenue: 276839 },
    { productCode: 'S12_1108', productName: '2001 Ferrari Enzo', productLine: 'Classic Cars', totalSold: 1645, totalRevenue: 190755 },
    { productCode: 'S10_1949', productName: '1952 Alpine Renault 1300', productLine: 'Classic Cars', totalSold: 1384, totalRevenue: 190017 },
    { productCode: 'S10_4698', productName: '2003 Harley-Davidson Eagle', productLine: 'Motorcycles', totalSold: 1382, totalRevenue: 170686 },
    { productCode: 'S12_3148', productName: '1968 Dodge Charger', productLine: 'Classic Cars', totalSold: 1310, totalRevenue: 160194 },
    { productCode: 'S18_2238', productName: '1998 Chrysler Plymouth Prowler', productLine: 'Classic Cars', totalSold: 1290, totalRevenue: 153540 },
    { productCode: 'S18_4027', productName: '1970 Triumph Spitfire', productLine: 'Classic Cars', totalSold: 1198, totalRevenue: 142100 },
    { productCode: 'S24_3856', productName: '1956 Porsche 356A Coupe', productLine: 'Classic Cars', totalSold: 1184, totalRevenue: 139880 },
    { productCode: 'S10_2016', productName: '1996 Moto Guzzi 1100i', productLine: 'Motorcycles', totalSold: 1150, totalRevenue: 128450 },
    { productCode: 'S18_1749', productName: '1917 Grand Touring Sedan', productLine: 'Vintage Cars', totalSold: 1142, totalRevenue: 126900 },
  ],
  categories: [
    { productLine: 'Classic Cars', totalProducts: 38, totalSold: 35582, totalRevenue: 3850000 },
    { productLine: 'Vintage Cars', totalProducts: 24, totalSold: 22100, totalRevenue: 1790000 },
    { productLine: 'Motorcycles', totalProducts: 13, totalSold: 14850, totalRevenue: 1160000 },
    { productLine: 'Trucks & Buses', totalProducts: 11, totalSold: 11200, totalRevenue: 1020000 },
    { productLine: 'Planes', totalProducts: 12, totalSold: 9800, totalRevenue: 975000 },
    { productLine: 'Ships', totalProducts: 9, totalSold: 8400, totalRevenue: 710000 },
  ],
  unsold: [
    { productCode: 'S18_2248', productName: '1911 Ford Town Car', productLine: 'Vintage Cars', quantityInStock: 540, buyPrice: 33.30, MSRP: 60.54, lastOrderedDate: null },
    { productCode: 'S18_2957', productName: '1934 Ford V8 Coupe', productLine: 'Vintage Cars', quantityInStock: 5649, buyPrice: 34.35, MSRP: 62.46, lastOrderedDate: null },
    { productCode: 'S50_1514', productName: '1962 City of Detroit Streetcar', productLine: 'Trains', quantityInStock: 1645, buyPrice: 17.92, MSRP: 37.49, lastOrderedDate: null },
  ],
};

// ── Service Definition ──────────────────────────────────────────────

export const productsService = {
  /**
   * Mengambil daftar produk terpaginasi beserta pencarian kata kunci
   * Endpoint: GET /api/products?page=1&limit=20&search=...
   */
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<ProductsPaginatedResult>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const search = params?.search ?? '';

    return apiClient.get('/products', {
      params: { page, limit, search },
    });
  },

  /**
   * Mengambil list Top N produk terlaris
   * Endpoint: GET /api/products/top-selling?limit=10
   */
  async getTopSelling(limit: number = 10): Promise<ApiResponse<TopSellingProduct[]>> {
    return apiClient.get('/products/top-selling', {
      params: { limit },
    });
  },

  /**
   * Mengambil performa per kategori / product line
   * Endpoint: GET /api/products/categories
   */
  async getCategories(): Promise<ApiResponse<ProductCategoryPerformance[]>> {
    return apiClient.get('/products/categories');
  },

  /**
   * Mengambil daftar dead stock / produk tidak terjual
   * Endpoint: GET /api/products/unsold
   */
  async getUnsold(): Promise<ApiResponse<UnsoldProduct[]>> {
    return apiClient.get('/products/unsold');
  },

  /**
   * Fetch seluruh data katalog produk secara paralel dengan resilience
   */
  async getProductsOverview(params?: { page?: number; limit?: number; search?: string }) {
    const [productsRes, topRes, catRes, unsoldRes] = await Promise.allSettled([
      productsService.getProducts(params),
      productsService.getTopSelling(10),
      productsService.getCategories(),
      productsService.getUnsold(),
    ]);

    return {
      products: productsRes.status === 'fulfilled' ? productsRes.value.data : null,
      productsError: productsRes.status === 'rejected' ? productsRes.reason : null,
      topSelling: topRes.status === 'fulfilled' ? topRes.value.data : null,
      topError: topRes.status === 'rejected' ? topRes.reason : null,
      categories: catRes.status === 'fulfilled' ? catRes.value.data : null,
      categoriesError: catRes.status === 'rejected' ? catRes.reason : null,
      unsold: unsoldRes.status === 'fulfilled' ? unsoldRes.value.data : null,
      unsoldError: unsoldRes.status === 'rejected' ? unsoldRes.reason : null,
    };
  },
};

export default productsService;
