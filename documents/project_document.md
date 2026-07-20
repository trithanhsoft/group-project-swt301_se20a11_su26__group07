# 📋 Mini Coffee POS & Inventory System — Project Documentation

> **Môn học:** SWT301 — Software Testing  
> **Nhóm:** Group 07 — SE20A11 — SU26  
> **Tên dự án:** Mini Coffee POS (Point of Sale) & Inventory System

---

## 1. Tổng quan dự án

**Mini Coffee POS** là một hệ thống quản lý bán hàng và kho nguyên liệu dành riêng cho quán cà phê nhỏ. Hệ thống phục vụ **2 vai trò chính**: Admin và Staff, với đầy đủ nghiệp vụ từ bán hàng, quản lý kho, quản lý nhân sự, đến báo cáo doanh thu.

### Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 19, Vite 8, React Router DOM v7, Lucide-react, XLSX |
| **Backend** | Node.js (ESM), Express 4, JWT, bcryptjs, Nodemailer |
| **Database** | PostgreSQL (qua Supabase, kết nối `pg` Pool) |
| **Auth** | JWT (7d expiry), bcrypt password hashing |
| **Payment** | Cash & VietQR (MB Bank) |
| **Testing** | Vitest (backend unit tests) |

---

## 2. Kiến trúc hệ thống

```
SWT_Project/
├── backend/          ← Node.js + Express REST API
│   └── src/
│       ├── config/   ← DB, env, mail config
│       ├── constants/ ← Enums/constants dùng chung
│       ├── middlewares/ ← auth, role, error handler
│       ├── modules/  ← 13 modules nghiệp vụ
│       ├── seed/     ← Script seed dữ liệu mẫu
│       └── utils/    ← Helper functions
├── frontend/         ← React + Vite SPA
│   └── src/
│       ├── app/      ← App root, routing, providers
│       ├── features/ ← 13 feature modules (tương ứng backend)
│       ├── components/ ← UI components dùng chung
│       ├── services/ ← API client (axios-like fetch wrapper)
│       ├── constants/ ← routes, roles constants
│       └── styles/   ← Global CSS
└── documents/        ← Tài liệu dự án, test plan
```

### Kiến trúc Backend (Module-Based)

Mỗi module backend gồm 3 file theo pattern **Controller → Service → Routes**:

```
modules/[feature]/
├── [feature].routes.js     ← Định nghĩa endpoint & middleware
├── [feature].controller.js ← Nhận request, gọi service, trả response
└── [feature].service.js    ← Business logic & DB queries (raw SQL)
```

Backend **không dùng ORM** — tất cả SQL được viết thủ công với `pg.Pool`.

---

## 3. Phân quyền hệ thống

| Vai trò | Mô tả | Redirect sau login |
|---------|-------|--------------------|
| `ADMIN` | Quản trị viên — toàn quyền | `/admin/dashboard` |
| `STAFF` | Nhân viên bán hàng — chức năng bán hàng & kho | `/staff/pos` |

### Routing phân quyền

```
/admin/*  → ProtectedRoute(role=ADMIN) → AdminLayout
/staff/*  → ProtectedRoute(role=STAFF) → StaffLayout
/profile  → ProtectedRoute(bất kỳ role) → ProfilePage
/login    → Public
```

---

## 4. Các tính năng chi tiết

### 4.1 🔐 Authentication & Profile (`/auth`, `/profile`)

**Backend:** `modules/auth`  
**Frontend:** `features/auth`, `features/profile`

| Chức năng | Mô tả |
|-----------|-------|
| **Đăng nhập** | Username + Password → JWT token (7 ngày) |
| **Cập nhật hồ sơ** | Đổi fullName, email (kiểm tra email trùng) |
| **Đổi mật khẩu** | Cần nhập mật khẩu cũ; mật khẩu từ 6–63 ký tự |
| **Quên mật khẩu** | Nhập email + username → gửi OTP 6 số qua email (hết hạn 15 phút) |
| **Reset mật khẩu** | Xác thực OTP → đặt mật khẩu mới |

**Validation:**
- Email phải đúng format regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Tài khoản `INACTIVE` không thể đăng nhập
- `last_login_at` được cập nhật mỗi lần đăng nhập thành công

