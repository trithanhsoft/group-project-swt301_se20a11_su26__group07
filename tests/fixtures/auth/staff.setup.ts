/**
 * Auth setup — lưu storageState cho STAFF
 */
import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STAFF_STATE = path.join(__dirname, '../fixtures/auth/staff.json');

setup('authenticate as STAFF', async ({ page }) => {
  const username = process.env.STAFF_USERNAME ?? 'staff';
  const password = process.env.STAFF_PASSWORD ?? 'Staff123@';

  await page.goto('/login');
  await expect(page.getByText('Đăng nhập hệ thống')).toBeVisible();

  await page.getByLabel('Tên đăng nhập').fill(username);
  await page.getByLabel('Mật khẩu').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // Sau khi đăng nhập thành công → redirect tới /staff/pos
  await expect(page).toHaveURL(/\/staff\/pos/);

  await page.context().storageState({ path: STAFF_STATE });
});
