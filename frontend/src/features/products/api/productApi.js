import { apiClient } from '../../../services/apiClient.js';

function buildQueryString(filters = {}) {
  const query = new URLSearchParams();

  if (filters.search) {
    query.set('search', filters.search);
  }

  if (filters.status && filters.status !== 'ALL') {
    query.set('status', filters.status);
  }

  if (filters.tag && filters.tag !== 'ALL') {
    query.set('tag', filters.tag);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export const productApi = {
  getProducts(filters = {}) {
    return apiClient.get(`/products${buildQueryString(filters)}`);
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
  },
  getPosAvailableProducts() {
    return apiClient.get('/products/pos/available');
  },
};

export default productApi;
