# Mini Coffee POS & Inventory System
## Project Overview

> **Course:** SWT301 — Software Testing  
> **Group:** 07 — SE20A11 — SU26  
> **Version:** 1.0.0

---

## 1. Giới thiệu dự án

**Mini Coffee POS** là hệ thống quản lý bán hàng (Point of Sale) và kiểm soát kho nguyên liệu dành cho quán cà phê quy mô nhỏ. Hệ thống bao gồm đầy đủ nghiệp vụ: bán hàng tại quầy, quản lý kho, công thức pha chế, báo cáo doanh thu và quản lý nhân sự.

Hệ thống phục vụ **2 vai trò**:
- **Admin** — Quản trị viên: toàn quyền quản lý
- **Staff** — Nhân viên: bán hàng, kho, chấm công

---

## 2. Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend** | React 19, Vite 8, React Router DOM v7, Lucide React, XLSX |
| **Backend** | Node.js (ESM), Express 4, JWT, bcryptjs, Nodemailer |
| **Database** | PostgreSQL (Supabase), kết nối qua `pg` Pool |
| **Auth** | JWT Bearer Token (7 ngày), bcrypt (cost=10) |
| **Thanh toán** | Tiền mặt (CASH) & VietQR (MB Bank) |
| **Email** | Nodemailer — gửi OTP reset mật khẩu |
| **Testing** | Vitest (backend unit tests) |

---

## 3. Kiến trúc hệ thống

```
SWT_Project/
├── backend/                  ← REST API Server (Node.js + Express)
│   └── src/
│       ├── config/           ← Cấu hình DB, env, mail
│       ├── constants/        ← Enums dùng chung (roles, KDS status, v.v.)
│       ├── middlewares/      ← Auth, Role guard, Error handler
│       ├── modules/          ← 13 modules nghiệp vụ (MVC)
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── ingredients/
│       │   ├── kds/
│       │   ├── orders/
│       │   ├── pos_sessions/
│       │   ├── products/
│       │   ├── recipes/
│       │   ├── reports/
│       │   ├── stock/
│       │   ├── users/
│       │   ├── hr/
│       │   └── attendance/
│       ├── seed/             ← Script khởi tạo dữ liệu mẫu
│       └── utils/            ← Helper functions
│
├── frontend/                 ← React SPA (Vite)
│   └── src/
│       ├── app/              ← Root app, providers, routing
│       ├── features/         ← 13 feature modules (tương ứng backend)
│       ├── components/       ← UI components dùng chung
│       ├── services/         ← API client (fetch wrapper)
│       ├── constants/        ← Routes, roles
│       └── styles/           ← Global CSS
│
└── documents/                ← Tài liệu dự án, test plan
```

### Pattern Backend

Mỗi module backend theo cấu trúc **Routes → Controller → Service**:

```
[feature].routes.js      → Khai báo endpoint + middleware bảo vệ
[feature].controller.js  → Nhận request, gọi service, trả response
[feature].service.js     → Business logic + raw SQL queries (không dùng ORM)
```

### Pattern Frontend

```
features/[feature]/
├── api/    → Gọi API endpoint tương ứng
└── pages/  → React page components
```

---

## 4. Phân quyền & Routing

| Role | Đường dẫn | Redirect mặc định |
|------|-----------|-------------------|
| `ADMIN` | `/admin/*` | `/admin/dashboard` |
| `STAFF` | `/staff/*` | `/staff/pos` |
| Cả hai | `/profile` | — |

```
/login           → Public
/admin/*         → Protected (ADMIN only)
/staff/*         → Protected (STAFF only)
/profile         → Protected (any authenticated user)
```

---

## 5. Tính năng chi tiết

### 5.1 🔐 Authentication

| Tính năng | Mô tả |
|-----------|-------|
| Đăng nhập | Username + Password → JWT Token |
| Cập nhật hồ sơ | Đổi tên, email |
| Đổi mật khẩu | Yêu cầu mật khẩu cũ; 6–63 ký tự |
| Quên mật khẩu | OTP 6 số gửi qua email, hết hạn 15 phút |
| Reset mật khẩu | Xác thực OTP → đặt mật khẩu mới |

---

### 5.2 🛍️ POS — Bán hàng (Staff)

**Quy trình tạo đơn (Transaction-Safe):**
```
1. Staff chọn sản phẩm → giỏ hàng
2. Validate: sản phẩm ACTIVE, có công thức (recipe)
3. Chọn thanh toán: CASH / QR (VietQR)
4. BEGIN TRANSACTION
   ├── Kiểm tra ca bán hàng đang OPEN
   ├── Tạo order code (OD + timestamp + random)
   ├── INSERT orders, order_items
   ├── Lock nguyên liệu → kiểm tra tồn kho → trừ kho
   └── INSERT stock_transactions (type=ORDER_DEDUCT)
5. COMMIT
```

