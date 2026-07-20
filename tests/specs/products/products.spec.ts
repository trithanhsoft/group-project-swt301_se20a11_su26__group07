/**
 * TC-PROD-001 → TC-PROD-010
 * Products & Recipes Test Suite
 *
 * @tags @regression @admin @ui @api
 */
import { test, expect } from '@playwright/test';
import { getAdminToken, apiGet, apiPost, apiDelete, uniqueSuffix } from '../../utils/apiClient.js';
import {
  createIngredient,
  createProduct,
  createRecipe,
  deleteProduct,
  deleteIngredient,
} from '../../utils/factories.js';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

// ─── TC-PROD-001: Lấy danh sách sản phẩm ─────────────────────────────────

test.describe('TC-PROD-001: List products', () => {
  test(
    '[TC-PROD-001] GET /api/products → 200, trả về array đúng schema',
    {
      annotation: [
        { type: 'testcase', description: 'TC-PROD-001' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @smoke @p0 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      const products = Array.isArray(body.data) ? body.data : (body.data?.products ?? []);
      expect(Array.isArray(products)).toBe(true);

      if (products.length > 0) {
        const item = products[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('status');
        expect(['ACTIVE', 'INACTIVE']).toContain(item.status);
      }
    },
  );
});

// ─── TC-PROD-002: Tạo sản phẩm mới (Admin) ────────────────────────────────

test.describe('TC-PROD-002: Create product', () => {
  let createdProductId: string;

  test.afterAll(async ({ request }) => {
    if (createdProductId) {
      try { await deleteProduct(request, createdProductId); } catch {}
    }
  });

  test(
    '[TC-PROD-002] Admin tạo sản phẩm mới → 201, trả đúng thông tin',
    {
      annotation: [
        { type: 'testcase', description: 'TC-PROD-002' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p0 @admin @api-only
      const token = await getAdminToken(request);
      const suffix = uniqueSuffix();
      const productName = `New Product ${suffix}`;

      const res = await request.post(`${API}/api/products`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          name: productName,
          price: 35000,
          status: 'ACTIVE',
          tag: 'Coffee',
        },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      const product = body.data?.product ?? body.data;
      expect(Number(product.price)).toBe(35000);
      expect(product.status).toBe('ACTIVE');
      expect(product.id).toBeTruthy();

      createdProductId = product.id;
    },
  );
});

// ─── TC-PROD-003: Tạo sản phẩm tên trùng → 409 ────────────────────────────

test.describe('TC-PROD-003: Duplicate product name', () => {
  let productId: string;

  test.beforeAll(async ({ request }) => {
    const product = await createProduct(request, { name: `Dup Test ${uniqueSuffix()}`, price: 30000, status: 'ACTIVE' });
    productId = product.id;
  });

  test.afterAll(async ({ request }) => {
    try { await deleteProduct(request, productId); } catch {}
  });

  test(
    '[TC-PROD-003] Tạo sản phẩm tên đã tồn tại → 409 Conflict',
    {
      annotation: [
        { type: 'testcase', description: 'TC-PROD-003' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      // Lấy tên product vừa tạo
      const getRes = await apiGet(request, `/api/products/${productId}`, token);
      const existingName = (await getRes.json()).data.name;

      // Cố tạo lại với tên trùng (case-insensitive)
      const res = await request.post(`${API}/api/products`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { name: existingName, price: 50000, status: 'ACTIVE' },
      });

      expect([400, 409]).toContain(res.status());
      const body = await res.json();
      expect(body.success).toBe(false);
    },
  );
});

// ─── TC-PROD-004: Tạo sản phẩm giá âm → 400 ──────────────────────────────

test.describe('TC-PROD-004: Invalid price', () => {
  test(
    '[TC-PROD-004] Giá <= 0 → 400 validation error',
    {
      annotation: [
        { type: 'testcase', description: 'TC-PROD-004' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      for (const price of [0, -100, -1]) {
        const res = await request.post(`${API}/api/products`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          data: { name: `Invalid Price ${uniqueSuffix()}`, price, status: 'ACTIVE' },
        });
        expect(res.status()).toBe(400);
      }
    },
  );
});

// ─── TC-PROD-005: Cập nhật sản phẩm ──────────────────────────────────────

test.describe('TC-PROD-005: Update product', () => {
  let productId: string;

  test.beforeAll(async ({ request }) => {
    const product = await createProduct(request, { name: `Update Test ${uniqueSuffix()}`, price: 30000, status: 'ACTIVE' });
    productId = product.id;
  });

  test.afterAll(async ({ request }) => {
    try { await deleteProduct(request, productId); } catch {}
  });

  test(
    '[TC-PROD-005] Admin cập nhật giá → giá mới được lưu',
    {
      annotation: [
        { type: 'testcase', description: 'TC-PROD-005' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);
      const newPrice = 55000;

      const res = await request.patch(`${API}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { price: newPrice },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      const product = body.data?.product ?? body.data;
      expect(Number(product.price)).toBe(newPrice);

      // Verify từ GET
      const getRes = await apiGet(request, `/api/products/${productId}`, token);
      const updatedBody = (await getRes.json()).data;
      const updatedProduct = updatedBody.product ?? updatedBody;
      expect(Number(updatedProduct.price)).toBe(newPrice);
    },
  );
});

// ─── TC-PROD-006: Xóa mềm sản phẩm ──────────────────────────────────────

test.describe('TC-PROD-006: Soft delete product', () => {
  let productId: string;

  test.beforeAll(async ({ request }) => {
    const product = await createProduct(request, { name: `Delete Test ${uniqueSuffix()}`, price: 30000, status: 'ACTIVE' });
    productId = product.id;
  });

  test(
    '[TC-PROD-006] Admin xóa sản phẩm → soft delete, không còn trong danh sách active',
    {
      annotation: [
        { type: 'testcase', description: 'TC-PROD-006' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.delete(`${API}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 200 hoặc 204
      expect([200, 204]).toContain(res.status());

      // Sau xóa: GET sẽ 404
      const getRes = await apiGet(request, `/api/products/${productId}`, token);
      expect(getRes.status()).toBe(404);
    },
  );
});

// ─── TC-PROD-007: Tạo công thức cho sản phẩm ─────────────────────────────

test.describe('TC-PROD-007: Create recipe', () => {
  let productId: string;
  let ingredientId: string;

  test.beforeAll(async ({ request }) => {
    const suffix = uniqueSuffix();
    const product = await createProduct(request, { name: `Recipe Prod ${suffix}`, price: 30000, status: 'ACTIVE' });
    productId = product.id;

    const ingredient = await createIngredient(request, {
      name: `Recipe Ing ${suffix}`,
      unit: 'GRAM',
      currentStock: 1000,
      lowStockThreshold: 50,
    });
    ingredientId = ingredient.id;
  });

  test.afterAll(async ({ request }) => {
    try { await deleteProduct(request, productId); } catch {}
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-PROD-007] Admin tạo công thức → 201, product có recipe',
    {
      annotation: [
        { type: 'testcase', description: 'TC-PROD-007' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p0 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.post(`${API}/api/recipes`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          productId,
          items: [{ ingredientId, quantity: 25 }],
        },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      const recipe = body.data.recipe ?? body.data;
      expect(recipe.productId ?? recipe.product_id).toBe(productId);

      // Verify recipe items
      const items = recipe.items ?? recipe.recipeItems ?? recipe.recipe_items;
      if (items) {
        expect(items.length).toBeGreaterThanOrEqual(1);
        const item = items[0];
        expect(item.ingredientId ?? item.ingredient_id).toBe(ingredientId);
        expect(Number(item.quantity ?? item.quantityRequired ?? item.quantity_required)).toBe(25);
      }
    },
  );
});

// ─── TC-PROD-008: Sản phẩm INACTIVE không thể thêm vào đơn ───────────────

test.describe('TC-PROD-008: INACTIVE product cannot be ordered', () => {
  let ingredientId: string;
  let inactiveProductId: string;
  let sessionId: string;

  test.beforeAll(async ({ request }) => {
    const suffix = uniqueSuffix();

    const ingredient = await createIngredient(request, {
      name: `Inactive Prod Ing ${suffix}`,
      unit: 'GRAM',
      currentStock: 1000,
      lowStockThreshold: 50,
    });
    ingredientId = ingredient.id;

    const product = await createProduct(request, {
      name: `Inactive Product ${suffix}`,
      price: 30000,
      status: 'INACTIVE',
    });
    inactiveProductId = product.id;

    await createRecipe(request, inactiveProductId, [
      { ingredientId, quantityRequired: 20 },
    ]);

    // Mở ca
    const { openPosSession } = await import('../../utils/factories.js');
    const session = await openPosSession(request, 500000);
    sessionId = session.id;
  });

  test.afterAll(async ({ request }) => {
    const { closePosSession } = await import('../../utils/factories.js');
    try { await closePosSession(request, sessionId); } catch {}
    try { await deleteProduct(request, inactiveProductId); } catch {}
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-PROD-008] Đặt sản phẩm INACTIVE → 400',
    {
      annotation: [
        { type: 'testcase', description: 'TC-PROD-008' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @staff @api-only
      const { getStaffToken } = await import('../../utils/apiClient.js');
      const token = await getStaffToken(request);

      const res = await request.post(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          items: [{ productId: inactiveProductId, quantity: 1 }],
          paymentMethod: 'CASH',
          amountReceived: 50000,
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message.toLowerCase()).toMatch(/inactive|không hoạt động/i);
    },
  );
});

// ─── TC-PROD-009: Sản phẩm không có recipe không thể bán ─────────────────

test.describe('TC-PROD-009: Product without recipe cannot be ordered', () => {
  let noRecipeProductId: string;
  let sessionId: string;

  test.beforeAll(async ({ request }) => {
    const product = await createProduct(request, {
      name: `No Recipe ${uniqueSuffix()}`,
      price: 30000,
      status: 'ACTIVE',
    });
    noRecipeProductId = product.id;
    // Không tạo recipe!

    const { openPosSession } = await import('../../utils/factories.js');
    const session = await openPosSession(request, 500000);
    sessionId = session.id;
  });

  test.afterAll(async ({ request }) => {
    const { closePosSession } = await import('../../utils/factories.js');
    try { await closePosSession(request, sessionId); } catch {}
    try { await deleteProduct(request, noRecipeProductId); } catch {}
  });

  test(
    '[TC-PROD-009] Bán sản phẩm không có công thức → 400',
    {
      annotation: [
        { type: 'testcase', description: 'TC-PROD-009' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ request }) => {
      // @regression @p0 @staff @api-only
      const { getStaffToken } = await import('../../utils/apiClient.js');
      const token = await getStaffToken(request);

      const res = await request.post(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          items: [{ productId: noRecipeProductId, quantity: 1 }],
          paymentMethod: 'CASH',
          amountReceived: 50000,
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message.toLowerCase()).toMatch(/recipe|công thức/i);
    },
  );
});

// ─── TC-PROD-010: Tên sản phẩm vượt 63 ký tự → 400 ──────────────────────

test.describe('TC-PROD-010: Product name too long', () => {
  test(
    '[TC-PROD-010] Tên sản phẩm > 63 ký tự → 400',
    {
      annotation: [
        { type: 'testcase', description: 'TC-PROD-010' },
        { type: 'priority', description: 'P2' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p2 @admin @api-only
      const token = await getAdminToken(request);
      const longName = 'A'.repeat(64);

      const res = await request.post(`${API}/api/products`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { name: longName, price: 30000, status: 'ACTIVE' },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    },
  );
});
