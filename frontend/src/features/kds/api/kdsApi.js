import { apiClient } from '../../../services/apiClient.js';

export const kdsApi = {
  getOrders() {
    return apiClient.get('/kds/orders');
  },
  completeOrder(orderId) {
    return apiClient.patch(`/kds/orders/${orderId}/complete`, {});
  },
};

export default kdsApi;
