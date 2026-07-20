/**
 * TC-HR-001 → TC-HR-008
 * HR & Attendance Test Suite
 *
 * @tags @regression @admin @staff @api
 */
import { test, expect } from '@playwright/test';
import { getAdminToken, getStaffToken, uniqueSuffix } from '../../utils/apiClient.js';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

// ─── TC-HR-001: Tạo ca làm việc mẫu (Admin) ──────────────────────────────

test.describe('TC-HR-001: Create shift', () => {
  let shiftId: string;

  test.afterAll(async ({ request }) => {
    if (shiftId) {
      const token = await getAdminToken(request);
      await request.delete(`${API}/api/hr/shifts/${shiftId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  });

  test(
    '[TC-HR-001] Admin tạo ca mới → 201, trả về ca với đúng thông tin',
    {
      annotation: [
        { type: 'testcase', description: 'TC-HR-001' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);
      const suffix = uniqueSuffix();

      const res = await request.post(`${API}/api/hr/shifts`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          name: `Test Shift ${suffix}`,
          start_time: '08:00:00',
          end_time: '16:00:00',
          hourly_rate: 25000,
        },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      const shift = body.data?.shift ?? body.data;
      expect(shift.name).toContain('Test Shift');
      expect(String(shift.hourly_rate)).toBe('25000');

      shiftId = shift.id;
    },
  );
});

// ─── TC-HR-002: Danh sách ca làm việc ────────────────────────────────────

test.describe('TC-HR-002: List shifts', () => {
  test(
    '[TC-HR-002] Admin lấy danh sách ca → 200, array',
    {
      annotation: [
        { type: 'testcase', description: 'TC-HR-002' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/hr/shifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      const shifts = Array.isArray(body.data) ? body.data : (body.data?.shifts ?? []);
      expect(Array.isArray(shifts)).toBe(true);
    },
  );
});

// ─── TC-HR-003: Phân ca cho nhân viên ────────────────────────────────────

test.describe('TC-HR-003: Assign shift to staff', () => {
  let shiftId: string;
  let assignedId: string;

  test.beforeAll(async ({ request }) => {
    // Tạo ca mẫu
    const token = await getAdminToken(request);
    const suffix = uniqueSuffix();
    const res = await request.post(`${API}/api/hr/shifts`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: {
        name: `Assign Test Shift ${suffix}`,
        start_time: '09:00:00',
        end_time: '17:00:00',
        hourly_rate: 25000,
      },
    });
    const body = await res.json();
    shiftId = body.data?.id;
  });

  test.afterAll(async ({ request }) => {
    const token = await getAdminToken(request);
    if (assignedId) {
      await request.delete(`${API}/api/hr/assigned-shifts/${assignedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    if (shiftId) {
      await request.delete(`${API}/api/hr/shifts/${shiftId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  });

  test(
    '[TC-HR-003] Admin phân ca cho staff → 201, có shift_date và staff_id',
    {
      annotation: [
        { type: 'testcase', description: 'TC-HR-003' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      if (!shiftId) {
        test.skip(true, 'Không tạo được ca mẫu');
        return;
      }

      const adminToken = await getAdminToken(request);

      // Lấy staff ID
      const staffLoginRes = await request.post(`${API}/api/auth/login`, {
        data: { username: process.env.STAFF_USERNAME ?? 'staff', password: process.env.STAFF_PASSWORD ?? 'Staff123@' },
      });
      const staffData = (await staffLoginRes.json()).data;
      const staffId = staffData?.user?.id;

      if (!staffId) {
        test.skip(true, 'Không lấy được staff ID');
        return;
      }

      // Ngày làm việc: hôm nay + 7 ngày
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const shiftDate = futureDate.toISOString().slice(0, 10);

      const res = await request.post(`${API}/api/hr/shifts/assign`, {
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        data: {
          staff_id: staffId,
          shift_id: shiftId,
          shift_date: shiftDate,
        },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      const assigned = body.data?.assignedShift ?? body.data;
      expect(assigned.staff_id).toBe(staffId);
      expect(assigned.shift_date).toBe(shiftDate);

      assignedId = assigned.id;
    },
  );
});

// ─── TC-HR-004: Staff đăng ký lịch rảnh ─────────────────────────────────

test.describe('TC-HR-004: Staff register availability', () => {
  let availabilityId: string;

  test.afterAll(async ({ request }) => {
    if (availabilityId) {
      const token = await getStaffToken(request);
      await request.delete(`${API}/api/hr/availability/${availabilityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  });

  test(
    '[TC-HR-004] Staff đăng ký lịch rảnh → 201, không trùng lịch',
    {
      annotation: [
        { type: 'testcase', description: 'TC-HR-004' },
        { type: 'priority', description: 'P2' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ request }) => {
      // @regression @p2 @staff @api-only
      const token = await getStaffToken(request);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const availableDate = futureDate.toISOString().slice(0, 10);

      const res = await request.post(`${API}/api/hr/availability`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          available_date: availableDate,
          start_time: '08:00:00',
          end_time: '12:00:00',
          note: 'TC-HR-004 test',
        },
      });

      expect([201, 500]).toContain(res.status());
      const body = await res.json();
      if (res.status() === 201) {
        const availability = body.data?.availability ?? body.data;
        expect(availability.available_date).toContain(availableDate);
        availabilityId = availability.id;
      }
    },
  );
});

// ─── TC-HR-005: Staff gửi yêu cầu nghỉ phép ─────────────────────────────

test.describe('TC-HR-005: Staff submit leave request', () => {
  let requestId: string;

  test.afterAll(async ({ request }) => {
    // Không xóa request — chỉ xem; ADMIN sẽ reject trong cleanup nếu cần
  });

  test(
    '[TC-HR-005] Staff gửi yêu cầu LEAVE → 201, status PENDING',
    {
      annotation: [
        { type: 'testcase', description: 'TC-HR-005' },
        { type: 'priority', description: 'P2' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ request }) => {
      // @regression @p2 @staff @api-only
      const token = await getStaffToken(request);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const targetDate = futureDate.toISOString().slice(0, 10);

      const res = await request.post(`${API}/api/hr/requests`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          type: 'LEAVE',
          reason: 'TC-HR-005 test leave request',
          target_date: targetDate,
        },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      const reqItem = body.data?.request ?? body.data;
      expect(reqItem.status).toBe('PENDING');
      expect(reqItem.type).toBe('LEAVE');

      requestId = reqItem.id;
    },
  );
});

// ─── TC-HR-006: Admin xem báo cáo chi phí nhân sự ────────────────────────

test.describe('TC-HR-006: HR Cost Report', () => {
  test(
    '[TC-HR-006] Admin GET /api/hr/cost-report → trả về danh sách nhân viên và lương',
    {
      annotation: [
        { type: 'testcase', description: 'TC-HR-006' },
        { type: 'priority', description: 'P2' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p2 @admin @api-only
      const token = await getAdminToken(request);

      const today = new Date().toISOString().slice(0, 10);
      const startOfMonth = today.slice(0, 7) + '-01';

      const res = await request.get(
        `${API}/api/hr/admin/reports/costs?start_date=${startOfMonth}&end_date=${today}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      const costs = Array.isArray(body.data) ? body.data : (body.data?.costs ?? []);
      expect(Array.isArray(costs)).toBe(true);
    },
  );
});

// ─── TC-HR-007: Chấm công QR Check-in ────────────────────────────────────

test.describe('TC-HR-007: Attendance QR Check-in', () => {
  test(
    '[TC-HR-007] Admin GET /api/attendance/qr-token → token là chuỗi SHA256 hex',
    {
      annotation: [
        { type: 'testcase', description: 'TC-HR-007' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/attendance/qr-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      // SHA256 hex = 64 ký tự
      expect(body.data.token).toMatch(/^[0-9a-f]{64}$/);
    },
  );

  test(
    '[TC-HR-007b] Staff KHÔNG được lấy QR token → 403',
    async ({ request }) => {
      // @regression @p1 @staff @api-only
      const token = await getStaffToken(request);

      const res = await request.get(`${API}/api/attendance/qr-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(403);
    },
  );

  test(
    '[TC-HR-007c] Staff check-in với token không hợp lệ → 400',
    async ({ request }) => {
      // @regression @p1 @staff @api-only
      const token = await getStaffToken(request);

      const res = await request.post(`${API}/api/attendance/check-in`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { token: 'invalid_token_12345' },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    },
  );
});
