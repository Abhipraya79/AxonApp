/**
 * AxonApp — Service Layer Index
 * Central export for all modular API services
 */
export { default as apiClient, getErrorMessage, checkBackendHealth, BASE_URL } from './apiClient';
export { analyticsService, FALLBACK_ANALYTICS } from './analyticsService';
export { productsService, FALLBACK_PRODUCTS_DATA } from './productsService';
export { financeService, FALLBACK_FINANCE_DATA } from './financeService';
export { USE_MOCK, MOCK_DELAY_MS, resolveMock } from './mockConfig';
