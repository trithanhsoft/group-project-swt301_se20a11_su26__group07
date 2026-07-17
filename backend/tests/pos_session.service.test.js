import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getActiveSession, openSession, closeSession } from '../src/modules/pos_sessions/pos_session.service.js';
import { query } from '../src/config/db.js';

vi.mock('../src/config/db.js', () => ({
  query: vi.fn(),
}));

describe('POS Session Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveSession', () => {
    it('should return null if no open session exists', async () => {
      query.mockResolvedValueOnce({ rows: [] });
      const session = await getActiveSession('staff-123');
      expect(session).toBeNull();
      expect(query).toHaveBeenCalledTimes(1);
    });

    it('should return session with shouldWarnClose=false if open less than 12 hours', async () => {
      const openedAt = new Date();
      query.mockResolvedValueOnce({
        rows: [{ id: 'session-123', staff_id: 'staff-123', opened_at: openedAt, starting_cash: 200000, status: 'OPEN', mid_shift_cash: null, mid_shift_counted_at: null }],
      }).mockResolvedValueOnce({
        rows: [{ cash_sales: 100000 }]
      }).mockResolvedValueOnce({
        rows: [{ qr_sales: 50000 }]
      });

      const session = await getActiveSession('staff-123');
      expect(session).not.toBeNull();
      expect(session.shouldWarnClose).toBe(false);
      expect(session.cashSales).toBe(100000);
      expect(session.qrSales).toBe(50000);
      expect(session.endingCashExpected).toBe(300000);
    });

    it('should return shouldWarnClose=true if open more than 12 hours', async () => {
      const openedAt = new Date(Date.now() - 13 * 60 * 60 * 1000);
      query.mockResolvedValueOnce({
        rows: [{ id: 'session-123', staff_id: 'staff-123', opened_at: openedAt, starting_cash: 200000, status: 'OPEN', mid_shift_cash: null, mid_shift_counted_at: null }],
      }).mockResolvedValueOnce({
        rows: [{ cash_sales: 100000 }]
      }).mockResolvedValueOnce({
        rows: [{ qr_sales: 50000 }]
      });

      const session = await getActiveSession('staff-123');
      expect(session.shouldWarnClose).toBe(true);
    });
  });

  describe('openSession', () => {
    it('should open a session successfully if none is active', async () => {
      // check active: returns null
      query.mockResolvedValueOnce({ rows: [] });
      // insert: returns new session
      query.mockResolvedValueOnce({
        rows: [{ id: 'session-123', staff_id: 'staff-123', starting_cash: 500000, status: 'OPEN' }]
      });

      const session = await openSession('staff-123', 500000, 'Mở ca');
      expect(session.id).toBe('session-123');
      expect(session.starting_cash).toBe(500000);
    });

    it('should throw error if session is already active', async () => {
      // check active: returns active session
      query.mockResolvedValueOnce({
        rows: [{ id: 'session-123', staff_id: 'staff-123', opened_at: new Date(), starting_cash: 200000, status: 'OPEN', mid_shift_cash: null, mid_shift_counted_at: null }]
      }).mockResolvedValueOnce({
        rows: [{ cash_sales: 0 }]
      }).mockResolvedValueOnce({
        rows: [{ qr_sales: 0 }]
      });

      await expect(openSession('staff-123', 500000)).rejects.toThrow('Bạn đang có một ca làm việc chưa đóng.');
    });
  });
});
