import { apiClient } from '../../../services/apiClient.js';

export const ingredientApi = {
  getIngredients() {
    return apiClient.get('/ingredients');
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
  }
};
export default ingredientApi;
