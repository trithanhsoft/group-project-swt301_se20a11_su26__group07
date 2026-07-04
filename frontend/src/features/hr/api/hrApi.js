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

export const hrApi = {
  // Shifts master data
  getShifts() {
    return apiClient.get('/hr/shifts');
  },
  createShift(data) {
    return apiClient.post('/hr/shifts', data);
  },
  updateShift(id, data) {
    return apiClient.patch(`/hr/shifts/${id}`, data);
  },
  deleteShift(id) {
    return apiClient.delete(`/hr/shifts/${id}`);
  },

  // Availability
  getAvailability(params = {}) {
    return apiClient.get(`/hr/availability${buildQueryString(params)}`);
  },
  createAvailability(data) {
    return apiClient.post('/hr/availability', data);
  },
  deleteAvailability(id) {
    return apiClient.delete(`/hr/availability/${id}`);
  },

  // Shift assignment
  getAssignedShifts(params = {}) {
    return apiClient.get(`/hr/my-shifts${buildQueryString(params)}`);
  },
  assignShift(data) {
    return apiClient.post('/hr/shifts/assign', data);
  },
  changeShiftStatus(id, status) {
    return apiClient.patch(`/hr/shifts/assign/${id}/status`, { status });
  },
  deleteAssignedShift(id) {
    return apiClient.delete(`/hr/shifts/assign/${id}`);
  },

  // Requests
  getRequests(params = {}) {
    return apiClient.get(`/hr/requests${buildQueryString(params)}`);
  },
  createRequest(data) {
    return apiClient.post('/hr/requests', data);
  },
  processRequest(id, data) {
    return apiClient.patch(`/hr/requests/${id}`, data);
  },

  // Salary & reports
  getMySalary(params = {}) {
    return apiClient.get(`/hr/my-salary${buildQueryString(params)}`);
  },
  getAdminHRCosts(params = {}) {
    return apiClient.get(`/hr/admin/reports/costs${buildQueryString(params)}`);
  },
};

export default hrApi;
