import { apiClient } from '../../../services/apiClient.js';

export const authApi = {
  login({ username, password }) {
    return apiClient.post('/auth/login', { username, password });
  },
  getMe() {
    return apiClient.get('/auth/me');
  }
};
export default authApi;
