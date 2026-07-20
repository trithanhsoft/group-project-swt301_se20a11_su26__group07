/**
 * Data Factories
 * Tạo và cleanup test data qua API
 * Đảm bảo mỗi test chạy độc lập và idempotent
 *
 * NOTE: Các response schema đã được verify từ backend source:
 * - createIngredient: { data: { ingredient: {...} } }
 * - createProduct:    { data: { product: {...} } } hoặc { data: {...} }
 * - createRecipe:     { data: {...} }
 * - openPosSession:   { data: {...} }
 * - createUser:       { data: { user: {...} } } hoặc { data: {...} }
 */
import { APIRequestContext } from '@playwright/test';
import { apiPost, apiPatch, apiDelete, getAdminToken, getStaffToken, uniqueSuffix } from './apiClient.js';

const API_BASE = process.env.API_BASE_URL ?? 'http://127.0.0.1:5000';

// ─── Ingredient Factory ────────────────────────────────────────────────────────

export interface IngredientPayload {
  name: string;
  unit: 'GRAM' | 'ML' | 'PIECE' | 'LITER' | 'KG' | 'OTHER';
  currentStock: number;
  lowStockThreshold: number;
  tag?: string;
}

export interface Ingredient extends IngredientPayload {
  id: string;
}

export async function createIngredient(
  request: APIRequestContext,
  overrides: Partial<IngredientPayload> = {},
): Promise<Ingredient> {
  const token = await getAdminToken(request);
  const suffix = uniqueSuffix();
  const payload: IngredientPayload = {
    name: `Test Ingredient ${suffix}`,
    unit: 'GRAM',
    currentStock: 1000,
    lowStockThreshold: 100,
    ...overrides,
  };
  const res = await apiPost(request, '/api/ingredients', token, payload);
  if (!res.ok()) {
    throw new Error(`createIngredient failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  // API trả { data: { ingredient: {...} } }
  return body.data?.ingredient ?? body.data;
}

export async function deleteIngredient(request: APIRequestContext, id: string): Promise<void> {
  const token = await getAdminToken(request);
  await apiDelete(request, `/api/ingredients/${id}`, token);
}

// ─── Product Factory ───────────────────────────────────────────────────────────

export interface ProductPayload {
  name: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  tag?: string;
}

export interface Product extends ProductPayload {
  id: string;
}

export async function createProduct(
  request: APIRequestContext,
  overrides: Partial<ProductPayload> = {},
): Promise<Product> {
  const token = await getAdminToken(request);
  const suffix = uniqueSuffix();
  const payload: ProductPayload = {
    name: `Test Product ${suffix}`,
    price: 30000,
    status: 'ACTIVE',
    ...overrides,
  };
  const res = await apiPost(request, '/api/products', token, payload);
  if (!res.ok()) {
    throw new Error(`createProduct failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  // API trả { data: { product: {...} } } hoặc { data: {...} }
  return body.data?.product ?? body.data;
}

export async function deleteProduct(request: APIRequestContext, id: string): Promise<void> {
  const token = await getAdminToken(request);
  await apiDelete(request, `/api/products/${id}`, token);
}

// ─── Recipe Factory ────────────────────────────────────────────────────────────

export interface RecipeItem {
  ingredientId: string;
  quantity?: number;
  quantityRequired?: number;
}

export async function createRecipe(
  request: APIRequestContext,
  productId: string,
  items: RecipeItem[],
): Promise<{ id: string }> {
  const token = await getAdminToken(request);
  const normalizedItems = items.map((item) => ({
    ingredientId: item.ingredientId,
    quantity: item.quantity ?? item.quantityRequired ?? 1,
  }));
  const res = await apiPost(request, '/api/recipes', token, { productId, items: normalizedItems });
  if (!res.ok()) {
    throw new Error(`createRecipe failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return body.data?.recipe ?? body.data;
}

// ─── POS Session Factory ───────────────────────────────────────────────────────

export interface PosSession {
  id: string;
  staffId: string;
  status: 'OPEN' | 'CLOSED';
  startingCash: number;
}

export async function openPosSession(
  request: APIRequestContext,
  startingCash = 500000,
  notes = 'Test session',
): Promise<PosSession> {
  const token = await getStaffToken(request);
  const { apiPost: post, apiGet: get } = await import('./apiClient.js');
  const res = await post(
    request,
    '/api/pos-sessions/open',
    token,
    { startingCash, notes },
  );
  if (!res.ok()) {
    // Nếu đã có ca đang mở, lấy thông tin ca active đó
    const activeRes = await get(request, '/api/pos-sessions/active', token);
    if (activeRes.ok()) {
      const activeBody = await activeRes.json();
      if (activeBody.data) {
        return activeBody.data?.session ?? activeBody.data;
      }
    }
    throw new Error(`openPosSession failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return body.data?.session ?? body.data;
}

export async function closePosSession(
  request: APIRequestContext,
  sessionId?: string,
  endingCashActual = 500000,
): Promise<void> {
  const token = await getStaffToken(request);
  const { apiPost: post } = await import('./apiClient.js');
  await post(
    request,
    '/api/pos-sessions/close',
    token,
    { endingCashActual, notes: 'Test session closed' },
  );
}

// ─── Order Factory ─────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderCode: string;
  totalAmount: number;
  status: string;
}

export async function createOrder(
  request: APIRequestContext,
  items: OrderItem[],
  paymentMethod: 'CASH' | 'QR' = 'CASH',
  amountReceived?: number,
): Promise<Order> {
  const token = await getStaffToken(request);

  // Tính tổng tiền tối thiểu để vượt validation
  const totalFallback = 999999;
  const { apiPost: post } = await import('./apiClient.js');
  const res = await post(
    request,
    '/api/orders',
    token,
    {
      items,
      paymentMethod,
      amountReceived: amountReceived ?? totalFallback,
      note: 'Auto test order',
    },
  );
  if (!res.ok()) {
    throw new Error(`createOrder failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return body.data?.order ?? body.data;
}

// ─── Stock Import Factory ──────────────────────────────────────────────────────

export async function importStock(
  request: APIRequestContext,
  ingredientId: string,
  quantity: number,
  note = 'Test import',
): Promise<void> {
  const token = await getAdminToken(request);
  const res = await apiPost(request, '/api/stock/import', token, {
    ingredientId,
    quantity,
    note,
  });
  if (!res.ok()) {
    throw new Error(`importStock failed: ${res.status()} ${await res.text()}`);
  }
}

// ─── User Factory ──────────────────────────────────────────────────────────────

export interface UserPayload {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: 'ADMIN' | 'STAFF';
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
}

export async function createUser(
  request: APIRequestContext,
  overrides: Partial<UserPayload> = {},
): Promise<User> {
  const token = await getAdminToken(request);
  const suffix = uniqueSuffix();
  const payload: UserPayload = {
    username: `testuser_${suffix}`,
    email: `testuser_${suffix}@test.local`,
    fullName: `Test User ${suffix}`,
    password: `TestPass123@`,
    role: 'STAFF',
    ...overrides,
  };
  const res = await apiPost(request, '/api/users', token, payload);
  if (!res.ok()) {
    throw new Error(`createUser failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  // API trả { data: { user: {...} } } hoặc { data: {...} }
  return body.data?.user ?? body.data;
}

export async function deactivateUser(request: APIRequestContext, userId: string): Promise<void> {
  const token = await getAdminToken(request);
  await apiPatch(request, `/api/users/${userId}`, token, { status: 'INACTIVE' });
}
