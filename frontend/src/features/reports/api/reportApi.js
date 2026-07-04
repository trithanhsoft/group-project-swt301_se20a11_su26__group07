import { apiClient } from '../../../services/apiClient.js';

export const reportApi = {
  getRevenueReport() {
    return apiClient.get('/reports/revenue');
  },
  getBestSellingProducts() {
    return apiClient.get('/reports/best-selling-products');
  },
  getLowStockIngredients() {
    return apiClient.get('/reports/low-stock-ingredients');
  },
  getDiscardsReport() {
    return apiClient.get('/reports/discards');
  }
};
export default reportApi;
