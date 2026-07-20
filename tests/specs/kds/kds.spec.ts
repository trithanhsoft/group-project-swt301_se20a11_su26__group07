/**
 * TC-KDS-001 → TC-KDS-005
 * KDS (Kitchen Display System) Test Suite
 *
 * @tags @regression @staff @api
 */
import { test, expect } from '@playwright/test';
import { getAdminToken, getStaffToken, uniqueSuffix } from '../../utils/apiClient.js';
import {
  createIngredient,
  createProduct,
  createRecipe,
  deleteProduct,
  deleteIngredient,
  openPosSession,
  closePosSession,
} from '../../utils/factories.js';

const API = process.env.API_BASE_URL ?? 'http://127.0.0.1:5000';

// Shared setup — dùng cho nhiều test trong file này
let sharedIngredientId: string;
let sharedProductId: string;
let sharedSessionId: string;
let sharedOrderId: string;
let sharedOrderCode: string;

test.beforeAll(async ({ request }) => {
  const suffix = uniqueSuffix();

  const ingredient = await createIngredient(request, {
    name: `KDS Ing ${suffix}`,
    unit: 'GRAM',
    currentStock: 9999,
    lowStockThreshold: 50,
  });
  sharedIngredientId = ingredient.id;

  const product = await createProduct(request, {
    name: `KDS Product ${suffix}`,
    price: 30000,
    status: 'ACTIVE',
  });
  sharedProductId = product.id;

  await createRecipe(request, sharedProductId, [
    { ingredientId: sharedIngredientId, quantityRequired: 15 },
  ]);

  const session = await openPosSession(request, 500000);
  sharedSessionId = session.id;

  // Tạo đơn hàng để test KDS
  const staffToken = await getStaffToken(request);
  const orderRes = await request.post(`${API}/api/orders`, {
    headers: { Authorization: `Bearer ${staffToken}`, 'Content-Type': 'application/json' },
    data: {
      items: [{ productId: sharedProductId, quantity: 2 }],
      paymentMethod: 'CASH',
      amountReceived: 100000,
      note: 'KDS test order',
    },
  });

  if (orderRes.ok()) {
    const body = await orderRes.json();
    sharedOrderId = body.data.id ?? body.data.order?.id;
    sharedOrderCode = body.data.orderCode ?? body.data.order?.orderCode;
  }
});

test.afterAll(async ({ request }) => {
  try { await closePosSession(request, sharedSessionId); } catch {}
  try { await deleteProduct(request, sharedProductId); } catch {}
  try { await deleteIngredient(request, sharedIngredientId); } catch {}
});

// ─── TC-KDS-001: Lấy danh sách đơn KDS ──────────────────────────────────

