import { apiClient } from '../../../services/apiClient.js';

export const posSessionApi = {
  getActiveSession() {
    return apiClient.get('/pos-sessions/active');
  },
  openSession(startingCash, notes) {
    return apiClient.post('/pos-sessions/open', { startingCash, notes });
  },
  closeSession(endingCashActual, notes) {
    return apiClient.post('/pos-sessions/close', { endingCashActual, notes });
  },
  midShiftCount(midShiftCash, notes) {
    return apiClient.post('/pos-sessions/mid-shift-count', { midShiftCash, notes });
  },
  getSessionHistory(params) {
    return apiClient.get('/pos-sessions/history', { params });
  },
  getSessionReport(sessionId) {
    return apiClient.get(`/pos-sessions/${sessionId}/report`);
  }
};

export default posSessionApi;
