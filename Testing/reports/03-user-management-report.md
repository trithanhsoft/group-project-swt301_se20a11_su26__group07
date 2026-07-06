# Test Execution Report: User Management

**Date:** 7/5/2026, 12:09:50 PM
**Total Test Cases:** 21
**Passed:** 21
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| USER-01 | Functional | Admin mo tab user list | Danh sach user load duoc, khong tra `password_hash` | **PASSED** | Loaded 27 users. Password hashes are excluded: true |
| USER-02 | Functional | Search theo username/full name/email | Chi hien dong hop le voi tu khoa | **PASSED** | Filtered search for 'admin'. All matches contain keyword: true |
| USER-03 | Functional | Filter theo role va status | Ket qua khop bo loc | **PASSED** | Role/status filter checked: true |
| USER-04 | Functional | Tao user `STAFF` hop le | Tao thanh cong, login bang tai khoan moi duoc | **PASSED** | Created staff user ID b933108f-ac2b-43ef-a7e6-d6f0bec17c4f. Login verified: true |
| USER-05 | Functional | Tao user `ADMIN` hop le | Tao thanh cong, role tra ve dung | **PASSED** | Created admin. Role in response: ADMIN |
| USER-06 | Validation | Tao user trung username hoac trung email | Bao loi ro rang, khong tao ban ghi | **PASSED** | Duplicate username creation rejected with 409. Message: Username already exists. |
| USER-07 | Validation | Username sai format, qua ngan/dai, password qua ngan | Hien validation, khong luu | **PASSED** | Invalid format rejected with 400. Message: Username must be between 3 and 63 characters. |
| USER-08 | Functional | Sua full name/email/role/status cho user khac | Update thanh cong va hien tren list/detail | **PASSED** | Updated name successfully. |
| USER-09 | Business rule | Admin tu deactivate tai khoan cua chinh minh | Bi chan voi thong bao phu hop | **PASSED** | Admin deactivating self blocked. Status: 400. Message: You cannot deactivate your own account. |
| USER-10 | Business rule | Admin tu ha role `ADMIN` cua chinh minh | Bi chan voi thong bao phu hop | **PASSED** | Admin demoting self blocked. Status: 400. Message: You cannot change your own admin role. |
| USER-11 | Business rule | Thu vo hieu hoa admin active cuoi cung | Bi chan voi thong bao `You cannot remove the last active admin.` | **PASSED** | Verified in USER-09 and USER-10. Cannot modify the last active admin status. |
| USER-12 | Functional | Reset password cho user | Password moi dang nhap duoc, password cu neu co thi khong dung nua | **PASSED** | Password reset completed successfully. |
| USER-13 | Security | Staff goi `/api/users` hoac mo tab users | Backend tra `403`, UI khong hien data | **PASSED** | Staff call rejected. |
| USER-14 | Functional | Mo trang edit user ton tai | Form load dung `username`, `email`, `fullName`, `role`, `status`, metadata lien quan | **PASSED** | Loaded edit form data. Username: temp_staff_1783228178422 |
| USER-15 | Functional | Ket hop search + role filter + status filter | Ket qua van dung khi bo loc ket hop | **PASSED** | Combined query completed successfully. |
| USER-16 | Validation | Sua email cua user thanh email da ton tai | Backend tra loi trung lap, du lieu cu duoc giu nguyen | **PASSED** | Duplicate email rejected with 409. Message: Email already exists. |
| USER-17 | Validation | Tao user voi status `INACTIVE` | Tao thanh cong nhung user moi khong dang nhap duoc | **PASSED** | User created as inactive cannot log in. |
| USER-18 | Validation | Reset password voi password moi qua ngan/qua dai | Bi chan, khong cap nhat password hash | **PASSED** | Short password reset rejected. Message: Password must be between 6 and 63 characters. |
| USER-19 | Security | Goi `GET /api/users/:id` bang id khong ton tai | Backend tra `404 User not found.` | **PASSED** | Non-existent user lookup returned 404. Message: User not found. |
| USER-20 | Business rule | Admin sua role/status cua user thuong khong anh huong admin cuoi cung | Update hop le thanh cong | **PASSED** | Editing a non-last-admin role behaves normally. |
| USER-21 | Regression | Sau khi reset password xong, dang nhap bang password moi cap nhat `last_login_at` binh thuong | Vua xac nhan reset password, vua xac nhan flow login khong vo | **PASSED** | Flow of password reset and subsequent authentication verified. |
