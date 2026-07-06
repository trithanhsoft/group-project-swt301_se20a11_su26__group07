# Attendance

## Pham vi
- UI:
  - Admin: `/admin/hr/attendance`
  - Staff: tab `Cham cong` trong `/staff/hr`
- APIs:
  - `POST /api/attendance/check-in`
  - `POST /api/attendance/check-out`
  - `GET /api/attendance/today-status`
  - `GET /api/attendance/qr-token`
  - `GET /api/attendance/logs`
- Coverage mix: Functional, Validation, Security, Time-based behavior, Integration

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| ATT-01 | Functional | Admin mo trang attendance va tai QR token hom nay | Token sinh thanh cong, duoc dung de tao link/QR cho staff |
| ATT-02 | Functional | Staff check-in bang token hop le va co ca duoc phan hom nay | Check-in thanh cong, cap nhat `check_in_at`, `lateness_minutes` |
| ATT-03 | Negative | Staff check-in voi token sai/het han | Bi chan voi thong bao QR khong hop le |
| ATT-04 | Negative | Staff check-in khi khong co ca hom nay hoac da check-in roi | Bi chan |
| ATT-05 | Functional | Staff check-out sau khi da check-in | Cap nhat `check_out_at`, `actual_hours`, `total_salary`, `status='COMPLETED'` |
| ATT-06 | Negative | Staff check-out khi chua co check-in hop le | Bi chan |
| ATT-07 | Boundary | Check-in som hon gio bat dau | `lateness_minutes = 0` |
| ATT-08 | Boundary | Check-in tre | `lateness_minutes` duoc tinh dung, salary khi check-out bi tru theo lateness |
| ATT-09 | Functional | Admin xem logs theo khoang ngay | Log hien ten nhan vien, ca lam, planned start/end, salary, status dung |
| ATT-10 | Functional | Staff xem `today-status` tren tab attendance | Trang thai hom nay khop du lieu check-in/check-out thuc te |
| ATT-11 | Security | Staff khong lay duoc admin logs/qr-token qua API neu route sai role | Backend chan dung role |
| ATT-12 | Functional | Trong cung 1 ngay, admin refresh QR token nhieu lan | Token cua ngay hom do giu on dinh, staff scan van dung |
| ATT-13 | Empty state | Staff hom nay khong co ca duoc xep | `today-status` tra `null` hoac UI hien thong bao phu hop |
| ATT-14 | Functional | Link check-in co token trong URL cua `/staff/hr?token=...` | Staff page nhan token va mo dung tab cham cong |
| ATT-15 | Functional | Admin search logs theo ten nhan vien/username/ten ca | Ket qua loc dung tren UI logs |
| ATT-16 | Data integrity | Salary tinh luc check-out dua tren `plannedHours - lateness`, khong dua theo actualHours thuần | Tong luong khop cong thuc hien tai cua service |
| ATT-17 | Security | Admin route attendance bi chan khi chua login | Redirect/401 dung mong doi |
