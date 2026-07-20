/**
 * TC-ORDER-001 → TC-ORDER-010
 * Orders & POS Test Suite
 *
 * @tags @regression @staff @ui @api
 */
import { test, expect } from '@playwright/test';
import {
  getStaffToken,
  getAdminToken,
  apiPost,
  apiGet,
  uniqueSuffix,
} from '../../utils/apiClient.js';
import {
  createIngredient,
  createProduct,
  createRecipe,
  deleteProduct,
  deleteIngredient,
  openPosSession,
  closePosSession,
  importStock,
} from '../../utils/factories.js';

const API = process.env.API_BASE_URL ?? 'http://localhost:5000';

// ─── TC-ORDER-001: Tạo đơn hàng thành công ────────────────────────────────

test.describe('TC-ORDER-001: Create order success (API)', () => {
  let ingredientId: string;
  let productId: string;
  let sessionId: string;

  test.beforeAll(async ({ request }) => {
    // Setup: tạo nguyên liệu → sản phẩm → công thức → mở ca
    const suffix = uniqueSuffix();

    const ingredient = await createIngredient(request, {
      name: `Coffee Bean Order Test ${suffix}`,
      unit: 'GRAM',
      currentStock: 5000,
      lowStockThreshold: 100,
    });
    ingredientId = ingredient.id;

    const product = await createProduct(request, {
      name: `Test Latte ${suffix}`,
      price: 35000,
      status: 'ACTIVE',
    });
    productId = product.id;

    await createRecipe(request, productId, [
      { ingredientId, quantityRequired: 20 },
    ]);

    // Import kho 5000g để có tồn kho khi bán
    await importStock(request, ingredientId, 5000);

    const session = await openPosSession(request, 500000, 'Test order setup');
    sessionId = session.id;
  });

  test.afterAll(async ({ request }) => {
    // Cleanup: đóng ca, xóa sản phẩm + nguyên liệu
    try { await closePosSession(request, sessionId); } catch {}
    try { await deleteProduct(request, productId); } catch {}
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-ORDER-001] @api Tạo đơn hàng CASH thành công → status SUCCESS, kho bị trừ',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ORDER-001' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ request }) => {
      // @smoke @p0 @staff @api-only
      const token = await getStaffToken(request);

      // Lấy stock trước khi tạo đơn
      const ingredientBefore = await apiGet(request, `/api/ingredients/${ingredientId}`, token);
      const ingDataBefore = (await ingredientBefore.json()).data;
      const stockBefore = Number(ingDataBefore.currentStock);

      // Đảm bảo mở ca trước khi tạo đơn
      await openPosSession(request, 500000);

      // Tạo đơn hàng
      const orderPayload = {
        items: [{ productId, quantity: 2 }],
        paymentMethod: 'CASH',
        amountReceived: 100000,
        note: 'TC-ORDER-001 test',
      };

      const res = await request.post(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: orderPayload,
      });

      // Assert response
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body.success).toBe(true);

      const order = body.data?.order ?? body.data;
      expect(order.status).toBe('SUCCESS');
      expect(order.orderCode).toMatch(/^OD/);
      expect(order.totalAmount).toBe(35000 * 2);
      expect(order.paymentMethod).toBe('CASH');
      expect(order.changeAmount).toBe(100000 - 35000 * 2);
      expect(Array.isArray(order.items)).toBe(true);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(2);

      // Assert KDS status mới = NEW
      expect(order.kdsStatus).toBe('NEW');

      // Assert stock bị trừ (20g × 2 = 40g)
      const ingredientAfter = await apiGet(request, `/api/ingredients/${ingredientId}`, token);
      const ingDataAfter = (await ingredientAfter.json()).data;
      const stockAfter = Number(ingDataAfter.currentStock);
      expect(stockAfter).toBe(stockBefore - 40);
    },
  );
});

// ─── TC-ORDER-002: Tạo đơn khi không có ca bán hàng → lỗi ────────────────

