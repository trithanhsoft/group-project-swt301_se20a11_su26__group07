# User Management

## Pham vi
- UI: tab `Quan ly tai khoan` tai `/admin/hr?tab=users`, form tai `/admin/users/new`, `/admin/users/:id/edit`
- APIs: `GET/POST /api/users`, `GET/PATCH /api/users/:id`, `PATCH /api/users/:id/reset-password`
- Coverage mix: Functional, Validation, Security, Business rules

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| USER-01 | Functional | Admin mo tab user list | Danh sach user load duoc, khong tra `password_hash` |
| USER-02 | Functional | Search theo username/full name/email | Chi hien dong hop le voi tu khoa |
| USER-03 | Functional | Filter theo role va status | Ket qua khop bo loc |
| USER-04 | Functional | Tao user `STAFF` hop le | Tao thanh cong, login bang tai khoan moi duoc |
| USER-05 | Functional | Tao user `ADMIN` hop le | Tao thanh cong, role tra ve dung |
| USER-06 | Validation | Tao user trung username hoac trung email | Bao loi ro rang, khong tao ban ghi |
| USER-07 | Validation | Username sai format, qua ngan/dai, password qua ngan | Hien validation, khong luu |
| USER-08 | Functional | Sua full name/email/role/status cho user khac | Update thanh cong va hien tren list/detail |
| USER-09 | Business rule | Admin tu deactivate tai khoan cua chinh minh | Bi chan voi thong bao phu hop |
| USER-10 | Business rule | Admin tu ha role `ADMIN` cua chinh minh | Bi chan voi thong bao phu hop |
| USER-11 | Business rule | Thu vo hieu hoa admin active cuoi cung | Bi chan voi thong bao `You cannot remove the last active admin.` |
| USER-12 | Functional | Reset password cho user | Password moi dang nhap duoc, password cu neu co thi khong dung nua |
| USER-13 | Security | Staff goi `/api/users` hoac mo tab users | Backend tra `403`, UI khong hien data |
| USER-14 | Functional | Mo trang edit user ton tai | Form load dung `username`, `email`, `fullName`, `role`, `status`, metadata lien quan |
| USER-15 | Functional | Ket hop search + role filter + status filter | Ket qua van dung khi bo loc ket hop |
| USER-16 | Validation | Sua email cua user thanh email da ton tai | Backend tra loi trung lap, du lieu cu duoc giu nguyen |
| USER-17 | Validation | Tao user voi status `INACTIVE` | Tao thanh cong nhung user moi khong dang nhap duoc |
| USER-18 | Validation | Reset password voi password moi qua ngan/qua dai | Bi chan, khong cap nhat password hash |
| USER-19 | Security | Goi `GET /api/users/:id` bang id khong ton tai | Backend tra `404 User not found.` |
| USER-20 | Business rule | Admin sua role/status cua user thuong khong anh huong admin cuoi cung | Update hop le thanh cong |
| USER-21 | Regression | Sau khi reset password xong, dang nhap bang password moi cap nhat `last_login_at` binh thuong | Vua xac nhan reset password, vua xac nhan flow login khong vo |
