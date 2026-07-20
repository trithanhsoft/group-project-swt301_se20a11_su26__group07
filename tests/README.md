# 🤖 Mini Coffee POS — Automation Test Framework

> Playwright TypeScript E2E + API Integration Tests  
> SWT301 Group 07 — SE20A11 — SU26

---

## 📁 Cấu trúc thư mục

```
tests/
├── playwright.config.ts          ← Cấu hình Playwright (projects, reporters, timeout)
├── package.json                  ← Dependencies
├── .env.test.example             ← Template biến môi trường
├── .env.test                     ← (gitignore) Biến môi trường thật
│
├── fixtures/
│   └── auth/
│       ├── auth.setup.ts         ← Lưu storageState Admin
│       ├── staff.setup.ts        ← Lưu storageState Staff
│       ├── admin.json            ← (gitignore) Auth state Admin
│       └── staff.json            ← (gitignore) Auth state Staff
│
├── pages/                        ← Page Objects (không chứa assertion nghiệp vụ)
│   ├── LoginPage.ts
│   └── PosPage.ts
│
├── utils/
│   ├── apiClient.ts              ← API helper (login, get/post/patch/delete)
│   └── factories.ts              ← Data factories (create/cleanup entities)
│
└── specs/                        ← Test specs theo module
    ├── auth/
    │   └── auth.spec.ts          ← TC-AUTH-001 → TC-AUTH-010
    ├── orders/
    │   └── orders.spec.ts        ← TC-ORDER-001 → TC-ORDER-006
    ├── stock/
    │   └── stock.spec.ts         ← TC-STOCK-001 → TC-STOCK-006
    ├── hr/
    │   └── hr.spec.ts            ← TC-HR-001 → TC-HR-007
    └── reports/
        └── reports.spec.ts       ← TC-RPT-001 → TC-RPT-005
```

---

## ⚡ Cài đặt

```bash
# 1. Vào thư mục tests
cd tests

# 2. Cài npm dependencies
npm install

# 3. Cài Playwright browsers
npx playwright install --with-deps chromium firefox

# 4. Tạo file .env.test từ example
cp .env.test.example .env.test
# Điền các giá trị cần thiết
```

---

## 🔧 Cấu hình (.env.test)

```env
WEB_BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000

ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123@
STAFF_USERNAME=staff
STAFF_PASSWORD=Staff123@

TZ=Asia/Ho_Chi_Minh
```

> ⚠️ **Không commit** `.env.test` hay `fixtures/auth/*.json` lên git.

---

## 🚀 Chạy tests

### Yêu cầu trước khi chạy

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Terminal 3: Seed dữ liệu (nếu chưa có)
cd backend && npm run seed
```

### Các lệnh chạy test

```bash
# Chạy tất cả tests
npm test

# Chạy smoke tests (nhanh, critical path)
npm run test:smoke

# Chạy regression tests (đầy đủ)
npm run test:regression

# Chạy theo module
npm run test:auth
npm run test:orders
npm run test:stock
npm run test:hr
npm run test:reports

# Chạy theo role
npm run test:admin
npm run test:staff

# Chỉ chạy API tests
npm run test:api

# Chạy headless với HTML report
npm run test:headless

# Debug mode (mở browser UI)
npm run test:debug

# Interactive UI mode (Playwright UI)
npm run test:ui-mode
```

### Chạy theo tag

```bash
# Smoke tests
npx playwright test --grep @smoke

# Priority 0 (critical)
npx playwright test --grep @p0

# Admin tests
npx playwright test --grep @admin

# API-only tests (không cần browser)
npx playwright test --grep @api-only

