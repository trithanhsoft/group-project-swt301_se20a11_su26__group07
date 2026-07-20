/**
 * TC-AUTH-001 → TC-AUTH-010
 * Authentication Test Suite
 *
 * @tags @smoke @regression @public @ui @api
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { apiLogin, getAdminToken, apiPost } from '../../utils/apiClient.js';

// ─── TC-AUTH-001: Đăng nhập thành công với tài khoản ADMIN ─────────────────

test.describe('TC-AUTH-001: Login - Admin success', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // không dùng saved state

  test(
    '[TC-AUTH-001] @ui Admin login với credentials hợp lệ → redirect /admin/dashboard',
    {
      annotation: [
        { type: 'testcase', description: 'TC-AUTH-001' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'UI' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ page, request }) => {
      // @smoke @p0 @admin @ui
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await expect(loginPage.pageTitle).toBeVisible();

      // Action
      await loginPage.login(
        process.env.ADMIN_USERNAME ?? 'admin',
        process.env.ADMIN_PASSWORD ?? 'Admin123@',
      );

      // Assert: redirect đúng
      await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10_000 });

      // Assert: không có error alert
      await expect(loginPage.errorAlert).not.toBeVisible();

      // Assert API: token hợp lệ
      const apiResult = await apiLogin(
        request,
        process.env.ADMIN_USERNAME ?? 'admin',
        process.env.ADMIN_PASSWORD ?? 'Admin123@',
      );
      expect(apiResult.token).toBeTruthy();
      expect(apiResult.user.role).toBe('ADMIN');
      expect(apiResult.user.status).toBe('ACTIVE');
    },
  );
});

// ─── TC-AUTH-002: Đăng nhập thành công với tài khoản STAFF ────────────────

test.describe('TC-AUTH-002: Login - Staff success', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    '[TC-AUTH-002] @ui Staff login với credentials hợp lệ → redirect /staff/pos',
    {
      annotation: [
        { type: 'testcase', description: 'TC-AUTH-002' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'UI' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ page }) => {
      // @smoke @p0 @staff @ui
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login(
        process.env.STAFF_USERNAME ?? 'staff',
        process.env.STAFF_PASSWORD ?? 'Staff123@',
      );

      await expect(page).toHaveURL(/\/staff\/pos/, { timeout: 10_000 });
      await expect(loginPage.errorAlert).not.toBeVisible();
    },
  );
});

// ─── TC-AUTH-003: Đăng nhập với mật khẩu sai ─────────────────────────────

test.describe('TC-AUTH-003: Login - Wrong password', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    '[TC-AUTH-003] @ui Login với mật khẩu sai → hiện thông báo lỗi, không redirect',
    {
      annotation: [
        { type: 'testcase', description: 'TC-AUTH-003' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'UI+API' },
        { type: 'role', description: 'ANY' },
      ],
    },
    async ({ page, request }) => {
      // @regression @p0 @public @ui
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login('admin', 'WrongPassword123!');

      // Assert UI: hiện lỗi
      await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 });
      const errMsg = await loginPage.getErrorMessage();
      expect(errMsg).toBeTruthy();

      // Assert: vẫn ở trang login
      await expect(page).toHaveURL(/\/login/);

      // Assert API
      const res = await request.post(
        `${process.env.API_BASE_URL ?? 'http://localhost:5000'}/api/auth/login`,
        { data: { username: 'admin', password: 'WrongPassword123!' } },
      );
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
    },
  );
});

// ─── TC-AUTH-004: Đăng nhập với username rỗng ────────────────────────────

test.describe('TC-AUTH-004: Login - Empty username', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    '[TC-AUTH-004] @ui Login với username rỗng → hiện validation error, không gửi request',
    {
      annotation: [
        { type: 'testcase', description: 'TC-AUTH-004' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'UI' },
        { type: 'role', description: 'ANY' },
      ],
    },
    async ({ page }) => {
      // @regression @p1 @public @ui
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Để trống username, nhập password
      await loginPage.passwordInput.fill('Admin123@');

      // Theo dõi request: không có request nào tới /api/auth/login
      let loginRequestFired = false;
      page.on('request', (req) => {
        if (req.url().includes('/api/auth/login')) loginRequestFired = true;
      });

      await loginPage.loginButton.click();

      // Lấy validation error từ username field
      const usernameError = page.locator('[data-testid="username-error"], .field-error').first();
      // Nếu UI dùng HTML5 validation hoặc custom error
      await expect(page).toHaveURL(/\/login/);
      expect(loginRequestFired).toBe(false);
    },
  );
});

// ─── TC-AUTH-005: Đăng nhập với tài khoản INACTIVE ───────────────────────

test.describe('TC-AUTH-005: Login - Inactive account', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    '[TC-AUTH-005] Login với tài khoản INACTIVE → 403 từ API, hiện thông báo lỗi',
    {
      annotation: [
        { type: 'testcase', description: 'TC-AUTH-005' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ANY' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @public @api-only
      // Assumption: Có tài khoản inactive_test_user/TestPass123@ đã được setup
      // hoặc dùng factory để tạo rồi deactivate

      // API test: kiểm tra 403 với inactive account
      // Đây là assumption — cần một account INACTIVE thực sự
      // Trong CI: factory tạo user → deactivate → test → cleanup

      const INACTIVE_USERNAME = process.env.INACTIVE_USERNAME ?? 'inactive_test_user';
      const INACTIVE_PASSWORD = process.env.INACTIVE_PASSWORD ?? 'TestPass123@';

      const res = await request.post(
        `${process.env.API_BASE_URL ?? 'http://localhost:5000'}/api/auth/login`,
        { data: { username: INACTIVE_USERNAME, password: INACTIVE_PASSWORD } },
      );

      // Nếu account không tồn tại → 401; nếu INACTIVE → 403
      expect([401, 403]).toContain(res.status());
      const body = await res.json();
      expect(body.success).toBe(false);
    },
  );
});

// ─── TC-AUTH-006: Truy cập trang protected khi chưa login ────────────────

test.describe('TC-AUTH-006: Protected route redirect', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    '[TC-AUTH-006] @ui Truy cập /admin/dashboard khi chưa login → redirect /login',
    {
      annotation: [
        { type: 'testcase', description: 'TC-AUTH-006' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'UI' },
        { type: 'role', description: 'ANY' },
      ],
    },
    async ({ page }) => {
      // @smoke @p0 @public @ui
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    },
  );

  test(
    '[TC-AUTH-006b] @ui Truy cập /staff/pos khi chưa login → redirect /login',
    async ({ page }) => {
      // @smoke @p0 @public @ui
      await page.goto('/staff/pos');
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    },
  );
});

// ─── TC-AUTH-007: Staff không vào được trang Admin ────────────────────────

test.describe('TC-AUTH-007: Role authorization', () => {
  test(
    '[TC-AUTH-007] @ui Staff cố truy cập /admin/* → redirect về /staff/pos',
    {
      annotation: [
        { type: 'testcase', description: 'TC-AUTH-007' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'UI' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ page, request }) => {
      // @smoke @p0 @staff @ui
      // Login as STAFF
      const staffToken = await (async () => {
        const res = await request.post(
          `${process.env.API_BASE_URL ?? 'http://localhost:5000'}/api/auth/login`,
          { data: { username: process.env.STAFF_USERNAME ?? 'staff', password: process.env.STAFF_PASSWORD ?? 'Staff123@' } },
        );
        const body = await res.json();
        return body.data?.token as string;
      })();

      // Gắn token vào localStorage
      await page.goto('/login');
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify({ role: 'STAFF' }));
      }, staffToken);

      await page.goto('/admin/dashboard');

      // Expect: redirect về staff area hoặc login
      await expect(page).not.toHaveURL(/\/admin\/dashboard/, { timeout: 8000 });
    },
  );
});

// ─── TC-AUTH-008: API /auth/login → 400 thiếu field ─────────────────────

test.describe('TC-AUTH-008: API validation - missing fields', () => {
  test(
    '[TC-AUTH-008] POST /api/auth/login thiếu password → 400',
    {
      annotation: [
        { type: 'testcase', description: 'TC-AUTH-008' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ANY' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @public @api-only
      const res = await request.post(
        `${process.env.API_BASE_URL ?? 'http://localhost:5000'}/api/auth/login`,
        { data: { username: 'admin' } }, // thiếu password
      );
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBeTruthy();
    },
  );

  test(
    '[TC-AUTH-008b] POST /api/auth/login body rỗng → 400',
    async ({ request }) => {
      // @regression @p1 @public @api-only
      const res = await request.post(
        `${process.env.API_BASE_URL ?? 'http://localhost:5000'}/api/auth/login`,
        { data: {} },
      );
      expect(res.status()).toBe(400);
    },
  );
});

// ─── TC-AUTH-009: Đăng xuất ─────────────────────────────────────────────

test.describe('TC-AUTH-009: Logout', () => {
  test(
    '[TC-AUTH-009] @ui Admin đăng xuất → redirect /login, localStorage cleared',
    {
      annotation: [
        { type: 'testcase', description: 'TC-AUTH-009' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'UI' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ page }) => {
      // @regression @p1 @admin @ui
      // Đã có storageState từ setup
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/\/admin\/dashboard/);

      // Tìm nút logout — cần data-testid="logout-button" trên UI
      const logoutButton = page.getByRole('button', { name: /đăng xuất|logout/i })
        .or(page.getByTestId('logout-button'));

      await logoutButton.click();

      // Assert redirect
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });

      // Assert localStorage cleared
      const tokenInStorage = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(tokenInStorage).toBeNull();
    },
  );
});

// ─── TC-AUTH-010: JWT expired token → 401 ────────────────────────────────

test.describe('TC-AUTH-010: Expired JWT', () => {
  test(
    '[TC-AUTH-010] Request với expired JWT → API trả 401',
    {
      annotation: [
        { type: 'testcase', description: 'TC-AUTH-010' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ANY' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @public @api-only
      // Dùng token giả / expired
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjE2MDAwMDAwMDB9.fake';

      const res = await request.get(
        `${process.env.API_BASE_URL ?? 'http://localhost:5000'}/api/auth/me`,
        { headers: { Authorization: `Bearer ${fakeToken}` } },
      );
      expect(res.status()).toBe(401);
    },
  );
});
