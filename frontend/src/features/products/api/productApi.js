import { apiClient } from '../../../services/apiClient.js';

export const productApi = {
  getProducts() {
    return apiClient.get('/products');
  },
  getProduct(id) {
    return apiClient.get(`/products/${id}`);
  },
  createProduct(data) {
    return apiClient.post('/products', data);
  },
  updateProduct(id, data) {
    return apiClient.patch(`/products/${id}`, data);
  },
  deleteProduct(id) {
    return apiClient.delete(`/products/${id}`);
  }
};
export default productApi;