---

### 4.2 🛍️ POS (Point of Sale) — Bán hàng (`/staff/pos`)

**Backend:** `modules/orders`, `modules/pos_sessions`  
**Frontend:** `features/pos`

#### POS Session (Ca bán hàng)

| Chức năng | Mô tả |
|-----------|-------|
| **Mở ca** | Staff khai báo tiền mặt đầu ca, tạo session `OPEN` |
| **Giữa ca** | Đếm tiền giữa ca (mid-shift count) — lưu `mid_shift_cash` |
| **Kết ca** | Nhập tiền thực tế — hệ thống tính doanh thu, chênh lệch tiền mặt |
| **Cảnh báo** | Nếu ca đã mở > 12 tiếng → `shouldWarnClose = true` |

**Quy trình tạo đơn hàng:**

```
1. Staff chọn sản phẩm → Cart
2. Hệ thống validate: sản phẩm tồn tại, ACTIVE, có công thức (recipe)
3. Tính tổng tiền từng sản phẩm × số lượng
4. Chọn phương thức thanh toán: CASH hoặc QR (VietQR)
5. BEGIN TRANSACTION:
   a. Kiểm tra ca bán hàng đang OPEN
   b. Tạo order code duy nhất (format: OD + timestamp14 + 3 chữ số random)
   c. INSERT vào bảng `orders`
   d. INSERT từng dòng vào `order_items`
   e. Lock nguyên liệu → kiểm tra tồn kho → trừ kho
   f. INSERT `stock_transactions` type=ORDER_DEDUCT
6. COMMIT
```

**Phương thức thanh toán:**
- **CASH**: Nhập tiền nhận, hệ thống tính tiền thừa `change_amount`
- **QR**: Tạo link VietQR (MB Bank) từ env config

---

### 4.3 🔄 Hoàn tiền / Refund

**Backend:** `modules/orders` → `refundOrderItems()`

| Loại hoàn | Mô tả |
|-----------|-------|
| **Hoàn toàn bộ** | `refundAll=true` → hoàn tất cả sản phẩm chưa hoàn |
| **Hoàn từng phần** | Truyền danh sách `items[]` với `orderItemId + refundQuantity` |
| **Trả hàng về kho** | `returnToStock=true` → cộng lại tồn kho + tạo stock transaction `ORDER_REFUND` |

**Trạng thái đơn sau hoàn:**
- `PARTIALLY_REFUNDED` — hoàn một phần
- `REFUNDED` — hoàn toàn bộ

**Bắt buộc nhập lý do** hoàn tiền (`reason` field).

---

### 4.4 🍳 KDS — Kitchen Display System (`/staff/kds`)

**Backend:** `modules/kds`  
**Frontend:** `features/kds`

Màn hình bếp hiển thị real-time danh sách đơn hàng cần pha chế:

| Column | Nội dung |
|--------|----------|
| **Đơn mới** (`kds_status=NEW`) | Hiển thị theo thứ tự thời gian tạo (cũ → mới) |
| **Đơn hoàn thành** (`kds_status=COMPLETED`) | Hiển thị 20 đơn gần nhất |

**Flow KDS:**
```
Order tạo → kds_status="NEW"
Staff bếp bấm "Hoàn thành" → kds_status="COMPLETED" 
    → ghi kds_completed_at, kds_completed_by
```

---

### 4.5 🥤 Sản phẩm (`/admin/products`)

**Backend:** `modules/products`  
**Frontend:** `features/products`

| Chức năng | Quyền | Mô tả |
|-----------|-------|-------|
| Danh sách sản phẩm | ADMIN | Có thể filter theo tag/status |
| Thêm sản phẩm | ADMIN | Tên (max 63 ký tự), giá > 0, tag, status |
| Sửa sản phẩm | ADMIN | Chỉnh sửa tất cả thông tin |
| Xóa sản phẩm | ADMIN | Soft delete (`deleted_at`) |
| Quản lý Công thức | ADMIN | Từ tab Recipes trong trang Products |

**Trạng thái sản phẩm:** `ACTIVE` | `INACTIVE`  
**Tag sản phẩm:** Phân loại nhóm (Coffee, Tea, etc.) — tự động nhận diện từ tên

