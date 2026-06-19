import { apiClient } from '../../../services/apiClient.js';

export const orderApi = {
  getOrders() {
    return apiClient.get('/orders');
  },
  getOrder(id) {
    return apiClient.get(`/orders/${id}`);
  }
};
export default orderApi;