**POS Session (Ca bán hàng):**

| Giai đoạn | Mô tả |
|-----------|-------|
| Mở ca | Khai báo tiền mặt đầu ca |
| Giữa ca | Đếm tiền kiểm tra chênh lệch |
| Kết ca | Nhập tiền thực tế → tính doanh thu, chênh lệch |
| Cảnh báo | Mở ca > 12 tiếng → cảnh báo kết ca |

---

### 5.3 🔄 Hoàn tiền / Refund (Admin)

| Loại | Mô tả |
|------|-------|
| Hoàn toàn bộ | `refundAll=true` |
| Hoàn từng phần | Chỉ định sản phẩm + số lượng hoàn |
| Trả hàng về kho | Tùy chọn `returnToStock=true` → cộng lại tồn kho |

Trạng thái đơn sau hoàn: `PARTIALLY_REFUNDED` hoặc `REFUNDED`

---

### 5.4 🍳 KDS — Kitchen Display System (Staff)

Màn hình bếp hiển thị đơn cần pha chế theo thời gian thực:
- **Đơn mới** (`kds_status=NEW`): theo thứ tự tạo (cũ → mới)
- **Đơn hoàn thành** (`kds_status=COMPLETED`): 20 đơn gần nhất

---

### 5.5 🥤 Sản phẩm + Công thức (Admin)

- Quản lý sản phẩm: thêm/sửa/xóa mềm, phân tag, trạng thái ACTIVE/INACTIVE
- Mỗi sản phẩm có **1 công thức** gồm nhiều nguyên liệu
- Sản phẩm không có công thức → **không thể bán**

```
products (1) → recipes (1) → recipe_items (many) → ingredients
```

---

### 5.6 🧂 Nguyên liệu (Admin + Staff)

- Quản lý: tên, đơn vị (`GRAM`, `ML`, `PIECE`, `LITER`, `KG`, `OTHER`), phân tag
- Ngưỡng cảnh báo tồn kho thấp (`low_stock_threshold`)

---

### 5.7 📦 Quản lý Kho (Admin + Staff)

| Loại giao dịch | Mô tả | Người thực hiện |
|----------------|-------|-----------------|
| `IMPORT` | Nhập kho (đơn lẻ / hàng loạt) | Admin, Staff |
| `ADJUST` | Điều chỉnh thủ công | Admin, Staff |
| `ORDER_DEDUCT` | Trừ kho tự động khi bán | Hệ thống |
| `ORDER_REFUND` | Hoàn kho khi refund | Hệ thống |
| `DISCARD` | Hủy hàng / báo hỏng | Admin, Staff |

- **Kiểm kho hàng ngày:** Nhập số lượng thực đếm → tự động ADJUST nếu lệch
- **Dự báo kho:** Tính tốc độ tiêu thụ → dự báo ngày cần nhập thêm

---

### 5.8 📊 Báo cáo (Admin)

| Báo cáo | Nguồn dữ liệu |
|---------|---------------|
| Doanh thu hàng ngày | View `v_daily_revenue` |
| Sản phẩm bán chạy | View `v_best_selling_products` |
| Tồn kho thấp | View `v_low_stock_ingredients` |
| Lịch sử hủy hàng | Bảng `stock_transactions` |

> Hỗ trợ xuất file Excel (thư viện `xlsx`)

---

### 5.9 📊 Dashboard (Admin)

Tổng hợp nhanh: doanh thu, số đơn, cảnh báo kho thấp, sản phẩm bán chạy.

---

### 5.10 👥 Nhân sự — HR (Admin + Staff)

**Ca làm việc mẫu (Shifts):**

| Ca | Giờ | Lương/giờ |
|----|-----|-----------|
| Ca Sáng | 06:00 – 12:00 | 25,000 VND |
| Ca Chiều | 12:00 – 18:00 | 25,000 VND |
| Ca Tối | 18:00 – 23:00 | 30,000 VND |

**Phân ca (Staff Shifts):** Kiểm tra xung đột lịch, hỗ trợ giờ tùy chỉnh, tự tính lương.

**Yêu cầu (Staff Requests):**

| Loại | Khi duyệt |
|------|-----------|
| `LEAVE` | Ca đó → `ABSENT`, lương = 0 |
| `SWAP` | Hoán đổi nhân viên giữa 2 ca |

---

### 5.11 📅 Chấm công QR (Admin + Staff)