---

### 4.6 📋 Công thức (Recipes) (`/admin/recipes`)

**Backend:** `modules/recipes`  
**Frontend:** `features/recipes`

Mỗi sản phẩm có đúng **1 công thức** gồm nhiều nguyên liệu:
```
recipes (1) ←→ recipe_items (many) ←→ ingredients
```

- Khi tạo đơn hàng → hệ thống lấy công thức → tính lượng nguyên liệu cần dùng
- Nếu sản phẩm không có công thức → không thể bán

---

### 4.7 🧂 Nguyên liệu (Ingredients) (`/admin/ingredients`)

**Backend:** `modules/ingredients`  
**Frontend:** `features/ingredients`

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách | Filter theo tag, trạng thái tồn kho |
| Thêm/Sửa/Xóa | Soft delete |
| Ngưỡng cảnh báo | `low_stock_threshold` — cảnh báo khi `current_stock < threshold` |

**Đơn vị:** `GRAM`, `ML`, `PIECE`, `LITER`, `KG`, `OTHER`  
**Tag nguyên liệu:** Tự động nhận diện (Cà phê, Sữa, Đường, Trái cây, v.v.)

---

### 4.8 📦 Quản lý kho (Stock) (`/admin/stock`, `/staff/stock`)

**Backend:** `modules/stock`  
**Frontend:** `features/stock`

#### Các loại giao dịch kho (Stock Transaction Types)

| Type | Mô tả | Quyền |
|------|-------|-------|
| `IMPORT` | Nhập kho đơn lẻ | ADMIN, STAFF |
| `IMPORT` (batch) | Nhập kho nhiều nguyên liệu cùng lúc | ADMIN, STAFF |
| `ADJUST` | Điều chỉnh tồn kho (tăng/giảm thủ công) | ADMIN, STAFF |
| `ORDER_DEDUCT` | Trừ kho tự động khi tạo đơn | Hệ thống tự làm |
| `ORDER_REFUND` | Hoàn kho khi refund đơn | Hệ thống tự làm |
| `DISCARD` | Hủy hàng / báo hỏng (note bắt đầu bằng `[HỦY HÀNG]`) | ADMIN, STAFF |

#### Kiểm kho hàng ngày (Daily Stock Count)

Nhân viên nhập số lượng thực tế đếm được → hệ thống so sánh với số liệu trong DB → tạo giao dịch ADJUST nếu lệch.

#### Dự báo kho (Forecast)

Tính toán tốc độ tiêu thụ nguyên liệu từ dữ liệu lịch sử để dự báo khi nào cần nhập thêm.

---

### 4.9 📊 Báo cáo (Reports) (`/admin/reports`)

**Backend:** `modules/reports`  
**Frontend:** `features/reports`

| Báo cáo | Dữ liệu | Nguồn |
|---------|---------|-------|
| **Doanh thu hàng ngày** | Số đơn, tổng doanh thu, tổng hoàn tiền theo ngày | View `v_daily_revenue` |
| **Sản phẩm bán chạy** | Tên sản phẩm, số lượng bán, tổng doanh thu | View `v_best_selling_products` |
| **Tồn kho thấp** | Nguyên liệu dưới ngưỡng cảnh báo | View `v_low_stock_ingredients` |
| **Báo cáo hủy hàng** | Lịch sử giao dịch DISCARD | Bảng `stock_transactions` |

**Hỗ trợ xuất Excel** (thư viện `xlsx`).

---

### 4.10 📊 Dashboard (`/admin/dashboard`)

**Backend:** `modules/dashboard`  
**Frontend:** `features/dashboard`

Tổng hợp nhanh các chỉ số quan trọng:
- Tổng doanh thu hôm nay / tuần / tháng
- Số đơn hàng
- Cảnh báo tồn kho thấp
- Sản phẩm bán chạy

---

### 4.11 👥 Nhân sự (HR) (`/admin/hr`, `/staff/hr`)

**Backend:** `modules/hr`  
**Frontend:** `features/hr`

#### Shifts (Ca làm việc mẫu)

