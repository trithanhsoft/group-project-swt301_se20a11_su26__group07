import { apiClient } from '../../../services/apiClient.js';

function buildQueryString(filters = {}) {
  const query = new URLSearchParams();

  if (filters.search) {
    query.set('search', filters.search);
  }

  if (filters.lowStock) {
    query.set('lowStock', 'true');
  }

  if (filters.tag && filters.tag !== 'ALL') {
    query.set('tag', filters.tag);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export const ingredientApi = {
  getIngredients(filters = {}) {
    return apiClient.get(`/ingredients${buildQueryString(filters)}`);
  },
  getIngredient(id) {
    return apiClient.get(`/ingredients/${id}`);
  },
  createIngredient(data) {
    return apiClient.post('/ingredients', data);
  },
  updateIngredient(id, data) {
    return apiClient.patch(`/ingredients/${id}`, data);
  },
  deleteIngredient(id) {
    return apiClient.delete(`/ingredients/${id}`);
  },
};

export default ingredientApi;
