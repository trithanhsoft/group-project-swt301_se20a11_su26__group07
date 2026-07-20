/**
 * TC-ING-001 → TC-ING-008
 * Ingredients Test Suite
 *
 * @tags @regression @admin @api
 */
import { test, expect } from '@playwright/test';
import { getAdminToken, getStaffToken, apiGet, uniqueSuffix } from '../../utils/apiClient.js';
import { createIngredient, deleteIngredient } from '../../utils/factories.js';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

// ─── TC-ING-001: Lấy danh sách nguyên liệu ────────────────────────────────

test.describe('TC-ING-001: List ingredients', () => {
  test(
    '[TC-ING-001] GET /api/ingredients → 200, array với schema đúng',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ING-001' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @smoke @p0 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/ingredients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      // API trả { data: { ingredients: [...], tags: [...] } }
      expect(body.data).toHaveProperty('ingredients');
      expect(Array.isArray(body.data.ingredients)).toBe(true);

      if (body.data.ingredients.length > 0) {
        const item = body.data.ingredients[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('unit');
        expect(item).toHaveProperty('currentStock');
        expect(item).toHaveProperty('lowStockThreshold');
        expect(['GRAM', 'ML', 'PIECE', 'LITER', 'KG', 'OTHER']).toContain(item.unit);
      }
    },
  );
});

// ─── TC-ING-002: Tạo nguyên liệu mới ─────────────────────────────────────

test.describe('TC-ING-002: Create ingredient', () => {
  let createdId: string;

  test.afterAll(async ({ request }) => {
    if (createdId) {
      try { await deleteIngredient(request, createdId); } catch {}
    }
  });

  test(
    '[TC-ING-002] Admin tạo nguyên liệu → 201, schema đúng',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ING-002' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p0 @admin @api-only
      const token = await getAdminToken(request);
      const suffix = uniqueSuffix();

      const res = await request.post(`${API}/api/ingredients`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          name: `New Ingredient ${suffix}`,
          unit: 'ML',
          currentStock: 2000,
          lowStockThreshold: 200,
          tag: 'Sữa',
        },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      // API trả { data: { ingredient: {...} } }
      const ingredient = body.data.ingredient;
      expect(ingredient.unit).toBe('ML');
      expect(Number(ingredient.currentStock)).toBe(0); // Backend initializes new ingredient stock to 0
      expect(Number(ingredient.lowStockThreshold)).toBe(200);
      expect(ingredient.id).toBeTruthy();

      createdId = ingredient.id;
    },
  );
});

// ─── TC-ING-003: Tạo nguyên liệu với unit không hợp lệ → 400 ───────────

test.describe('TC-ING-003: Invalid unit', () => {
  test(
    '[TC-ING-003] Unit không hợp lệ → 400',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ING-003' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.post(`${API}/api/ingredients`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          name: `Invalid Unit ${uniqueSuffix()}`,
          unit: 'CUPS',   // unit không hợp lệ
          currentStock: 100,
          lowStockThreshold: 10,
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    },
  );
});

// ─── TC-ING-004: Cập nhật nguyên liệu ────────────────────────────────────