| Ca | Giờ | Lương/giờ |
|----|-----|-----------|
| Ca Sáng | 06:00 – 12:00 | 25,000 VND |
| Ca Chiều | 12:00 – 18:00 | 25,000 VND |
| Ca Tối | 18:00 – 23:00 | 30,000 VND |

Admin có thể thêm/sửa/xóa ca mẫu.

#### Staff Availability (Lịch rảnh nhân viên)

Staff tự đăng ký khung giờ rảnh để admin tham khảo khi phân ca. Hệ thống kiểm tra overlap thời gian.

#### Staff Shifts (Phân ca làm việc)

Admin phân ca cho từng nhân viên:
- Chọn ca mẫu hoặc tùy chỉnh giờ (6h–23h, tối thiểu 3h, tối đa 16h)
- Kiểm tra xung đột lịch tự động
- Trạng thái: `PENDING`, `COMPLETED`, `ABSENT`
- Lương = số giờ × `hourly_rate_snapshot`

#### Staff Requests (Yêu cầu nhân viên)

| Loại | Mô tả | Khi duyệt |
|------|-------|-----------|
| `LEAVE` | Xin nghỉ phép | Cập nhật ca → `ABSENT`, lương = 0 |
| `SWAP` | Đổi ca với người khác | Hoán đổi `staff_id` trên bảng `staff_shifts` |

Trạng thái yêu cầu: `PENDING` → `APPROVED` / `REJECTED`

#### HR Cost Report

Tổng hợp số ca hoàn thành và tổng lương của từng nhân viên theo khoảng ngày.

---

### 4.12 📅 Chấm công (Attendance) (`/admin/hr/attendance`)

**Backend:** `modules/attendance`  
**Frontend:** `features/hr/AttendancePage`

**Cơ chế chấm công bằng QR:**

```
1. Admin vào /admin/hr/attendance → xem QR code hôm nay
   (QR token = SHA256(salt + "YYYY-MM-DD") — thay đổi mỗi ngày)
2. Staff scan QR → POST /api/attendance/check-in với token
3. Hệ thống xác thực token, ghi check_in_at, tính lateness_minutes
4. Khi kết ca → POST /api/attendance/check-out
   → ghi check_out_at, tính actual_hours, cập nhật total_salary
   → staff_shifts.status = "COMPLETED"
```

**Tính toán đi trễ:** `lateness_minutes = giờ check-in thực tế - giờ bắt đầu ca`

---

### 4.13 👤 Quản lý người dùng (Users) (`/admin/hr`)

**Backend:** `modules/users`  
**Frontend:** `features/users`

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách user | ADMIN only |
| Tạo user mới | Role: ADMIN / STAFF; mật khẩu auto-generate |
| Sửa thông tin | Fullname, email, role, status |
| Reset mật khẩu | Admin đặt lại mật khẩu cho user |
| Soft delete | Không xóa thật — ghi `deleted_at` |

**Trạng thái user:** `ACTIVE` | `INACTIVE`

---

### 4.14 📜 Lịch sử đơn hàng (Orders)

**Backend:** `modules/orders`  
**Frontend:** `features/orders`

| Role | Quyền xem |
|------|-----------|
| STAFF | Chỉ xem đơn của mình (`staff_id = current_user.id`) |
| ADMIN | Xem tất cả đơn, filter theo staff/ngày/trạng thái/mã đơn |

**Trạng thái đơn:** `SUCCESS` | `PARTIALLY_REFUNDED` | `REFUNDED`

---

## 5. Cấu trúc Database

> **Database:** PostgreSQL (hosted trên Supabase)  
> **Kết nối:** Pool với max 10 connections, SSL enabled

### Bảng dữ liệu chính

#### `app_users` — Người dùng hệ thống

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `username` | VARCHAR | Unique, case-insensitive login |
| `email` | VARCHAR | Email liên hệ |
| `password_hash` | VARCHAR | bcrypt hash (cost=10) |
| `full_name` | VARCHAR(120) | Tên hiển thị |
| `role` | ENUM | `ADMIN` / `STAFF` |
| `status` | ENUM | `ACTIVE` / `INACTIVE` |
| `last_login_at` | TIMESTAMP | Lần đăng nhập cuối |
| `reset_token` | VARCHAR | OTP 6 số cho reset password |
| `reset_token_expires_at` | TIMESTAMP | Hết hạn OTP (mặc định 15 phút) |
| `deleted_at` | TIMESTAMP | Soft delete |

