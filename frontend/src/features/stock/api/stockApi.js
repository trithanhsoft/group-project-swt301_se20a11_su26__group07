import { apiClient } from '../../../services/apiClient.js';

export const stockApi = {
  importStock(data) {
    return apiClient.post('/stock/import', data);
  },
  adjustStock(data) {
    return apiClient.post('/stock/adjust', data);
  },
  getTransactions() {
    return apiClient.get('/stock/transactions');
  }
};
export default stockApi;
