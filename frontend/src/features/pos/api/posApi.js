import { apiClient } from '../../../services/apiClient.js';

export const posApi = {
  getAvailableProducts() {
    return apiClient.get('/products/pos/available');
  },
  createOrder(orderData) {
    return apiClient.post('/orders', orderData);
  },
  getVietQRConfig() {
    return apiClient.get('/orders/vietqr-config');
  }
};
export default posApi;