# Kết hợp tags
npx playwright test --grep "@smoke|@p0"
```

### Xem report

```bash
npm run report
# Mở http://localhost:9323 tự động
```

---

## 🔬 Projects & Tags

| Project | Mô tả | StorageState |
|---------|-------|--------------|
| `chromium:admin` | Desktop Chrome với ADMIN | `fixtures/auth/admin.json` |
| `chromium:staff` | Desktop Chrome với STAFF | `fixtures/auth/staff.json` |
| `chromium:public` | Desktop Chrome không login | None |
| `mobile:admin` | Mobile 375×812 với ADMIN | `fixtures/auth/admin.json` |
| `firefox:smoke` | Firefox chạy @smoke | `fixtures/auth/admin.json` |
| `api` | API-only tests | None |

| Tag | Mô tả |
|-----|-------|
| `@smoke` | Critical path — chạy nhanh |
| `@regression` | Full test suite |
| `@p0` | Priority 0 — must pass |
| `@p1` | Priority 1 — high |
| `@p2` | Priority 2 — medium |
| `@admin` | Admin role tests |
| `@staff` | Staff role tests |
| `@public` | Unauthenticated tests |
| `@ui` | UI tests cần browser |
| `@api-only` | API tests không cần browser |
| `@mobile` | Mobile viewport tests |

---

## 🗂️ Mapping TestCase → File → Tags

| TestCase | File | Test Title | Tags |
|----------|------|------------|------|
| TC-AUTH-001 | `specs/auth/auth.spec.ts` | Admin login credentials hợp lệ | `@smoke @p0 @admin @ui` |
| TC-AUTH-002 | `specs/auth/auth.spec.ts` | Staff login redirect /staff/pos | `@smoke @p0 @staff @ui` |
| TC-AUTH-003 | `specs/auth/auth.spec.ts` | Login mật khẩu sai → 401 | `@regression @p0 @public @ui` |
| TC-AUTH-004 | `specs/auth/auth.spec.ts` | Login username rỗng → validation | `@regression @p1 @public @ui` |
| TC-AUTH-005 | `specs/auth/auth.spec.ts` | Login account INACTIVE → 403 | `@regression @p1 @public @api-only` |
| TC-AUTH-006 | `specs/auth/auth.spec.ts` | Protected route redirect | `@smoke @p0 @public @ui` |
| TC-AUTH-007 | `specs/auth/auth.spec.ts` | Staff không vào /admin/* | `@smoke @p0 @staff @ui` |
| TC-AUTH-008 | `specs/auth/auth.spec.ts` | API login thiếu field → 400 | `@regression @p1 @public @api-only` |
| TC-AUTH-009 | `specs/auth/auth.spec.ts` | Logout → redirect /login | `@regression @p1 @admin @ui` |
| TC-AUTH-010 | `specs/auth/auth.spec.ts` | Expired JWT → 401 | `@regression @p1 @public @api-only` |
| TC-ORDER-001 | `specs/orders/orders.spec.ts` | Tạo đơn CASH → SUCCESS + kho trừ | `@smoke @p0 @staff @api-only` |
| TC-ORDER-002 | `specs/orders/orders.spec.ts` | Tạo đơn không có ca → 400 | `@regression @p1 @staff @api-only` |
| TC-ORDER-003 | `specs/orders/orders.spec.ts` | Đơn giỏ rỗng → 400 | `@regression @p1 @staff @api-only` |
| TC-ORDER-004 | `specs/orders/orders.spec.ts` | Tồn kho không đủ → 400 | `@regression @p0 @staff @api-only` |
| TC-ORDER-005 | `specs/orders/orders.spec.ts` | Admin list all orders | `@regression @p1 @admin @api-only` |
| TC-ORDER-006 | `specs/orders/orders.spec.ts` | Full refund → REFUNDED + stock hoàn | `@regression @p0 @admin @api-only` |
| TC-STOCK-001 | `specs/stock/stock.spec.ts` | Import stock 200g → stock tăng | `@regression @p0 @admin @api-only` |
| TC-STOCK-002 | `specs/stock/stock.spec.ts` | Batch import 2 nguyên liệu | `@regression @p1 @admin @api-only` |
| TC-STOCK-003 | `specs/stock/stock.spec.ts` | Adjust stock → stock = target | `@regression @p1 @admin @api-only` |
| TC-STOCK-004 | `specs/stock/stock.spec.ts` | Discard stock → note [HỦY HÀNG] | `@regression @p1 @admin @api-only` |
| TC-STOCK-005 | `specs/stock/stock.spec.ts` | Import số âm → 400 | `@regression @p1 @admin @api-only` |
| TC-STOCK-006 | `specs/stock/stock.spec.ts` | Stock forecast → 200 | `@regression @p2 @admin @api-only` |
| TC-HR-001 | `specs/hr/hr.spec.ts` | Tạo ca mẫu → 201 | `@regression @p1 @admin @api-only` |
| TC-HR-002 | `specs/hr/hr.spec.ts` | List ca mẫu → 200 | `@regression @p1 @admin @api-only` |
| TC-HR-003 | `specs/hr/hr.spec.ts` | Phân ca cho staff → 201 | `@regression @p1 @admin @api-only` |
| TC-HR-004 | `specs/hr/hr.spec.ts` | Staff đăng ký lịch rảnh → 201 | `@regression @p2 @staff @api-only` |
| TC-HR-005 | `specs/hr/hr.spec.ts` | Staff gửi yêu cầu LEAVE → PENDING | `@regression @p2 @staff @api-only` |
| TC-HR-006 | `specs/hr/hr.spec.ts` | Admin HR cost report | `@regression @p2 @admin @api-only` |
| TC-HR-007 | `specs/hr/hr.spec.ts` | QR token SHA256, Staff 403 | `@regression @p1 @admin @api-only` |
| TC-RPT-001 | `specs/reports/reports.spec.ts` | Revenue report + date filter | `@regression @p1 @admin @api-only` |
| TC-RPT-002 | `specs/reports/reports.spec.ts` | Best-selling products | `@regression @p2 @admin @api-only` |
| TC-RPT-003 | `specs/reports/reports.spec.ts` | Low stock report | `@smoke @p1 @admin @api-only` |
| TC-RPT-004 | `specs/reports/reports.spec.ts` | Dashboard summary | `@smoke @p0 @admin @api-only` |
| TC-RPT-005 | `specs/reports/reports.spec.ts` | Discard report | `@regression @p2 @admin @api-only` |

---

## 🏗️ Data Isolation & Factories

Tất cả test data được tạo qua API trong `beforeAll` và xóa trong `afterAll`:

```typescript
// Ví dụ pattern dùng factory
test.beforeAll(async ({ request }) => {
  ingredient = await createIngredient(request, { name: `Test ${uniqueSuffix()}` });
  product = await createProduct(request, { name: `Prod ${uniqueSuffix()}` });
  await createRecipe(request, product.id, [{ ingredientId: ingredient.id, quantityRequired: 20 }]);
});

