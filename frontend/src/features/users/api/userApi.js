import { apiClient } from '../../../services/apiClient.js';

function buildQueryString(filters = {}) {
  const query = new URLSearchParams();

  if (filters.search) {
    query.set('search', filters.search);
  }

  if (filters.role && filters.role !== 'ALL') {
    query.set('role', filters.role);
  }

  if (filters.status && filters.status !== 'ALL') {
    query.set('status', filters.status);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export const userApi = {
  getUsers(filters = {}) {
    return apiClient.get(`/users${buildQueryString(filters)}`);
  },
  getUser(id) {
    return apiClient.get(`/users/${id}`);
  },
  createUser(data) {
    return apiClient.post('/users', data);
  },
  updateUser(id, data) {
    return apiClient.patch(`/users/${id}`, data);
  },
  resetPassword(id, data) {
    return apiClient.patch(`/users/${id}/reset-password`, data);
  },
};

export default userApi;