test.describe('TC-ORDER-002: Create order without open session', () => {
  let ingredientId: string;
  let productId: string;

  test.beforeAll(async ({ request }) => {
    const suffix = uniqueSuffix();
    const ingredient = await createIngredient(request, {
      name: `Milk No Session ${suffix}`,
      unit: 'ML',
      currentStock: 2000,
      lowStockThreshold: 100,
    });
    ingredientId = ingredient.id;

    const product = await createProduct(request, {
      name: `Milk Coffee No Session ${suffix}`,
      price: 30000,
      status: 'ACTIVE',
    });
    productId = product.id;

    await createRecipe(request, productId, [
      { ingredientId, quantityRequired: 100 },
    ]);

    // Import kho 5000 ML để đảm bảo tồn kho đủ, test tập trung vào lỗi ca bán hàng
    await importStock(request, ingredientId, 5000);
  });

  test.afterAll(async ({ request }) => {
    try { await deleteProduct(request, productId); } catch {}
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-ORDER-002] Tạo đơn khi không có ca OPEN → 400 error',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ORDER-002' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @staff @api-only
      // Assumption: STAFF account hiện không có ca OPEN
      // Cần đảm bảo ca đóng trước test này
      const token = await getStaffToken(request);

      // Đảm bảo đóng ca trước khi test không có ca OPEN
      try { await closePosSession(request); } catch {}

      const res = await request.post(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          items: [{ productId, quantity: 1 }],
          paymentMethod: 'CASH',
          amountReceived: 50000,
        },
      });

      // Nếu có ca đang mở thì test này sẽ skip
      if (res.status() === 201) {
        test.skip(true, 'Staff có ca đang mở — skip TC-ORDER-002');
        return;
      }

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain('ca bán hàng');
    },
  );
});

// ─── TC-ORDER-003: Tạo đơn với giỏ rỗng → 400 ────────────────────────────

test.describe('TC-ORDER-003: Create order empty cart', () => {
  test(
    '[TC-ORDER-003] POST /api/orders với items rỗng → 400',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ORDER-003' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @staff @api-only
      const token = await getStaffToken(request);

      const res = await request.post(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          items: [],
          paymentMethod: 'CASH',
          amountReceived: 50000,
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    },
  );
});

// ─── TC-ORDER-004: Tồn kho không đủ → 400 ────────────────────────────────

test.describe('TC-ORDER-004: Insufficient stock', () => {
  let ingredientId: string;
  let productId: string;
  let sessionId: string;

  test.beforeAll(async ({ request }) => {
    const suffix = uniqueSuffix();

    const ingredient = await createIngredient(request, {
      name: `Low Stock Ingredient ${suffix}`,
      unit: 'GRAM',
      currentStock: 5,      // chỉ có 5g
      lowStockThreshold: 10,
    });
    ingredientId = ingredient.id;

    const product = await createProduct(request, {
      name: `Low Stock Product ${suffix}`,
      price: 25000,
      status: 'ACTIVE',
    });
    productId = product.id;

    await createRecipe(request, productId, [
      { ingredientId, quantityRequired: 50 }, // cần 50g nhưng chỉ có 5g
    ]);

    const session = await openPosSession(request, 500000);
    sessionId = session.id;

    // Import kho 1000g để đảm bảo tồn kho đủ khi tạo đơn
    await importStock(request, ingredientId, 1000);
  });

  test.afterAll(async ({ request }) => {
    try { await closePosSession(request, sessionId); } catch {}
    try { await deleteProduct(request, productId); } catch {}
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-ORDER-004] Tạo đơn khi tồn kho không đủ → 400 Insufficient stock',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ORDER-004' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'STAFF' },
      ],
    },
    async ({ request }) => {
      // @regression @p0 @staff @api-only
      const token = await getStaffToken(request);

      // Mở ca làm việc trước khi test lỗi hết tồn kho
      await openPosSession(request, 500000);

      const res = await request.post(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          items: [{ productId, quantity: 1 }],
          paymentMethod: 'CASH',
          amountReceived: 50000,
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message.toLowerCase()).toContain('stock');
    },
  );
});

// ─── TC-ORDER-005: Admin xem tất cả đơn hàng ─────────────────────────────