test.afterAll(async ({ request }) => {
  await deleteProduct(request, product.id);
  await deleteIngredient(request, ingredient.id);
});
```

**Nguyên tắc:**
- Dùng `uniqueSuffix()` (timestamp + random) để tránh conflict
- Mỗi test độc lập — không phụ thuộc thứ tự
- `try-catch` trong cleanup để không block test khác
- **Tuyệt đối không dùng production DB**

---

## 📌 Assumptions & Known Gaps

| # | Item | Status |
|---|------|--------|
| 1 | `data-testid` chưa có trên phần lớn UI elements | ⚠️ Cần bổ sung vào các component: `product-card`, `cart-item`, `cart-total`, `logout-button`, `session-status` |
| 2 | Role refund: hiện chỉ ADMIN mới refund được (theo code) | ✅ Đã confirm từ source |
| 3 | QR VietQR: không test real bank — chỉ test URL format | ✅ Hợp lý |
| 4 | Email OTP: cần Mailpit/MailHog cho môi trường test | ⚠️ Chưa setup |
| 5 | TC-AUTH-005 cần account INACTIVE sẵn sàng | ⚠️ Cần tạo fixture user |
| 6 | Concurrent order test (race condition) | ⚠️ Chưa implement |
| 7 | Mobile viewport test | ⚠️ Chưa implement — cần `data-testid` ổn định trước |
| 8 | `GET /api/recipes/:id` — chưa verify route tồn tại | ⚠️ Cần kiểm tra |

---

## 🔑 Required data-testid cần bổ sung vào UI

Thêm vào các component React để locator ổn định:

```jsx
// ProductCard
<div data-testid="product-card" data-product-id={product.id}>

// Cart
<div data-testid="cart-item" data-item-id={item.id}>
<div data-testid="cart-total">

// Session
<div data-testid="session-status">

// Navigation
<button data-testid="logout-button">

// Toasts/Alerts
<div data-testid="toast-success">
<div data-testid="toast-error">

// KDS
<div data-testid="kds-card" data-order-id={order.id}>

// Forms
<input data-testid="username-input">
<input data-testid="password-input">
```

---

## 🔁 CI/CD

Xem [`.github/workflows/automation-tests.yml`](../.github/workflows/automation-tests.yml)

**Pipeline:**
1. `backend-unit` → Vitest với PostgreSQL test DB
2. `e2e (1/4 → 4/4)` → Playwright sharded, phụ thuộc backend-unit thành công
3. `merge-reports` → Gộp report từ 4 shards

**GitHub Secrets cần:**
```
JWT_SECRET
TEST_ADMIN_USERNAME
TEST_ADMIN_PASSWORD
TEST_STAFF_USERNAME
TEST_STAFF_PASSWORD
```