- Token QR = `SHA256(salt + "YYYY-MM-DD")` — thay đổi mỗi ngày
- Staff scan QR → check-in → ghi giờ vào, tính đi trễ
- Check-out → tính giờ thực, cập nhật lương, đánh dấu `COMPLETED`

---

### 5.12 👤 Quản lý người dùng (Admin)

- Tạo, cập nhật, xem danh sách, reset mật khẩu, soft delete
- Trạng thái: `ACTIVE` / `INACTIVE`

---

## 6. Database Schema

> **DBMS:** PostgreSQL | **Host:** Supabase | **Pool:** max 10 connections, SSL enabled

### Danh sách bảng

| Bảng | Mô tả |
|------|-------|
| `app_users` | Người dùng hệ thống |
| `products` | Sản phẩm bán |
| `ingredients` | Nguyên liệu pha chế |
| `recipes` | Công thức (1-1 với product) |
| `recipe_items` | Chi tiết nguyên liệu trong công thức |
| `orders` | Đơn hàng |
| `order_items` | Chi tiết sản phẩm trong đơn |
| `stock_transactions` | Lịch sử mọi giao dịch kho |
| `pos_sessions` | Ca bán hàng POS |
| `shifts` | Ca làm việc mẫu |
| `staff_shifts` | Phân ca + chấm công |
| `staff_availability` | Lịch rảnh nhân viên |
| `staff_requests` | Yêu cầu nghỉ/đổi ca |

### SQL Views

| View | Mô tả |
|------|-------|
| `v_daily_revenue` | Doanh thu tổng hợp theo ngày |
| `v_best_selling_products` | Sản phẩm bán chạy nhất |
| `v_low_stock_ingredients` | Nguyên liệu dưới ngưỡng cảnh báo |

### Quy ước chung

| Quy ước | Chi tiết |
|---------|----------|
| Primary Key | UUID cho tất cả bảng |
| Soft Delete | Cột `deleted_at` — truy vấn luôn thêm `WHERE deleted_at IS NULL` |
| Snapshot | Lưu giá trị tại thời điểm giao dịch (tên, giá, lương/giờ) |
| Audit | `created_at`, `updated_at`, `created_by` trên hầu hết bảng |
| Race Condition | `SELECT FOR UPDATE` khi trừ/hoàn kho trong transaction |

---

## 7. API Endpoints

| Module | Base Path | Quyền |
|--------|-----------|-------|
| Auth | `/api/auth` | Public / Authenticated |
| Dashboard | `/api/dashboard` | Authenticated |
| Users | `/api/users` | ADMIN only |
| Products | `/api/products` | ADMIN (write), All (read) |
| Ingredients | `/api/ingredients` | ADMIN (write), All (read) |
| Recipes | `/api/recipes` | ADMIN |
| Stock | `/api/stock` | ADMIN + STAFF |
| Orders | `/api/orders` | ADMIN + STAFF |
| KDS | `/api/kds` | STAFF |
| Reports | `/api/reports` | ADMIN |
| HR | `/api/hr` | ADMIN + STAFF |
| Attendance | `/api/attendance` | ADMIN + STAFF |
| POS Sessions | `/api/pos-sessions` | STAFF (open/close), ADMIN (history) |

---

## 8. Bảo mật

| Cơ chế | Mô tả |
|--------|-------|
| JWT | Bearer token, ký `JWT_SECRET`, hết hạn 7 ngày |
| bcrypt | Hash mật khẩu, cost = 10 |
| Role Guard | Middleware kiểm tra quyền trước mỗi route |
| Parameterized Query | Chống SQL Injection (`$1, $2, ...`) |
| CORS | Chỉ cho phép origin từ `CLIENT_URL` |
| Input Validation | Normalize & validate toàn bộ input trước DB |
| FOR UPDATE | Lock row khi trừ kho tránh race condition |

---

## 9. Tài khoản Demo

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin123@` |
| Staff | `staff` | `Staff123@` |

---

## 10. Hướng dẫn chạy dự án

```bash
# Backend
cd backend
cp .env.example .env        # Điền DATABASE_URL, JWT_SECRET
npm install
npm run seed                # Khởi tạo dữ liệu mẫu (lần đầu)
npm run dev                 # Dev server → http://localhost:5000

# Frontend
cd frontend
cp .env.example .env        # Điền VITE_API_BASE_URL=http://localhost:5000
npm install
npm run dev                 # Dev server → http://localhost:5173

# Tests
cd backend && npm test      # Vitest unit tests
```

---

*Mini Coffee POS — SWT301 Group 07 — SU26*