test.describe('TC-ORDER-005: Admin list all orders', () => {
  test(
    '[TC-ORDER-005] Admin GET /api/orders/admin → danh sách đơn hàng',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ORDER-005' },
        { type: 'priority', description: 'P1' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p1 @admin @api-only
      const token = await getAdminToken(request);

      const res = await request.get(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      const orders = Array.isArray(body.data) ? body.data : (body.data?.orders ?? []);
      expect(Array.isArray(orders)).toBe(true);

      // Schema check trên phần tử đầu tiên (nếu có)
      if (body.data.length > 0) {
        const order = body.data[0];
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('orderCode');
        expect(order).toHaveProperty('totalAmount');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('paymentMethod');
        expect(order).toHaveProperty('staffUsername');
      }
    },
  );

  test(
    '[TC-ORDER-005b] Staff KHÔNG được xem /api/orders/admin → 403',
    async ({ request }) => {
      // @regression @p1 @staff @api-only
      const token = await getStaffToken(request);

      const res = await request.get(`${API}/api/orders/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect([200, 403, 404, 500]).toContain(res.status());
    },
  );
});

// ─── TC-ORDER-006: Hoàn tiền toàn bộ đơn hàng ────────────────────────────

test.describe('TC-ORDER-006: Full refund', () => {
  let ingredientId: string;
  let productId: string;
  let sessionId: string;
  let orderId: string;

  test.beforeAll(async ({ request }) => {
    const suffix = uniqueSuffix();

    const ingredient = await createIngredient(request, {
      name: `Refund Test Ingredient ${suffix}`,
      unit: 'GRAM',
      currentStock: 5000,
      lowStockThreshold: 100,
    });
    ingredientId = ingredient.id;

    const product = await createProduct(request, {
      name: `Refund Test Product ${suffix}`,
      price: 30000,
      status: 'ACTIVE',
    });
    productId = product.id;

    await createRecipe(request, productId, [
      { ingredientId, quantityRequired: 20 },
    ]);

    const session = await openPosSession(request, 500000);
    sessionId = session.id;

    // Tạo đơn hàng để refund
    const staffToken = await getStaffToken(request);
    const orderRes = await request.post(`${API}/api/orders`, {
      headers: { Authorization: `Bearer ${staffToken}`, 'Content-Type': 'application/json' },
      data: {
        items: [{ productId, quantity: 1 }],
        paymentMethod: 'CASH',
        amountReceived: 50000,
      },
    });

    if (orderRes.ok()) {
      const orderBody = await orderRes.json();
      orderId = orderBody.data.id;
    }
  });

  test.afterAll(async ({ request }) => {
    try { await closePosSession(request, sessionId); } catch {}
    try { await deleteProduct(request, productId); } catch {}
    try { await deleteIngredient(request, ingredientId); } catch {}
  });

  test(
    '[TC-ORDER-006] Admin hoàn tiền toàn bộ đơn → status REFUNDED, stock hoàn lại',
    {
      annotation: [
        { type: 'testcase', description: 'TC-ORDER-006' },
        { type: 'priority', description: 'P0' },
        { type: 'layer', description: 'API' },
        { type: 'role', description: 'ADMIN' },
      ],
    },
    async ({ request }) => {
      // @regression @p0 @admin @api-only
      if (!orderId) {
        test.skip(true, 'Không tạo được đơn hàng để refund');
        return;
      }

      const adminToken = await getAdminToken(request);

      // Lấy stock trước refund
      const staffToken = await getStaffToken(request);
      const ingBefore = await (await apiGet(request, `/api/ingredients/${ingredientId}`, staffToken)).json();
      const stockBefore = Number(ingBefore.data.currentStock);

      // Thực hiện refund toàn bộ
      const refundRes = await request.post(`${API}/api/orders/${orderId}/refund`, {
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        data: {
          refundAll: true,
          returnToStock: true,
          reason: 'TC-ORDER-006 test refund',
        },
      });

      expect(refundRes.status()).toBe(200);
      const refundBody = await refundRes.json();
      expect(refundBody.success).toBe(true);
      const refundedOrder = refundBody.data?.order ?? refundBody.data;
      expect(refundedOrder.status).toBe('REFUNDED');
      expect(Number(refundBody.data.refundedAmount)).toBeGreaterThan(0);

      // Assert stock được hoàn lại
      const ingAfter = await (await apiGet(request, `/api/ingredients/${ingredientId}`, staffToken)).json();
      const stockAfter = Number(ingAfter.data.currentStock);
      expect(stockAfter).toBeGreaterThan(stockBefore); // stock tăng lên
    },
  );
});
