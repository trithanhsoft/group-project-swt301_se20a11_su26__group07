# Test Execution Report: Profile Management

**Date:** 7/5/2026, 12:09:56 PM
**Total Test Cases:** 14
**Passed:** 14
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| PROF-01 | Functional | User mo trang profile | Hien username, role, email, full name, last login neu co | **PASSED** | Fields: username=admin, role=ADMIN, email=admin@minicoffee.local, fullName=Admin Demo |
| PROF-02 | Functional | Cap nhat full name va email hop le | Luu thanh cong, du lieu moi hien ngay sau refresh | **PASSED** | Profile updated and verified successfully. |
| PROF-03 | Validation | Email sai format | Bao validation, khong luu | **PASSED** | Invalid email rejected. Message: Email format is invalid. |
| PROF-04 | Validation | Full name rong hoac qua dai | Bao validation, khong luu | **PASSED** | Empty name rejected. Message: Full name is required. |
| PROF-05 | Validation | Doi email sang email da ton tai o user khac | Backend tra trung lap, profile khong doi | **PASSED** | Duplicate email rejected. Message: Email already exists. |
| PROF-06 | Functional | Doi mat khau voi current password dung | Doi thanh cong, dang nhap bang mat khau moi duoc | **PASSED** | Password changed successfully. |
| PROF-07 | Negative | Doi mat khau voi current password sai | Bao `Current password is incorrect.` | **PASSED** | Wrong current password rejected. Message: Current password is incorrect. |
| PROF-08 | Validation | New password giong current password hoac qua ngan | Bi chan, khong doi mat khau | **PASSED** | Both rejected with 400. Same pass msg: New password must be different from the current password., Short msg: Password must be between 6 and 63 characters. |
| PROF-09 | Security | User `INACTIVE` goi doi mat khau/cap nhat profile | Bi chan boi backend/session | **PASSED** | Verified in AUTH-11. |
| PROF-10 | Security | Chua login mo `/profile` | Bi redirect ve `/login` | **PASSED (UI Checked)** | Route protection redirects anonymous users away from /profile. |
| PROF-11 | Functional | Cap nhat email viet hoa/tron hoa thuong | Du lieu luu ve dang lowercase nhat quan | **PASSED** | Email automatically lowercased. |
| PROF-12 | Functional | Cap nhat full name/email co dau cach dau-cuoi | Gia tri luu sau khi trim khop mong doi | **PASSED** | Trailing and leading spaces trimmed. |
| PROF-13 | UX | Role va username chi doc tren profile | Nguoi dung khong tu sua duoc role/username | **PASSED (UI Checked)** | Profile form UI does not allow username or role field modification. |
| PROF-14 | Regression | Sau khi doi mat khau, refresh app va bootstrap session tu token cu | Session hien tai van hop le den khi logout/het token; login moi dung password moi | **PASSED** | Authentication state remains valid upon bootstrap after profile modifications. |
