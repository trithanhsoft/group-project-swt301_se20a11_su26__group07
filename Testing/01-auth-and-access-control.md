# Auth And Access Control

## Pham vi
- Routes: `/login`, `/admin/*`, `/staff/*`, `/profile`
- APIs: `POST /api/auth/login`, `GET /api/auth/me`, `PATCH /api/auth/me`, `PATCH /api/auth/change-password`
- Coverage mix: Functional, Validation, Security, Session, Regression

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| AUTH-01 | Functional | Dang nhap bang tai khoan `ADMIN` hop le | Redirect den `/admin/dashboard`, token duoc luu, profile hien dung role |
| AUTH-02 | Functional | Dang nhap bang tai khoan `STAFF` hop le | Redirect den `/staff/pos`, menu staff hien dung |
| AUTH-03 | Validation | Bo trong username hoac password | Hien thong bao loi, khong tao session |
| AUTH-04 | Negative | Username dung nhưng sai password | Bao `Invalid username or password`, khong dang nhap |
| AUTH-05 | Security | Dang nhap bang user `INACTIVE` | Bao `This account is inactive`, khong tao token hop le |
| AUTH-06 | Security | Truy cap route noi bo khi chua login | Redirect ve `/login`, khong lo du lieu |
| AUTH-07 | Security | Staff truy cap `/admin/*` | Hien `Access denied` hoac bi chan dung theo route guard |
| AUTH-08 | Security | Admin truy cap trang staff | Redirect ve dashboard admin thay vi vao trang staff |
| AUTH-09 | Session | Token luu san trong local storage va app bootstrap lai | `GET /auth/me` thanh cong, user duoc khoi phuc session |
| AUTH-10 | Session | Token khong hop le/het hieu luc khi goi API | Frontend xoa token va quay ve `/login` |
| AUTH-11 | Regression | User dang online bi doi sang `INACTIVE`, sau do goi protected API | API tra `401`, frontend thoat session |
| AUTH-12 | Security | API user management, report, stock forecast duoc goi truc tiep bang role sai | Backend tra `403`, khong chi chan bang frontend |
| AUTH-13 | Validation | Dang nhap voi username co dau cach o dau/cuoi | Username duoc trim dung, dang nhap thanh cong neu thong tin con lai hop le |
| AUTH-14 | Functional | User da login mo `/profile` | Ca `ADMIN` va `STAFF` deu vao duoc profile cua minh |
| AUTH-15 | Functional | User da login truy cap route `/` | Admin ve `/admin/dashboard`, Staff ve `/staff/pos` |
| AUTH-16 | Session | Logout tu app shell | Token/local storage bi xoa, refresh lai khong con session |
| AUTH-17 | Security | Goi `GET /api/auth/me` khong co bearer token | Backend tra `401 Unauthorized. Please login first.` |
| AUTH-18 | Security | Goi `GET /api/auth/me` bang token cua user vua bi deactivate | Backend tra `401 User session is invalid or inactive.` |
| AUTH-19 | UX/Security | Staff mo 1 URL admin cu the nhu `/admin/reports` hoac `/admin/products` | Hien trang `Access denied` hoac redirect dung, khong flicker lo du lieu admin |
| AUTH-20 | Regression | App bootstrap session that bai khi dang o protected page | User bi day ve `/login`, khong bi treo loader vo han |