---

#### `products` — Sản phẩm

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(63) | Tên sản phẩm (unique case-insensitive) |
| `tag` | VARCHAR | Nhóm sản phẩm |
| `price` | NUMERIC | Giá bán (> 0) |
| `status` | ENUM | `ACTIVE` / `INACTIVE` |
| `created_by` | UUID → `app_users` | Người tạo |
| `deleted_at` | TIMESTAMP | Soft delete |

---

#### `ingredients` — Nguyên liệu

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Tên nguyên liệu |
| `tag` | VARCHAR | Nhóm nguyên liệu |
| `unit` | ENUM | `GRAM`, `ML`, `PIECE`, `LITER`, `KG`, `OTHER` |
| `current_stock` | NUMERIC | Tồn kho hiện tại |
| `low_stock_threshold` | NUMERIC | Ngưỡng cảnh báo thấp |
| `created_by` | UUID → `app_users` | |
| `deleted_at` | TIMESTAMP | Soft delete |

---

#### `recipes` — Công thức nấu ăn

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `product_id` | UUID → `products` | 1-1 với sản phẩm |
| `created_by` | UUID | |
| `deleted_at` | TIMESTAMP | Soft delete |

#### `recipe_items` — Chi tiết nguyên liệu trong công thức

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `recipe_id` | UUID → `recipes` | |
| `ingredient_id` | UUID → `ingredients` | |
| `quantity_required` | NUMERIC | Lượng cần cho 1 đơn vị sản phẩm |

---

#### `orders` — Đơn hàng

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `order_code` | VARCHAR | Unique, format `OD{timestamp14}{3digits}` |
| `staff_id` | UUID → `app_users` | Nhân viên tạo đơn |
| `pos_session_id` | UUID → `pos_sessions` | Ca bán hàng |
| `total_amount` | NUMERIC | Tổng tiền |
| `refunded_amount` | NUMERIC | Tổng đã hoàn (default 0) |
| `payment_method` | ENUM | `CASH` / `QR` |
| `amount_received` | NUMERIC | Tiền khách đưa |
| `change_amount` | NUMERIC | Tiền thừa |
| `paid_at` | TIMESTAMP | Thời gian thanh toán |
| `status` | ENUM | `SUCCESS` / `PARTIALLY_REFUNDED` / `REFUNDED` |
| `kds_status` | ENUM | `NEW` / `COMPLETED` |
| `kds_completed_at` | TIMESTAMP | Thời gian bếp hoàn thành |
| `kds_completed_by` | UUID | Staff bếp xác nhận |
| `note` | TEXT | Ghi chú đơn hàng |

#### `order_items` — Chi tiết sản phẩm trong đơn

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `order_id` | UUID → `orders` | |
| `product_id` | UUID → `products` | |
| `product_name_snapshot` | VARCHAR | Tên sản phẩm lúc đặt (snapshot) |
| `quantity` | INTEGER | Số lượng |
| `unit_price` | NUMERIC | Giá lúc đặt (snapshot) |
| `subtotal` | NUMERIC | quantity × unit_price |
| `refunded_quantity` | INTEGER | Số lượng đã hoàn (default 0) |

---

#### `stock_transactions` — Lịch sử giao dịch kho

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `ingredient_id` | UUID → `ingredients` | |
| `type` | ENUM | `IMPORT` / `ADJUST` / `ORDER_DEDUCT` / `ORDER_REFUND` |
| `quantity` | NUMERIC | Số lượng giao dịch |
| `before_stock` | NUMERIC | Tồn kho trước |
| `after_stock` | NUMERIC | Tồn kho sau |
| `order_id` | UUID → `orders` | Nullable (chỉ có khi type=ORDER_DEDUCT/REFUND) |
| `note` | TEXT | Ghi chú (hủy hàng bắt đầu bằng `[HỦY HÀNG]`) |
| `created_by` | UUID → `app_users` | |

---