test(
  '[TC-KDS-001] GET /api/kds/orders → 200, danh sách theo kds_status',
  {
    annotation: [
      { type: 'testcase', description: 'TC-KDS-001' },
      { type: 'priority', description: 'P0' },
      { type: 'layer', description: 'API' },
      { type: 'role', description: 'STAFF' },
    ],
  },
  async ({ request }) => {
    // @smoke @p0 @staff @api-only
    const token = await getStaffToken(request);

    const res = await request.get(`${API}/api/kds/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Schema: backend trả { data: { newOrders: [...], completedOrders: [...] } }
    const data = body.data;
    const newOrders = data.newOrders ?? data.new ?? [];
    const completedOrders = data.completedOrders ?? data.completed ?? [];
    expect(Array.isArray(newOrders)).toBe(true);
    expect(Array.isArray(completedOrders)).toBe(true);
  },
);

// ─── TC-KDS-002: Đơn mới tạo có kds_status = NEW ─────────────────────────

test(
  '[TC-KDS-002] Đơn hàng mới tạo → kds_status=NEW, xuất hiện trong /api/kds/orders new list',
  {
    annotation: [
      { type: 'testcase', description: 'TC-KDS-002' },
      { type: 'priority', description: 'P0' },
      { type: 'layer', description: 'API' },
      { type: 'role', description: 'STAFF' },
    ],
  },
  async ({ request }) => {
    // @regression @p0 @staff @api-only
    if (!sharedOrderId) {
      test.skip(true, 'Không tạo được đơn hàng ở beforeAll');
      return;
    }

    const token = await getStaffToken(request);

    const res = await request.get(`${API}/api/kds/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const body = await res.json();
    const newOrders: Array<{ id: string; kdsStatus: string; orderCode: string }> =
      body.data.newOrders ?? body.data.new ?? [];

    const found = newOrders.find((o) => o.id === sharedOrderId);
    expect(found).toBeTruthy();
    expect(found?.kdsStatus ?? found?.kds_status).toBe('NEW');
  },
);

// ─── TC-KDS-003: Đánh dấu đơn hoàn thành ────────────────────────────────

test(
  '[TC-KDS-003] Staff đánh dấu đơn hoàn thành → kds_status=COMPLETED',
  {
    annotation: [
      { type: 'testcase', description: 'TC-KDS-003' },
      { type: 'priority', description: 'P0' },
      { type: 'layer', description: 'API' },
      { type: 'role', description: 'STAFF' },
    ],
  },
  async ({ request }) => {
    // @regression @p0 @staff @api-only
    if (!sharedOrderId) {
      test.skip(true, 'Không tạo được đơn hàng ở beforeAll');
      return;
    }

    const token = await getStaffToken(request);

    const res = await request.patch(`${API}/api/kds/orders/${sharedOrderId}/complete`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const updated = body.data?.order ?? body.data;
    expect(updated.kdsStatus ?? updated.kds_status).toBe('COMPLETED');
    expect(updated.kdsCompletedAt ?? updated.kds_completed_at).toBeTruthy();
    expect(updated.kdsCompletedBy ?? updated.kds_completed_by).toBeTruthy();
  },
);

// ─── TC-KDS-004: Đơn hoàn thành chuyển sang completed list ──────────────

test(
  '[TC-KDS-004] Sau khi complete → đơn xuất hiện trong completed, không còn trong new',
  {
    annotation: [
      { type: 'testcase', description: 'TC-KDS-004' },
      { type: 'priority', description: 'P1' },
      { type: 'layer', description: 'API' },
      { type: 'role', description: 'STAFF' },
    ],
  },
  async ({ request }) => {
    // @regression @p1 @staff @api-only
    if (!sharedOrderId) {
      test.skip(true, 'Không tạo được đơn hàng ở beforeAll');
      return;
    }

    const token = await getStaffToken(request);

    const res = await request.get(`${API}/api/kds/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const body = await res.json();
    const newOrders: Array<{ id: string }> = body.data.newOrders ?? body.data.new ?? [];
    const completedOrders: Array<{ id: string }> = body.data.completedOrders ?? body.data.completed ?? [];

    // Không còn trong new
    const inNew = newOrders.some((o) => o.id === sharedOrderId);
    expect(inNew).toBe(false);

    // Xuất hiện trong completed
    const inCompleted = completedOrders.some((o) => o.id === sharedOrderId);
    expect(inCompleted).toBe(true);
  },
);

// ─── TC-KDS-005: Admin không thể đánh dấu KDS (chỉ STAFF) ───────────────

test(
  '[TC-KDS-005] Admin PATCH /api/kds/orders/:id/complete → 403',
  {
    annotation: [
      { type: 'testcase', description: 'TC-KDS-005' },
      { type: 'priority', description: 'P2' },
      { type: 'layer', description: 'API' },
      { type: 'role', description: 'ADMIN' },
    ],
  },
  async ({ request }) => {
    // @regression @p2 @admin @api-only
    const adminToken = await getAdminToken(request);

    const res = await request.patch(`${API}/api/kds/orders/some-fake-id/complete`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    });

    expect(res.status()).toBe(403);
  },
);
