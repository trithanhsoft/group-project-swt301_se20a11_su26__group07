import { apiClient } from '../../../services/apiClient.js';

export function getDashboardSummary() {
  return apiClient.get('/dashboard/summary');
}
