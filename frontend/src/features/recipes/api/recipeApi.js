import { apiClient } from '../../../services/apiClient.js';

function buildQueryString(filters = {}) {
  const query = new URLSearchParams();

  if (filters.search) {
    query.set('search', filters.search);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export const recipeApi = {
  getRecipes(filters = {}) {
    return apiClient.get(`/recipes${buildQueryString(filters)}`);
  },
  getRecipe(id) {
    return apiClient.get(`/recipes/${id}`);
  },
  getRecipeByProductId(productId) {
    return apiClient.get(`/recipes/product/${productId}`);
  },
  createRecipe(data) {
    return apiClient.post('/recipes', data);
  },
  updateRecipe(id, data) {
    return apiClient.patch(`/recipes/${id}`, data);
  },
  deleteRecipe(id) {
    return apiClient.delete(`/recipes/${id}`);
  },
};

export default recipeApi;