#### `pos_sessions` — Ca bán hàng POS

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `staff_id` | UUID → `app_users` | Nhân viên mở ca |
| `status` | ENUM | `OPEN` / `CLOSED` |
| `opened_at` | TIMESTAMP | Thời gian mở ca |
| `starting_cash` | NUMERIC | Tiền mặt đầu ca |
| `mid_shift_cash` | NUMERIC | Tiền đếm giữa ca |
| `mid_shift_counted_at` | TIMESTAMP | Thời gian đếm giữa ca |
| `mid_shift_expected` | NUMERIC | Tiền kỳ vọng giữa ca |
| `mid_shift_discrepancy` | NUMERIC | Chênh lệch giữa ca |
| `mid_shift_notes` | TEXT | Ghi chú giữa ca |
| `ending_cash_actual` | NUMERIC | Tiền thực tế kết ca |
| `notes` | TEXT | Ghi chú mở/đóng ca |

---

#### `shifts` — Ca làm việc mẫu

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Tên ca (Ca Sáng, Ca Chiều, Ca Tối) |
| `start_time` | TIME | Giờ bắt đầu |
| `end_time` | TIME | Giờ kết thúc |
| `hourly_rate` | NUMERIC | Lương mỗi giờ (VND) |
| `deleted_at` | TIMESTAMP | Soft delete |

---

#### `staff_shifts` — Phân ca cho nhân viên

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `staff_id` | UUID → `app_users` | |
| `shift_id` | UUID → `shifts` | |
| `shift_date` | DATE | Ngày làm việc |
| `status` | ENUM | `PENDING` / `COMPLETED` / `ABSENT` |
| `hourly_rate_snapshot` | NUMERIC | Lương/giờ tại thời điểm phân ca |
| `total_salary` | NUMERIC | Tổng lương ca đó |
| `custom_start_time` | TIME | Giờ tùy chỉnh (nullable) |
| `custom_end_time` | TIME | Giờ tùy chỉnh (nullable) |
| `check_in_at` | TIMESTAMP | Thời gian chấm công vào |
| `check_out_at` | TIMESTAMP | Thời gian chấm công ra |
| `lateness_minutes` | INTEGER | Số phút đi trễ |
| `created_by` | UUID | Admin phân ca |

---

#### `staff_availability` — Lịch rảnh nhân viên

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `staff_id` | UUID → `app_users` | |
| `available_date` | DATE | Ngày rảnh |
| `start_time` | TIME | Giờ bắt đầu rảnh |
| `end_time` | TIME | Giờ kết thúc rảnh |
| `note` | TEXT | Ghi chú |

---

#### `staff_requests` — Yêu cầu của nhân viên

| Column | Type | Mô tả |
|--------|------|-------|
| `id` | UUID | Primary key |
| `staff_id` | UUID → `app_users` | |
| `type` | ENUM | `LEAVE` / `SWAP` |
| `status` | ENUM | `PENDING` / `APPROVED` / `REJECTED` |
| `reason` | TEXT | Lý do yêu cầu |
| `target_date` | DATE | Ngày áp dụng |
| `target_shift_id` | UUID → `shifts` | Ca liên quan |
| `swap_with_staff_id` | UUID → `app_users` | Nhân viên nhận đổi ca (SWAP) |
| `admin_note` | TEXT | Ghi chú của admin khi xử lý |
| `processed_by` | UUID → `app_users` | Admin xử lý |
| `processed_at` | TIMESTAMP | Thời gian xử lý |

---

### Views SQL được sử dụng

| View | Mô tả |
|------|-------|
| `v_daily_revenue` | Tổng hợp doanh thu theo ngày |
| `v_best_selling_products` | Sản phẩm bán chạy nhất |
| `v_low_stock_ingredients` | Nguyên liệu dưới ngưỡng cảnh báo |

---

## 6. API Endpoints

### Auth (`/api/auth`)
| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/login` | Đăng nhập |
| GET | `/me` | Lấy thông tin user hiện tại |
| PATCH | `/me/profile` | Cập nhật hồ sơ |
| PATCH | `/me/password` | Đổi mật khẩu |
| POST | `/forgot-password` | Yêu cầu OTP reset password |
| POST | `/reset-password` | Đặt lại mật khẩu bằng OTP |

### Users (`/api/users`) — ADMIN only
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/` | Danh sách users |
| POST | `/` | Tạo user mới |
| GET | `/:id` | Chi tiết user |
| PATCH | `/:id` | Cập nhật user |
| PATCH | `/:id/reset-password` | Reset mật khẩu |

