# Profile Management

## Pham vi
- Route: `/profile`
- APIs: `GET /api/auth/me`, `PATCH /api/auth/me`, `PATCH /api/auth/change-password`
- Coverage mix: Functional, Validation, Security

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| PROF-01 | Functional | User mo trang profile | Hien username, role, email, full name, last login neu co |
| PROF-02 | Functional | Cap nhat full name va email hop le | Luu thanh cong, du lieu moi hien ngay sau refresh |
| PROF-03 | Validation | Email sai format | Bao validation, khong luu |
| PROF-04 | Validation | Full name rong hoac qua dai | Bao validation, khong luu |
| PROF-05 | Validation | Doi email sang email da ton tai o user khac | Backend tra trung lap, profile khong doi |
| PROF-06 | Functional | Doi mat khau voi current password dung | Doi thanh cong, dang nhap bang mat khau moi duoc |
| PROF-07 | Negative | Doi mat khau voi current password sai | Bao `Current password is incorrect.` |
| PROF-08 | Validation | New password giong current password hoac qua ngan | Bi chan, khong doi mat khau |
| PROF-09 | Security | User `INACTIVE` goi doi mat khau/cap nhat profile | Bi chan boi backend/session |
| PROF-10 | Security | Chua login mo `/profile` | Bi redirect ve `/login` |
| PROF-11 | Functional | Cap nhat email viet hoa/tron hoa thuong | Du lieu luu ve dang lowercase nhat quan |
| PROF-12 | Functional | Cap nhat full name/email co dau cach dau-cuoi | Gia tri luu sau khi trim khop mong doi |
| PROF-13 | UX | Role va username chi doc tren profile | Nguoi dung khong tu sua duoc role/username |
| PROF-14 | Regression | Sau khi doi mat khau, refresh app va bootstrap session tu token cu | Session hien tai van hop le den khi logout/het token; login moi dung password moi |
