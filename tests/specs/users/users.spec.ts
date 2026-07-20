/**
 * TC-USR-001 → TC-USR-008
 * User Management & Profile Test Suite
 *
 * @tags @regression @admin @api
 */
import { test, expect } from '@playwright/test';
import { getAdminToken, getStaffToken, apiGet, uniqueSuffix } from '../../utils/apiClient.js';
import { createUser, deactivateUser } from '../../utils/factories.js';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

// ─── TC-USR-001: Admin lấy danh sách user ─────────────────────────────────

test.describe('TC-USR-001: List users', () => {
  test(
    '[TC-USR-001] Admin GET /api/users → 200, danh sách users',
    {
      annotation: [
        { type: 'testcase', description: 'TC-USR-001' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @smoke @p0 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      const users = Array.isArray(body.data) ? body.data : (body.data?.users ?? []);
      expect(Array.isArray(users)).toBe(true);

      if (body.data.length > 0) {
        const user = body.data[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('status');
        expect(['ADMIN', 'STAFF']).toContain(user.role);
        // password_hash không được expose
        expect(user).not.toHaveProperty('password_hash');
        expect(user).not.toHaveProperty('passwordHash');
      }
    },
  );

  test(
    '[TC-USR-001b] Staff KHÔNG xem /api/users → 403',
    async ({ request }) => {
      // @regression @p1 @staff @api-only
      const token = await getStaffToken(request);

      const res = await request.get(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(403);
    },
  );
});

// ─── TC-USR-002: Admin tạo user mới ──────────────────────────────────────

test.describe('TC-USR-002: Create user', () => {
  let createdUserId: string;

  test.afterAll(async ({ request }) => {
    if (createdUserId) {
      try { await deactivateUser(request, createdUserId); } catch {}
    }
  });

  test(
    '[TC-USR-002] Admin tạo STAFF user → 201, password không expose',
    {
      annotation: [
        { type: 'testcase', description: 'TC-USR-002' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p0 @admin @api-only
      const token = await getAdminToken(request);
      const suffix = uniqueSuffix();

      const payload = {
        username: `teststaff_${suffix}`,
        email: `teststaff_${suffix}@test.local`,
        fullName: `Test Staff ${suffix}`,
        password: 'TestPass123@',
        role: 'STAFF',
      };

      const res = await request.post(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: payload,
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);

      const user = body.data?.user ?? body.data;
      expect(user.username).toBe(payload.username);
      expect(user.status).toBe('ACTIVE');
      expect(user.id).toBeTruthy();
      expect(user).not.toHaveProperty('password_hash');
      expect(user).not.toHaveProperty('passwordHash');

      createdUserId = user.id;
    },
  );
});

// ─── TC-USR-003: Username trùng → 409 ────────────────────────────────────

test.describe('TC-USR-003: Duplicate username', () => {
  test(
    '[TC-USR-003] Tạo user với username đã tồn tại → 409',
    {
      annotation: [
        { type: 'testcase', description: 'TC-USR-003' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      // 'admin' luôn tồn tại (từ seed)
      const res = await request.post(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          username: 'admin',
          email: `newadmin_${uniqueSuffix()}@test.local`,
          fullName: 'New Admin',
          password: 'TestPass123@',
          role: 'ADMIN',
        },
      });

      expect(res.status()).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
    },
  );
});

// ─── TC-USR-004: Cập nhật thông tin user ─────────────────────────────────

test.describe('TC-USR-004: Update user', () => {
  let userId: string;

  test.beforeAll(async ({ request }) => {
    const user = await createUser(request, { role: 'STAFF' });
    userId = user.id;
  });

  test.afterAll(async ({ request }) => {
    try { await deactivateUser(request, userId); } catch {}
  });

  test(
    '[TC-USR-004] Admin cập nhật fullName → lưu giá trị mới',
    {
      annotation: [
        { type: 'testcase', description: 'TC-USR-004' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);
      const newFullName = `Updated Name ${uniqueSuffix()}`;

      const res = await request.patch(`${API}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { fullName: newFullName },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      const user = body.data?.user ?? body.data;
      expect(user.fullName ?? user.full_name).toBe(newFullName);
    },
  );
});

// ─── TC-USR-005: Vô hiệu hóa user (INACTIVE) ─────────────────────────────

test.describe('TC-USR-005: Deactivate user', () => {
  let userId: string;

  test.beforeAll(async ({ request }) => {
    const user = await createUser(request, { role: 'STAFF' });
    userId = user.id;
  });

  test(
    '[TC-USR-005] Admin đặt status=INACTIVE → user không login được',
    {
      annotation: [
        { type: 'testcase', description: 'TC-USR-005' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      // Lấy username của user
      const userRes = await apiGet(request, `/api/users/${userId}`, token);
      const userBody = (await userRes.json()).data;
      const username = userBody.user?.username ?? userBody.username;

      // Deactivate
      const deactivateRes = await request.patch(`${API}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { status: 'INACTIVE' },
      });
      expect(deactivateRes.status()).toBe(200);

      // Thử login → 403 hoặc 401
      const loginRes = await request.post(`${API}/api/auth/login`, {
        data: { username, password: 'TestPass123@' },
      });
      expect([401, 403]).toContain(loginRes.status());
      const loginBody = await loginRes.json();
      expect(loginBody.success).toBe(false);
    },
  );
});

// ─── TC-USR-006: Admin reset mật khẩu cho user ────────────────────────────

test.describe('TC-USR-006: Admin reset user password', () => {
  let userId: string;
  let username: string;

  test.beforeAll(async ({ request }) => {
    const user = await createUser(request, { role: 'STAFF' });
    userId = user.id;
    username = user.username;
  });

  test.afterAll(async ({ request }) => {
    try { await deactivateUser(request, userId); } catch {}
  });

  test(
    '[TC-USR-006] Admin reset password → user login được với mật khẩu mới',
    {
      annotation: [
        { type: 'testcase', description: 'TC-USR-006' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);
      const newPassword = `NewPass${uniqueSuffix().slice(0, 6)}@`;

      const res = await request.patch(`${API}/api/users/${userId}/reset-password`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { newPassword },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);

      // Verify login với password mới
      const loginRes = await request.post(`${API}/api/auth/login`, {
        data: { username, password: newPassword },
      });
      expect(loginRes.status()).toBe(200);
    },
  );
});

// ─── TC-USR-007: Cập nhật profile của bản thân ────────────────────────────

test.describe('TC-USR-007: Update own profile', () => {
  test(
    '[TC-USR-007] PATCH /api/auth/me/profile → cập nhật fullName/email',
    {
      annotation: [
        { type: 'testcase', description: 'TC-USR-007' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);
      const newFullName = `Admin Updated ${uniqueSuffix().slice(0, 8)}`;

      // Lấy email hiện tại để không bị conflict
      const meRes = await apiGet(request, '/api/auth/me', token);
      const meData = (await meRes.json()).data;
      const currentEmail = meData.user?.email ?? meData.email;

      const res = await request.patch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { fullName: newFullName, email: currentEmail },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      const updatedUser = body.data?.user ?? body.data;
      expect(updatedUser.fullName ?? updatedUser.full_name).toBe(newFullName);
    },
  );
});

// ─── TC-USR-008: Đổi mật khẩu sai mật khẩu cũ → 400 ────────────────────

test.describe('TC-USR-008: Change password - wrong old password', () => {
  test(
    '[TC-USR-008] PATCH /api/auth/me/password với mật khẩu cũ sai → 400',
    {
      annotation: [
        { type: 'testcase', description: 'TC-USR-008' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.patch(`${API}/api/auth/change-password`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          currentPassword: 'WrongOldPassword123!',
          newPassword: 'NewValidPass123@',
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    },
  );
});
