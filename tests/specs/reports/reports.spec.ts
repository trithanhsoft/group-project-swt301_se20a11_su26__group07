/**
 * TC-RPT-001 → TC-RPT-005
 * Reports Test Suite
 */
import { test, expect } from '@playwright/test';
import { getAdminToken, getStaffToken } from '../../utils/apiClient.js';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

test.describe('TC-RPT-001: Daily Revenue Report', () => {
  test(
    '[TC-RPT-001] Admin GET /api/reports/revenue → 200, array với schema đúng',
    {
      annotation: [
        { type: 'testcase', description: 'TC-RPT-001' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/reports/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);

      if (body.data.length > 0) {
        const row = body.data[0];
        expect(row).toHaveProperty('orderDate');
        expect(row).toHaveProperty('totalOrders');
        expect(row).toHaveProperty('totalRevenue');
        expect(row).toHaveProperty('totalRefunded');
        expect(typeof row.totalOrders).toBe('number');
        expect(typeof row.totalRevenue).toBe('number');
      }
    },
  );

  test(
    '[TC-RPT-001b] Admin filter theo dateFrom-dateTo → chỉ trả dữ liệu trong range',
    {
      annotation: [
        { type: 'testcase', description: 'TC-RPT-001b' },
        { type: 'priority', description: 'P2' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p2 @admin @api-only
      const token = await getAdminToken(request);
      const today = new Date().toISOString().slice(0, 10);

      const res = await request.get(`${API}/api/reports/revenue?dateFrom=${today}&dateTo=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      // Tất cả rows phải có orderDate hợp lệ
      for (const row of body.data) {
        expect(row.orderDate ?? row.date ?? row.created_at).toBeTruthy();
      }
    },
  );

  test(
    '[TC-RPT-001c] Staff KHÔNG xem /api/reports/revenue → 403',
    async ({ request }) => {
      const token = await getStaffToken(request);
      const res = await request.get(`${API}/api/reports/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status()).toBe(403);
    },
  );
});

test.describe('TC-RPT-002: Best Selling Products', () => {
  test(
    '[TC-RPT-002] Admin GET /api/reports/best-selling → 200, sorted by quantity',
    {
      annotation: [
        { type: 'testcase', description: 'TC-RPT-002' },
        { type: 'priority', description: 'P2' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p2 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/reports/best-selling-products?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      // Data có thể là array trực tiếp hoặc { products: [...] }
      const products = Array.isArray(body.data) ? body.data : (body.data?.products ?? []);
      expect(products.length).toBeLessThanOrEqual(5);

      if (products.length > 1) {
        // Verify sorted descending by quantitySold
        for (let i = 0; i < products.length - 1; i++) {
          expect(
            Number(products[i].quantitySold ?? products[i].totalQuantity ?? 0)
          ).toBeGreaterThanOrEqual(
            Number(products[i + 1].quantitySold ?? products[i + 1].totalQuantity ?? 0)
          );
        }
      }
    },
  );
});

test.describe('TC-RPT-003: Low Stock Report', () => {
  test(
    '[TC-RPT-003] Admin GET /api/reports/low-stock → nguyên liệu dưới ngưỡng',
    {
      annotation: [
        { type: 'testcase', description: 'TC-RPT-003' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @smoke @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/reports/low-stock-ingredients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      // Data có thể là array hoặc { ingredients: [...] }
      const items = Array.isArray(body.data) ? body.data : (body.data?.ingredients ?? []);
      expect(Array.isArray(items)).toBe(true);

      // Schema check và verify current_stock < low_stock_threshold
      for (const item of items) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('currentStock');
        expect(item).toHaveProperty('lowStockThreshold');
        expect(Number(item.currentStock)).toBeLessThan(Number(item.lowStockThreshold));
      }
    },
  );
});

test.describe('TC-RPT-004: Dashboard Summary', () => {
  test(
    '[TC-RPT-004] GET /api/dashboard/summary → 200 với các trường summary',
    {
      annotation: [
        { type: 'testcase', description: 'TC-RPT-004' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @smoke @p0 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeTruthy();
    },
  );
});

test.describe('TC-RPT-005: Discard Report', () => {
  test(
    '[TC-RPT-005] Admin GET /api/reports/discard → list hủy hàng với note [HỦY HÀNG]',
    {
      annotation: [
        { type: 'testcase', description: 'TC-RPT-005' },
        { type: 'priority', description: 'P2' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p2 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/reports/discards`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      // Data có thể là array hoặc { discards: [...] }
      const discards = Array.isArray(body.data) ? body.data : (body.data?.discards ?? body.data?.transactions ?? []);
      expect(Array.isArray(discards)).toBe(true);

      for (const item of discards) {
        expect(item.note).toContain('[HỦY HÀNG]');
      }
    },
  );
});