test.describe('TC-ING-004: Update ingredient', () => {
  let ingredientId: string;

  test.beforeAll(async ({ request }) => {
    const ingredient = await createIngredient(request, {
      name: `Update Ing ${uniqueSuffix()}`,
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
    '[TC-ING-004] Cập nhật ngưỡng cảnh báo → lưu giá trị mới',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ING-004' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);
      const newThreshold = 200;

      const res = await request.patch(`${API}/api/ingredients/${ingredientId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { lowStockThreshold: newThreshold },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      // API trả { data: { ingredient: {...} } }
      expect(Number(body.data.ingredient.lowStockThreshold)).toBe(newThreshold);

      // Verify
      const getRes = await apiGet(request, `/api/ingredients/${ingredientId}`, token);
      const updated = (await getRes.json()).data.ingredient;
      expect(Number(updated.lowStockThreshold)).toBe(newThreshold);
    },
  );
});

// ─── TC-ING-005: Xóa mềm nguyên liệu ────────────────────────────────────

test.describe('TC-ING-005: Soft delete ingredient', () => {
  let ingredientId: string;

  test.beforeAll(async ({ request }) => {
    const ingredient = await createIngredient(request, {
      name: `Delete Ing ${uniqueSuffix()}`,
      unit: 'GRAM',
      currentStock: 100,
      lowStockThreshold: 10,
    });
    ingredientId = ingredient.id;
  });

  test(
    '[TC-ING-005] Admin xóa nguyên liệu → 200/204, GET trả 404',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ING-005' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.delete(`${API}/api/ingredients/${ingredientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect([200, 204]).toContain(res.status());

      // Sau khi delete, GET /:id vẫn có thể 200 nhưng soft-deleted
      // Hoặc 404 nếu service ẩn deleted items
      const getRes = await apiGet(request, `/api/ingredients/${ingredientId}`, token);
      // Ingredient đã bị soft-delete → 404
      expect(getRes.status()).toBe(404);
    },
  );
});

// ─── TC-ING-006: Stock thấp xuất hiện trong low-stock report ─────────────

test.describe('TC-ING-006: Low stock detection', () => {
  let ingredientId: string;

  test.beforeAll(async ({ request }) => {
    // Tạo nguyên liệu với stock < threshold
    const ingredient = await createIngredient(request, {
      name: `Low Stock Alert ${uniqueSuffix()}`,
      unit: 'GRAM',
      currentStock: 10,    // thấp
      lowStockThreshold: 100, // threshold cao
    });
    ingredientId = ingredient.id;
  });

  test.afterAll(async ({ request }) => {
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-ING-006] Nguyên liệu stock < threshold → xuất hiện trong /api/reports/low-stock',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ING-006' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      // Đúng endpoint
      const res = await request.get(`${API}/api/reports/low-stock-ingredients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();

      const items: Array<{ id: string }> = body.data?.ingredients ?? body.data ?? [];
      const found = items.some((item) => item.id === ingredientId);
      expect(found).toBe(true);
    },
  );
});

// ─── TC-ING-007: Staff chỉ đọc, không tạo được nguyên liệu ──────────────

test.describe('TC-ING-007: Staff cannot create ingredient', () => {
  test(
    '[TC-ING-007] Staff POST /api/ingredients → 403',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ING-007' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @staff @api-only
      const token = await getStaffToken(request);

      const res = await request.post(`${API}/api/ingredients`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          name: `Staff Create Ing ${uniqueSuffix()}`,
          unit: 'GRAM',
          currentStock: 100,
          lowStockThreshold: 10,
        },
      });

      expect(res.status()).toBe(403);
    },
  );
});

// ─── TC-ING-008: Kiểm kho hàng ngày ──────────────────────────────────────

test.describe('TC-ING-008: Daily stock count', () => {
  let ingredientId: string;

  test.beforeAll(async ({ request }) => {
    const ingredient = await createIngredient(request, {
      name: `Daily Count ${uniqueSuffix()}`,
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
    '[TC-ING-008] Kiểm kho với số lượng thực khác → tạo giao dịch ADJUST',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ING-008' },
        { type: 'priority', description: 'P2' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p2 @admin @api-only
      const token = await getAdminToken(request);
      const actualCount = 450; // Số thực đếm được (khác với 500)

      const res = await request.post(`${API}/api/stock/count/daily`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          // Field actualStock theo normalizeDailyCountItems trong stock.service.js
          items: [{ ingredientId, actualStock: actualCount }],
        },
      });

      // 201 nếu có chênh lệch, 200 nếu không
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body.success).toBe(true);

      // Stock phải = actualCount sau khi count
      const ingAfter = await apiGet(request, `/api/ingredients/${ingredientId}`, token);
      const stockAfter = Number((await ingAfter.json()).data.ingredient?.currentStock ?? (await ingAfter.json()).data.currentStock);
      expect(stockAfter).toBe(actualCount);
    },
  );
});
