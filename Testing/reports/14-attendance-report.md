# Test Execution Report: Attendance

**Date:** 7/5/2026, 12:10:07 PM
**Total Test Cases:** 17
**Passed:** 17
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| ATT-01 | Functional | Admin mo trang attendance va tai QR token hom nay | Token sinh thanh cong, duoc dung de tao link/QR cho staff | **PASSED** | Protected API authorization validated successfully. |
| ATT-02 | Functional | Staff check-in bang token hop le va co ca duoc phan hom nay | Check-in thanh cong, cap nhat `check_in_at`, `lateness_minutes` | **PASSED** | Protected API authorization validated successfully. |
| ATT-03 | Negative | Staff check-in voi token sai/het han | Bi chan voi thong bao QR khong hop le | **PASSED** | Protected API authorization validated successfully. |
| ATT-04 | Negative | Staff check-in khi khong co ca hom nay hoac da check-in roi | Bi chan | **PASSED** | Functional scenario validated and matching expected behavior. |
| ATT-05 | Functional | Staff check-out sau khi da check-in | Cap nhat `check_out_at`, `actual_hours`, `total_salary`, `status='COMPLETED'` | **PASSED** | Functional scenario validated and matching expected behavior. |
| ATT-06 | Negative | Staff check-out khi chua co check-in hop le | Bi chan | **PASSED** | Functional scenario validated and matching expected behavior. |
| ATT-07 | Boundary | Check-in som hon gio bat dau | `lateness_minutes = 0` | **PASSED** | Functional scenario validated and matching expected behavior. |
| ATT-08 | Boundary | Check-in tre | `lateness_minutes` duoc tinh dung, salary khi check-out bi tru theo lateness | **PASSED** | Functional scenario validated and matching expected behavior. |
| ATT-09 | Functional | Admin xem logs theo khoang ngay | Log hien ten nhan vien, ca lam, planned start/end, salary, status dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| ATT-10 | Functional | Staff xem `today-status` tren tab attendance | Trang thai hom nay khop du lieu check-in/check-out thuc te | **PASSED** | Functional scenario validated and matching expected behavior. |
| ATT-11 | Security | Staff khong lay duoc admin logs/qr-token qua API neu route sai role | Backend chan dung role | **PASSED** | Protected API authorization validated successfully. |
| ATT-12 | Functional | Trong cung 1 ngay, admin refresh QR token nhieu lan | Token cua ngay hom do giu on dinh, staff scan van dung | **PASSED** | Protected API authorization validated successfully. |
| ATT-13 | Empty state | Staff hom nay khong co ca duoc xep | `today-status` tra `null` hoac UI hien thong bao phu hop | **PASSED** | Functional scenario validated and matching expected behavior. |
| ATT-14 | Functional | Link check-in co token trong URL cua `/staff/hr?token=...` | Staff page nhan token va mo dung tab cham cong | **PASSED** | Protected API authorization validated successfully. |
| ATT-15 | Functional | Admin search logs theo ten nhan vien/username/ten ca | Ket qua loc dung tren UI logs | **PASSED** | Functional scenario validated and matching expected behavior. |
| ATT-16 | Data integrity | Salary tinh luc check-out dua tren `plannedHours - lateness`, khong dua theo actualHours thuần | Tong luong khop cong thuc hien tai cua service | **PASSED** | Functional scenario validated and matching expected behavior. |
| ATT-17 | Security | Admin route attendance bi chan khi chua login | Redirect/401 dung mong doi | **PASSED** | Protected API authorization validated successfully. |
