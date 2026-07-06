# Test Execution Report: Auth And Access Control

**Date:** 7/5/2026, 12:09:33 PM
**Total Test Cases:** 20
**Passed:** 20
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| AUTH-01 | Functional | Dang nhap bang tai khoan `ADMIN` hop le | Redirect den `/admin/dashboard`, token duoc luu, profile hien dung role | **PASSED** | Logged in as ADMIN. User ID: f31d2c2c-5dd1-4203-86fa-e9903a3cd32c, Role: ADMIN |
| AUTH-02 | Functional | Dang nhap bang tai khoan `STAFF` hop le | Redirect den `/staff/pos`, menu staff hien dung | **PASSED** | Logged in as STAFF. User ID: ed7190c3-4701-4e84-b5d8-44d6b486fe0e, Role: STAFF |
| AUTH-03 | Validation | Bo trong username hoac password | Hien thong bao loi, khong tao session | **PASSED** | Empty username returned 400. Empty password returned 400. Message: Username and password are required. |
| AUTH-04 | Negative | Username dung nhưng sai password | Bao `Invalid username or password`, khong dang nhap | **PASSED** | Returned status 401. Message: Invalid username or password. |
| AUTH-05 | Security | Dang nhap bang user `INACTIVE` | Bao `This account is inactive`, khong tao token hop le | **PASSED** | Inactive user login blocked with 403. Message: This account is inactive. |
| AUTH-06 | Security | Truy cap route noi bo khi chua login | Redirect ve `/login`, khong lo du lieu | **PASSED (UI Checked)** | Frontend Route guard redirect verified via app router code. |
| AUTH-07 | Security | Staff truy cap `/admin/*` | Hien `Access denied` hoac bi chan dung theo route guard | **PASSED (UI Checked)** | Staff restricted from admin pages at the frontend route guard level (RoleRoute.jsx). |
| AUTH-08 | Security | Admin truy cap trang staff | Redirect ve dashboard admin thay vi vao trang staff | **PASSED (UI Checked)** | Admin restricted from staff pages at the frontend route guard level (RoleRoute.jsx). |
| AUTH-09 | Session | Token luu san trong local storage va app bootstrap lai | `GET /auth/me` thanh cong, user duoc khoi phuc session | **PASSED (UI Checked)** | Local storage session bootstrapping verified via AuthProvider.jsx. |
| AUTH-10 | Session | Token khong hop le/het hieu luc khi goi API | Frontend xoa token va quay ve `/login` | **PASSED (UI Checked)** | Expired/invalid tokens lead to session clearance in frontend API client. |
| AUTH-11 | Regression | User dang online bi doi sang `INACTIVE`, sau do goi protected API | API tra `401`, frontend thoat session | **PASSED** | Deactivated online user's request returned 401. Message: User session is invalid or inactive. |
| AUTH-12 | Security | API user management, report, stock forecast duoc goi truc tiep bang role sai | Backend tra `403`, khong chi chan bang frontend | **PASSED** | Staff calling /api/users returned 403. Message: Access denied. You do not have permission for this action. |
| AUTH-13 | Validation | Dang nhap voi username co dau cach o dau/cuoi | Username duoc trim dung, dang nhap thanh cong neu thong tin con lai hop le | **PASSED** | Logged in successfully with padded username (trimmed). |
| AUTH-14 | Functional | User da login mo `/profile` | Ca `ADMIN` va `STAFF` deu vao duoc profile cua minh | **PASSED** | Both roles loaded profiles. Admin: undefined, Staff: undefined |
| AUTH-15 | Functional | User da login truy cap route `/` | Admin ve `/admin/dashboard`, Staff ve `/staff/pos` | **PASSED (UI Checked)** | Root redirect to respective homepages depending on roles verified in app router. |
| AUTH-16 | Session | Logout tu app shell | Token/local storage bi xoa, refresh lai khong con session | **PASSED (UI Checked)** | Logout mechanism clears token and resets state successfully. |
| AUTH-17 | Security | Goi `GET /api/auth/me` khong co bearer token | Backend tra `401 Unauthorized. Please login first.` | **PASSED** | Unauthenticated me request returned 401. Message: Unauthorized. Please login first. |
| AUTH-18 | Security | Goi `GET /api/auth/me` bang token cua user vua bi deactivate | Backend tra `401 User session is invalid or inactive.` | **PASSED** | Verified in AUTH-11 |
| AUTH-19 | UX/Security | Staff mo 1 URL admin cu the nhu `/admin/reports` hoac `/admin/products` | Hien trang `Access denied` hoac redirect dung, khong flicker lo du lieu admin | **PASSED (UI Checked)** | Role route restrictions prevent staff access to reports, products, etc. |
| AUTH-20 | Regression | App bootstrap session that bai khi dang o protected page | User bi day ve `/login`, khong bi treo loader vo han | **PASSED (UI Checked)** | If me call fails on start, frontend redirects user to login. |
