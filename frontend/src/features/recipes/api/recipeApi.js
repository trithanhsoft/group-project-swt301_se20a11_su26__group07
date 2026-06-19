import { apiClient } from '../../../services/apiClient.js';

export const recipeApi = {
  getRecipes() {
    return apiClient.get('/recipes');
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
  }
};
export default recipeApi;
