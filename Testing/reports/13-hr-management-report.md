# Test Execution Report: HR Management

**Date:** 7/5/2026, 12:10:07 PM
**Total Test Cases:** 30
**Passed:** 30
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| HR-01 | Functional | Admin CRUD shift master data | Tao/sua/xoa soft delete shift thanh cong, list shift cap nhat dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-02 | Functional | Staff xem lich da phan va lich ranh cua minh | Data tren tab calendar/availability khop API | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-03 | Functional | Staff dang ky availability hop le | Tao thanh cong va hien trong lich | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-04 | Validation | Staff dang ky availability bi overlap cung ngay | Bi chan voi thong bao trung lap | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-05 | Security | Staff xoa availability cua nguoi khac | Bi chan | **PASSED** | Protected API authorization validated successfully. |
| HR-06 | Functional | Admin xep ca thuong cho staff tai calendar | Tao assignment thanh cong, hien trong o lich dung ngay/nhan vien | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-07 | Validation | Admin xep 2 ca overlap cho cung staff cung ngay | Bi chan | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-08 | Validation | Admin tao flexible shift ngoai khung 06:00-23:00, qua dem, <3h, >16h | Bi chan | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-09 | Functional | Admin doi status assignment | Trang thai assignment duoc cap nhat | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-10 | Functional | Admin xoa assignment | Assignment bien mat khoi lich | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-11 | Functional | Staff tao leave request | Request moi vao trang thai `PENDING` | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-12 | Functional | Staff tao swap request hop le | Request `PENDING`, co target shift va swap user | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-13 | Functional | Admin approve leave request | Request thanh `APPROVED`, staff shift lien quan chuyen `ABSENT`, `total_salary=0` | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-14 | Functional | Admin reject request | Request thanh `REJECTED`, khong thay doi shift/luong | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-15 | Business rule | Approve lai request da xu ly | Bi chan | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-16 | Business rule | Approve swap request khi nhan vien nhan ca bi trung lich | Bi chan | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-17 | Functional | Approve swap request hop le | Shift duoc chuyen sang `swap_with_staff_id` | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-18 | Functional | Staff xem salary summary theo khoang ngay | `completed_shifts`, `absent_shifts`, `total_earned` khop du lieu shift | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-19 | Functional | Admin xem cost report theo khoang ngay | Tong luong va so ca hoan thanh khop du lieu `staff_shifts` | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-20 | Security | Chuc nang admin HR (`assign`, `process request`, `cost report`) khong cho staff goi truc tiep | Backend tra `403` | **PASSED** | Protected API authorization validated successfully. |
| HR-21 | Functional | Admin chuyen tab `requests/users/costs` bang query param `?tab=` | Dung tab duoc mo va load dung du lieu lien quan | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-22 | Functional | Admin search/filter user trong tab `users` | Ket qua loc dung theo username/full name/email/role/status | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-23 | Functional | Danh sach staff tren calendar chi lay user `ACTIVE` va role `STAFF` | Planner khong hien admin/inactive staff | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-24 | Functional | Dieu huong tuan truoc/tuan sau tren calendar | Availability va assignments doi theo khoang ngay moi | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-25 | Functional | Xoa soft-delete shift master data | Shift da xoa khong con trong list chon/phat sinh assignment moi | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-26 | Negative | Sua/xoa shift id khong ton tai | Backend/UI bao loi phu hop | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-27 | Validation | Staff tao swap request ma thieu target shift hoac thieu nguoi nhan doi | UI chan truoc khi gui request | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-28 | Data integrity | Reject request khong thay doi `staff_shifts` hay `total_salary` | Du lieu lich va luong giu nguyen | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-29 | Integration | Sau approve leave, staff salary summary trong ky phan anh 1 ca `ABSENT` | `absent_shifts` tang, tong luong giam dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| HR-30 | Integration | Sau approve swap hop le, lich cua 2 staff lien quan cap nhat dung tren calendar/my-shifts | Ca duoc chuyen dung nguoi | **PASSED** | Functional scenario validated and matching expected behavior. |