### Products (`/api/products`)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/` | Danh sách sản phẩm |
| POST | `/` | Tạo sản phẩm (ADMIN) |
| GET | `/:id` | Chi tiết sản phẩm |
| PATCH | `/:id` | Cập nhật (ADMIN) |
| DELETE | `/:id` | Xóa mềm (ADMIN) |

### Ingredients (`/api/ingredients`)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/` | Danh sách nguyên liệu |
| POST | `/` | Tạo (ADMIN) |
| GET | `/:id` | Chi tiết |
| PATCH | `/:id` | Cập nhật (ADMIN) |
| DELETE | `/:id` | Xóa mềm (ADMIN) |

### Stock (`/api/stock`) — ADMIN & STAFF
| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/import` | Nhập kho đơn lẻ |
| POST | `/import/batch` | Nhập kho hàng loạt |
| POST | `/adjust` | Điều chỉnh kho |
| POST | `/count/daily` | Kiểm kho hàng ngày |
| POST | `/discard` | Hủy hàng |
| GET | `/transactions` | Lịch sử giao dịch (ADMIN) |
| GET | `/forecast` | Dự báo kho (ADMIN) |

### Orders (`/api/orders`)
| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/` | Tạo đơn hàng (STAFF) |
| GET | `/staff` | Lịch sử đơn của staff |
| GET | `/staff/:id` | Chi tiết đơn (STAFF) |
| GET | `/admin` | Tất cả đơn (ADMIN) |
| GET | `/admin/:id` | Chi tiết đơn (ADMIN) |
| POST | `/:id/refund` | Hoàn tiền |

### KDS (`/api/kds`) — STAFF
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/` | Danh sách đơn KDS |
| PATCH | `/:id/complete` | Đánh dấu hoàn thành |

### Reports (`/api/reports`) — ADMIN
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/revenue` | Doanh thu theo ngày |
| GET | `/best-selling` | Sản phẩm bán chạy |
| GET | `/low-stock` | Tồn kho thấp |
| GET | `/discard` | Báo cáo hủy hàng |

### HR (`/api/hr`)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/shifts` | Danh sách ca mẫu |
| POST | `/shifts` | Tạo ca mẫu (ADMIN) |
| PATCH | `/shifts/:id` | Cập nhật ca (ADMIN) |
| DELETE | `/shifts/:id` | Xóa ca (ADMIN) |
| GET | `/availability` | Lịch rảnh |
| POST | `/availability` | Đăng ký rảnh (STAFF) |
| DELETE | `/availability/:id` | Xóa lịch rảnh |
| GET | `/assigned-shifts` | Lịch phân ca |
| POST | `/assigned-shifts` | Phân ca (ADMIN) |
| PATCH | `/assigned-shifts/:id/status` | Cập nhật trạng thái |
| DELETE | `/assigned-shifts/:id` | Xóa phân ca |
| GET | `/requests` | Danh sách yêu cầu |
| POST | `/requests` | Tạo yêu cầu (STAFF) |
| PATCH | `/requests/:id` | Xử lý yêu cầu (ADMIN) |
| GET | `/salary-summary` | Tổng kết lương cá nhân |
| GET | `/cost-report` | Báo cáo chi phí nhân sự (ADMIN) |
| GET | `/active-staff` | Danh sách staff đang hoạt động |

### Attendance (`/api/attendance`)
| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/check-in` | Chấm công vào |
| POST | `/check-out` | Chấm công ra |
| GET | `/today-status` | Trạng thái chấm công hôm nay |
| GET | `/qr-token` | Lấy QR token hôm nay (ADMIN) |
| GET | `/logs` | Lịch sử chấm công (ADMIN) |

### POS Sessions (`/api/pos-sessions`)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/active` | Ca đang mở của staff hiện tại |
| POST | `/open` | Mở ca |
| POST | `/:id/mid-shift` | Đếm tiền giữa ca |
| POST | `/:id/close` | Kết ca |
| GET | `/history` | Lịch sử ca (ADMIN) |

