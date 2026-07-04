import { apiClient } from '../../../services/apiClient.js';

function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.set(key, val);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export const attendanceApi = {
  checkIn(token) {
    return apiClient.post('/attendance/check-in', { token });
  },
  checkOut() {
    return apiClient.post('/attendance/check-out');
  },
  getTodayStatus() {
    return apiClient.get('/attendance/today-status');
  },
  getQRToken() {
    return apiClient.get('/attendance/qr-token');
  },
  getLogs(params = {}) {
    return apiClient.get(`/attendance/logs${buildQueryString(params)}`);
  },
};

export default attendanceApi;
