/**
 * API Client Helper
 * Cung cấp helper functions để gọi API trong test (setup/teardown dữ liệu)
 */
import { APIRequestContext, expect } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';

export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'STAFF';
    status: string;
  };
}

/**
 * Đăng nhập và lấy JWT token
 */
export async function apiLogin(
  request: APIRequestContext,
  username: string,
  password: string,
): Promise<LoginResult> {
  const res = await request.post(`${API_BASE}/api/auth/login`, {
    data: { username, password },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return { token: body.data.token, user: body.data.user };
}

/**
 * Lấy ADMIN token
 */
export async function getAdminToken(request: APIRequestContext): Promise<string> {
  const { token } = await apiLogin(
    request,
    process.env.ADMIN_USERNAME ?? 'admin',
    process.env.ADMIN_PASSWORD ?? 'Admin123@',
  );
  return token;
}

/**
 * Lấy STAFF token
 */
export async function getStaffToken(request: APIRequestContext): Promise<string> {
  const { token } = await apiLogin(
    request,
    process.env.STAFF_USERNAME ?? 'staff',
    process.env.STAFF_PASSWORD ?? 'Staff123@',
  );
  return token;
}

/**
 * Tạo authorized request headers
 */
export function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Tạo unique string (tránh xung đột giữa các test)
 */
export function uniqueSuffix(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Gọi GET endpoint có auth
 */
export async function apiGet(
  request: APIRequestContext,
  path: string,
  token: string,
) {
  return request.get(`${API_BASE}${path}`, {
    headers: authHeaders(token),
  });
}

/**
 * Gọi POST endpoint có auth
 */
export async function apiPost(
  request: APIRequestContext,
  path: string,
  token: string,
  data: unknown,
) {
  return request.post(`${API_BASE}${path}`, {
    headers: authHeaders(token),
    data,
  });
}

/**
 * Gọi PATCH endpoint có auth
 */
export async function apiPatch(
  request: APIRequestContext,
  path: string,
  token: string,
  data: unknown,
) {
  return request.patch(`${API_BASE}${path}`, {
    headers: authHeaders(token),
    data,
  });
}

/**
 * Gọi DELETE endpoint có auth
 */
export async function apiDelete(
  request: APIRequestContext,
  path: string,
  token: string,
) {
  return request.delete(`${API_BASE}${path}`, {
    headers: authHeaders(token),
  });
}
