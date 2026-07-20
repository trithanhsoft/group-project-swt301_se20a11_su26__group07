/**
 * Auth setup — lưu storageState cho ADMIN
 * Chạy một lần trước toàn bộ test suite (project: setup:admin)
 */
import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_STATE = path.join(__dirname, '../fixtures/auth/admin.json');

setup('authenticate as ADMIN', async ({ page }) => {
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin123@';

  await page.goto('/login');
  await expect(page.getByText('Đăng nhập hệ thống')).toBeVisible();

  await page.getByLabel('Tên đăng nhập').fill(username);
  await page.getByLabel('Mật khẩu').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // Sau khi đăng nhập thành công → redirect tới /admin/dashboard
  await expect(page).toHaveURL(/\/admin\/dashboard/);

  // Lưu storage state (cookies + localStorage)
  await page.context().storageState({ path: ADMIN_STATE });
});
