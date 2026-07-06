# HR Management

## Pham vi
- UI:
  - `/staff/hr`
  - `/admin/hr`
  - `/admin/hr/calendar`
- APIs:
  - `GET/POST/PATCH/DELETE /api/hr/shifts`
  - `GET/POST/DELETE /api/hr/availability`
  - `GET /api/hr/my-shifts`
  - `POST /api/hr/shifts/assign`
  - `PATCH /api/hr/shifts/assign/:id/status`
  - `DELETE /api/hr/shifts/assign/:id`
  - `GET/POST /api/hr/requests`
  - `PATCH /api/hr/requests/:id`
  - `GET /api/hr/my-salary`
  - `GET /api/hr/admin/reports/costs`
- Coverage mix: Functional, Validation, Authorization, Business rules, Integration

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| HR-01 | Functional | Admin CRUD shift master data | Tao/sua/xoa soft delete shift thanh cong, list shift cap nhat dung |
| HR-02 | Functional | Staff xem lich da phan va lich ranh cua minh | Data tren tab calendar/availability khop API |
| HR-03 | Functional | Staff dang ky availability hop le | Tao thanh cong va hien trong lich |
| HR-04 | Validation | Staff dang ky availability bi overlap cung ngay | Bi chan voi thong bao trung lap |
| HR-05 | Security | Staff xoa availability cua nguoi khac | Bi chan |
| HR-06 | Functional | Admin xep ca thuong cho staff tai calendar | Tao assignment thanh cong, hien trong o lich dung ngay/nhan vien |
| HR-07 | Validation | Admin xep 2 ca overlap cho cung staff cung ngay | Bi chan |
| HR-08 | Validation | Admin tao flexible shift ngoai khung 06:00-23:00, qua dem, <3h, >16h | Bi chan |
| HR-09 | Functional | Admin doi status assignment | Trang thai assignment duoc cap nhat |
| HR-10 | Functional | Admin xoa assignment | Assignment bien mat khoi lich |
| HR-11 | Functional | Staff tao leave request | Request moi vao trang thai `PENDING` |
| HR-12 | Functional | Staff tao swap request hop le | Request `PENDING`, co target shift va swap user |
| HR-13 | Functional | Admin approve leave request | Request thanh `APPROVED`, staff shift lien quan chuyen `ABSENT`, `total_salary=0` |
| HR-14 | Functional | Admin reject request | Request thanh `REJECTED`, khong thay doi shift/luong |
| HR-15 | Business rule | Approve lai request da xu ly | Bi chan |
| HR-16 | Business rule | Approve swap request khi nhan vien nhan ca bi trung lich | Bi chan |
| HR-17 | Functional | Approve swap request hop le | Shift duoc chuyen sang `swap_with_staff_id` |
| HR-18 | Functional | Staff xem salary summary theo khoang ngay | `completed_shifts`, `absent_shifts`, `total_earned` khop du lieu shift |
| HR-19 | Functional | Admin xem cost report theo khoang ngay | Tong luong va so ca hoan thanh khop du lieu `staff_shifts` |
| HR-20 | Security | Chuc nang admin HR (`assign`, `process request`, `cost report`) khong cho staff goi truc tiep | Backend tra `403` |
| HR-21 | Functional | Admin chuyen tab `requests/users/costs` bang query param `?tab=` | Dung tab duoc mo va load dung du lieu lien quan |
| HR-22 | Functional | Admin search/filter user trong tab `users` | Ket qua loc dung theo username/full name/email/role/status |
| HR-23 | Functional | Danh sach staff tren calendar chi lay user `ACTIVE` va role `STAFF` | Planner khong hien admin/inactive staff |
| HR-24 | Functional | Dieu huong tuan truoc/tuan sau tren calendar | Availability va assignments doi theo khoang ngay moi |
| HR-25 | Functional | Xoa soft-delete shift master data | Shift da xoa khong con trong list chon/phat sinh assignment moi |
| HR-26 | Negative | Sua/xoa shift id khong ton tai | Backend/UI bao loi phu hop |
| HR-27 | Validation | Staff tao swap request ma thieu target shift hoac thieu nguoi nhan doi | UI chan truoc khi gui request |
| HR-28 | Data integrity | Reject request khong thay doi `staff_shifts` hay `total_salary` | Du lieu lich va luong giu nguyen |
| HR-29 | Integration | Sau approve leave, staff salary summary trong ky phan anh 1 ca `ABSENT` | `absent_shifts` tang, tong luong giam dung |
| HR-30 | Integration | Sau approve swap hop le, lich cua 2 staff lien quan cap nhat dung tren calendar/my-shifts | Ca duoc chuyen dung nguoi |
