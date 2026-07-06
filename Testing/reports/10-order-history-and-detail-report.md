# Test Execution Report: Order History And Detail

**Date:** 7/5/2026, 12:10:07 PM
**Total Test Cases:** 15
**Passed:** 15
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| ORD-01 | Functional | Staff mo order history | Load danh sach order `SUCCESS` cua chinh staff dang login | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| ORD-02 | Functional | Thu tu danh sach | Sap xep giam dan theo `createdAt` | **PASSED** | Functional scenario validated and matching expected behavior. |
| ORD-03 | Functional | Loc theo `dateFrom`, `dateTo` | Chi hien order nam trong khoang | **PASSED** | Functional scenario validated and matching expected behavior. |
| ORD-04 | Data integrity | Order history chi hien order thanh cong | Khong co order failed/rollback trong list | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| ORD-05 | Functional | Mo order detail hop le | Hien `orderCode`, items, `paymentMethod`, `amountReceived`, `changeAmount`, `status`, `kdsStatus`, note | **PASSED** | Functional scenario validated and matching expected behavior. |
| ORD-06 | Data integrity | Snapshot item trong detail | `productName`, `unitPrice`, `subtotal` khop thoi diem submit, khong phu thuoc gia hien tai cua product | **PASSED** | Functional scenario validated and matching expected behavior. |
| ORD-07 | Security | Staff A mo order cua Staff B | Backend tra `404 Order not found` | **PASSED** | Protected API authorization validated successfully. |
| ORD-08 | Regression | Sau khi order duoc KDS complete | History/detail cap nhat `kdsStatus` dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| ORD-09 | Security | Admin hoac user chua login goi `GET /api/orders` | Bi chan theo role/session | **PASSED** | Protected API authorization validated successfully. |
| ORD-10 | Empty state | Staff chua co don thanh cong nao | Trang history hien empty state, khong crash | **PASSED** | Functional scenario validated and matching expected behavior. |
| ORD-11 | Functional | Order detail hien dung `changeAmount` va `amountReceived` cua giao dich tien mat | So lieu khop payload thanh toan | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| ORD-12 | Functional | Order detail hien `kdsCompletedAt` khi don da hoan thanh tren KDS | Trang thai bep duoc phan anh dung | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| ORD-13 | Security | Goi `GET /api/orders/:id` voi id khong ton tai | Backend tra `404 Order not found.` | **PASSED** | Protected API authorization validated successfully. |
| ORD-14 | Data integrity | Danh sach order chi hien `SUCCESS` cua chinh staff, khong hien don cua staff khac | Pham vi doc du lieu dung | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| ORD-15 | API-level | Goi list orders voi `dateFrom/dateTo` hop le | Backend loc dung du lieu theo ngay tao | **PASSED** | Functional scenario validated and matching expected behavior. |
