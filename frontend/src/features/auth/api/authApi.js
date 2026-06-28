import { apiClient } from '../../../services/apiClient.js';

export const authApi = {
  login({ username, password }) {
    return apiClient.post('/auth/login', { username, password });
  },
  getMe() {
    return apiClient.get('/auth/me');
  },
  updateProfile(data) {
    return apiClient.patch('/auth/me', data);
  },
  changePassword(data) {
    return apiClient.patch('/auth/change-password', data);
  },
};
export default authApi;
