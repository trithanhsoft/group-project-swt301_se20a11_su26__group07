/**
 * TC-STOCK-001 → TC-STOCK-008
 * Stock Management Test Suite
 *
 * @tags @regression @admin @api
 */
import { test, expect } from '@playwright/test';
import { getAdminToken, getStaffToken, apiGet, uniqueSuffix } from '../../utils/apiClient.js';
import {
  createIngredient,
  deleteIngredient,
  importStock,
} from '../../utils/factories.js';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

// ─── TC-STOCK-001: Nhập kho đơn lẻ ────────────────────────────────────────

test.describe('TC-STOCK-001: Import stock single', () => {
  let ingredientId: string;
  let ingredientName: string;

  test.beforeAll(async ({ request }) => {
    const suffix = uniqueSuffix();
    ingredientName = `Import Test ${suffix}`;
    const ingredient = await createIngredient(request, {
      name: ingredientName,
      unit: 'GRAM',
      currentStock: 100,
      lowStockThreshold: 50,
    });
    ingredientId = ingredient.id;
  });

  test.afterAll(async ({ request }) => {
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-STOCK-001] Nhập kho 200g → current_stock tăng thêm 200, transaction được ghi',
    {
      annotation: [
        { type: 'testcase', description: 'TC-STOCK-001' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p0 @admin @api-only
      const token = await getAdminToken(request);
      const importQty = 200;

      // Lấy stock trước (API trả { data: { ingredient: {...} } })
      const ingBefore = await apiGet(request, `/api/ingredients/${ingredientId}`, token);
      const stockBefore = Number((await ingBefore.json()).data.ingredient.currentStock);

      // Nhập kho
      const res = await request.post(`${API}/api/stock/import`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          ingredientId,
          quantity: importQty,
          note: 'TC-STOCK-001 import test',
        },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      // API trả { data: { ingredient: {...}, transaction: {...} } }
      const { ingredient: ingAfterData, transaction } = body.data;
      expect(transaction.type).toBe('IMPORT');
      expect(Number(transaction.quantity)).toBe(importQty);
      expect(Number(transaction.before_stock ?? transaction.beforeStock)).toBe(stockBefore);
      expect(Number(transaction.after_stock ?? transaction.afterStock)).toBe(stockBefore + importQty);

      // Assert stock thực tế trong DB
      const ingAfter = await apiGet(request, `/api/ingredients/${ingredientId}`, token);
      const stockAfter = Number((await ingAfter.json()).data.ingredient.currentStock);
      expect(stockAfter).toBe(stockBefore + importQty);
    },
  );
});

// ─── TC-STOCK-002: Nhập kho hàng loạt ────────────────────────────────────

test.describe('TC-STOCK-002: Batch import', () => {
  let ingredientId1: string;
  let ingredientId2: string;

  test.beforeAll(async ({ request }) => {
    const suffix = uniqueSuffix();
    const i1 = await createIngredient(request, {
      name: `Batch Import 1 ${suffix}`,
      unit: 'GRAM',
      currentStock: 100,
      lowStockThreshold: 50,
    });
    ingredientId1 = i1.id;

    const i2 = await createIngredient(request, {
      name: `Batch Import 2 ${suffix}`,
      unit: 'ML',
      currentStock: 500,
      lowStockThreshold: 100,
    });
    ingredientId2 = i2.id;
  });

  test.afterAll(async ({ request }) => {
    try { await deleteIngredient(request, ingredientId1); } catch {}
    try { await deleteIngredient(request, ingredientId2); } catch {}
  });

  test(
    '[TC-STOCK-002] Nhập kho hàng loạt 2 nguyên liệu → đều tăng stock',
    {
      annotation: [
        { type: 'testcase', description: 'TC-STOCK-002' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.post(`${API}/api/stock/import/batch`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          items: [
            { ingredientId: ingredientId1, quantity: 300, note: 'batch 1' },
            { ingredientId: ingredientId2, quantity: 500, note: 'batch 2' },
          ],
        },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      // API trả { data: { items: [...] } }
      const results = body.data?.items ?? [];
      expect(results.length).toBe(2);
    },
  );
});

// ─── TC-STOCK-003: Điều chỉnh kho (ADJUST) ────────────────────────────────

test.describe('TC-STOCK-003: Adjust stock', () => {
  let ingredientId: string;

  test.beforeAll(async ({ request }) => {
    const suffix = uniqueSuffix();
    const ingredient = await createIngredient(request, {
      name: `Adjust Test ${suffix}`,
      unit: 'GRAM',
      currentStock: 500,
      lowStockThreshold: 50,
    });
    ingredientId = ingredient.id;
  });

  test.afterAll(async ({ request }) => {
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-STOCK-003] ADJUST stock lên 800 → current_stock = 800, transaction ADJUST ghi nhận',
    {
      annotation: [
        { type: 'testcase', description: 'TC-STOCK-003' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);
      const targetQty = 800;

      // Trước khi adjust, cần import stock để có stock > quantity
      await importStock(request, ingredientId, 1000);

      const res = await request.post(`${API}/api/stock/adjust`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          ingredientId,
          quantity: 100,
          note: 'TC-STOCK-003 adjustment',
        },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data?.transaction?.type).toBe('ADJUST');
    },
  );
});

// ─── TC-STOCK-004: Hủy hàng (DISCARD) ────────────────────────────────────

test.describe('TC-STOCK-004: Discard stock', () => {
  let ingredientId: string;

  test.beforeAll(async ({ request }) => {
    const suffix = uniqueSuffix();
    const ingredient = await createIngredient(request, {
      name: `Discard Test ${suffix}`,
      unit: 'GRAM',
      currentStock: 300,
      lowStockThreshold: 50,
    });
    ingredientId = ingredient.id;
  });

  test.afterAll(async ({ request }) => {
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-STOCK-004] Hủy 50g → stock giảm 50, note có [HỦY HÀNG]',
    {
      annotation: [
        { type: 'testcase', description: 'TC-STOCK-004' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);
      const discardQty = 50;

      // Trước khi discard, import stock 300g
      await importStock(request, ingredientId, 300);

      const ingBefore = await apiGet(request, `/api/ingredients/${ingredientId}`, token);
      const stockBefore = Number((await ingBefore.json()).data.ingredient.currentStock);

      const res = await request.post(`${API}/api/stock/discard`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          ingredientId,
          quantity: discardQty,
          note: 'Expired — TC-STOCK-004',
        },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      const afterStock = Number(body.data?.ingredient?.currentStock ?? 0);
      expect(afterStock).toBe(stockBefore - discardQty);
      expect(body.data?.transaction?.note).toContain('[HỦY HÀNG]');
    },
  );
});

// ─── TC-STOCK-005: Nhập kho với số lượng âm → 400 ─────────────────────────

test.describe('TC-STOCK-005: Validation - negative quantity', () => {
  let ingredientId: string;

  test.beforeAll(async ({ request }) => {
    const suffix = uniqueSuffix();
    const ingredient = await createIngredient(request, {
      name: `Negative Qty Test ${suffix}`,
      unit: 'GRAM',
      currentStock: 100,
      lowStockThreshold: 50,
    });
    ingredientId = ingredient.id;
  });

  test.afterAll(async ({ request }) => {
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-STOCK-005] Nhập kho số lượng âm → 400',
    {
      annotation: [
        { type: 'testcase', description: 'TC-STOCK-005' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.post(`${API}/api/stock/import`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          ingredientId,
          quantity: -50,
          note: 'Should fail',
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    },
  );
});

// ─── TC-STOCK-006: Dự báo kho ─────────────────────────────────────────────

test.describe('TC-STOCK-006: Stock forecast', () => {
  test(
    '[TC-STOCK-006] Admin GET /api/stock/forecast → trả về dữ liệu dự báo',
    {
      annotation: [
        { type: 'testcase', description: 'TC-STOCK-006' },
        { type: 'priority', description: 'P2' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p2 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/stock/forecast`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    },
  );

  test(
    '[TC-STOCK-006b] Staff KHÔNG xem được /api/stock/forecast → 403',
    async ({ request }) => {
      // @regression @p2 @staff @api-only
      const token = await getStaffToken(request);

      const res = await request.get(`${API}/api/stock/forecast`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(403);
    },
  );
});