---

## 7. Middleware & Bảo mật

### Auth Middleware (`requireAuth`)
- Đọc `Authorization: Bearer <token>` header
- Verify JWT → gán `req.user`
- Trả 401 nếu token invalid/expired

### Role Middleware (`requireRole`)
- Kiểm tra `req.user.role` có trong danh sách roles cho phép
- Trả 403 nếu không đủ quyền

### Error Handler
- `notFoundHandler`: 404 cho routes không tồn tại
- `errorHandler`: Xử lý `ApiError` custom và lỗi chung

---

## 8. Frontend Structure

### App Providers
```jsx
<BrowserRouter>
  <AuthProvider>  ← Quản lý auth state (user, token, login/logout)
    <App />
      <AppRouter />  ← Routing logic
  </AuthProvider>
</BrowserRouter>
```

### Feature Structure (mỗi feature)
```
features/[feature]/
├── api/          ← Gọi API (sử dụng apiClient từ services/)
└── pages/        ← React components cho từng trang
    ├── [Feature]ListPage.jsx
    ├── [Feature]FormPage.jsx
    └── [Feature]DetailPage.jsx
```

### API Client (`services/apiClient.js`)
- Wrapper fetch với base URL từ env
- Tự động đính kèm JWT token
- Xử lý lỗi tập trung

### Constants

| File | Nội dung |
|------|----------|
| `constants/roles.js` | `ADMIN`, `STAFF` |
| `constants/routes.js` | Tất cả đường dẫn URL |

---

## 9. Environment Variables

### Backend (`backend/.env`)

| Variable | Mô tả |
|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Khóa ký JWT |
| `JWT_EXPIRES_IN` | Thời hạn token (default: `7d`) |
| `PORT` | Cổng server (default: `5000`) |
| `CLIENT_URL` | CORS origin (default: `http://localhost:5173`) |
| `VIETQR_BANK_ID` | Mã ngân hàng VietQR (default: `mbbank`) |
| `VIETQR_ACCOUNT_NO` | Số tài khoản thanh toán QR |
| `VIETQR_ACCOUNT_NAME` | Tên tài khoản |
| `PASSWORD_RESET_EXPIRES_MINUTES` | Hết hạn OTP (default: `15`) |
| `MAIL_FROM_NAME` | Tên người gửi email |

### Frontend (`frontend/.env`)

| Variable | Mô tả |
|----------|-------|
| `VITE_API_BASE_URL` | URL backend API |

---

## 10. Tài khoản Demo (Seed Data)

| Role | Username | Password |
|------|----------|----------|
| ADMIN | `admin` | `Admin123@` |
| STAFF | `staff` | `Staff123@` |

**Sản phẩm mẫu:**
- Milk Coffee — 30,000 VND (ACTIVE)
- Black Coffee — 25,000 VND (ACTIVE)

**Nguyên liệu mẫu:**
- Coffee bean: 1,000g (ngưỡng: 100g)
- Milk: 1,000ml (ngưỡng: 100ml)
- Sugar: 50g (ngưỡng: 100g) ← **đang thấp hơn ngưỡng!**

---

## 11. Sơ đồ quan hệ nghiệp vụ chính

```
app_users
  ├──[creates]──→ products
  ├──[creates]──→ ingredients
  ├──[staff]──→ pos_sessions (1 staff, 1 OPEN session tại 1 thời điểm)
  ├──[staff]──→ orders (thông qua pos_session)
  ├──[assigned]──→ staff_shifts (thông qua shifts)
  └──[submits]──→ staff_requests

products ←──→ recipes ←──→ recipe_items ──→ ingredients

orders ──→ order_items ──→ products
orders ──→ stock_transactions (ORDER_DEDUCT)
orders ──→ stock_transactions (ORDER_REFUND, nếu refund + returnToStock)

stock_transactions ──→ ingredients (update current_stock)

staff_shifts
  ├── check_in_at / check_out_at (chấm công)
  ├── lateness_minutes
  ├── total_salary (tính từ actual_hours × hourly_rate_snapshot)
  └── status: PENDING → COMPLETED / ABSENT
```

---

*Document được tạo tự động từ source code — Mini Coffee POS v1.0.0*
