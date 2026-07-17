import { apiClient } from '../../../services/apiClient.js';

export const orderApi = {
  getOrders(params) {
    return apiClient.get('/orders', { params });
  },
  getOrder(id) {
    return apiClient.get(`/orders/${id}`);
  },
  refundOrder(id, refundData) {
    return apiClient.post(`/orders/${id}/refund`, refundData);
  }
};
export default orderApi;
