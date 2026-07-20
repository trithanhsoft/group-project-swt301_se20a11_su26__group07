import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.test') });

const WEB_BASE_URL = process.env.WEB_BASE_URL ?? 'http://127.0.0.1:5173';
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://127.0.0.1:5000';

export default defineConfig({
  testDir: './specs',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  use: {
    baseURL: WEB_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    extraHTTPHeaders: {
      'Accept-Language': 'vi-VN,vi;q=0.9',
    },
  },

  projects: [
    // ── Auth setup ──────────────────────────────────────────────────
    {
      name: 'setup:admin',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'setup:staff',
      testMatch: /staff\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Default: API tests (không cần storageState / browser) ────────
    // Dùng khi chạy: npx playwright test --project=api-tests
    {
      name: 'api-tests',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
      grepInvert: /@ui/,
    },

    // ── Desktop Chromium Admin (UI tests cho admin routes) ───────────
    {
      name: 'chromium:admin',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        storageState: 'fixtures/auth/admin.json',
      },
      dependencies: ['setup:admin'],
      grepInvert: /@api-only/,
      grep: /@admin/,
    },

    // ── Desktop Chromium Staff (UI tests cho staff routes) ───────────
    {
      name: 'chromium:staff',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        storageState: 'fixtures/auth/staff.json',
      },
      dependencies: ['setup:staff'],
      grepInvert: /@api-only/,
      grep: /@staff/,
    },

    // ── Public (no auth) UI tests ────────────────────────────────────
    {
      name: 'chromium:public',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
      grep: /@public/,
    },

    // ── Mobile viewport ──────────────────────────────────────────────
    {
      name: 'mobile:admin',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 812 },
        storageState: 'fixtures/auth/admin.json',
      },
      dependencies: ['setup:admin'],
      grep: /@mobile/,
    },

    // ── Firefox smoke ────────────────────────────────────────────────
    {
      name: 'firefox:smoke',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'fixtures/auth/admin.json',
      },
      dependencies: ['setup:admin'],
      grep: /@smoke/,
    },
  ],

  webServer: process.env.CI
    ? [
        {
          command: 'npm run dev',
          cwd: '../backend',
          url: `${API_BASE_URL}/api/health`,
          reuseExistingServer: false,
          timeout: 60_000,
        },
        {
          command: 'npm run dev',
          cwd: '../frontend',
          url: WEB_BASE_URL,
          reuseExistingServer: false,
          timeout: 60_000,
        },
      ]
    : [],
});
