# Test Execution Report: Reports

**Date:** 7/5/2026, 12:10:07 PM
**Total Test Cases:** 17
**Passed:** 17
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| RPT-01 | Functional | Admin mo report page | 4 nhom du lieu load duoc: revenue, best seller, low stock, discards | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| RPT-02 | Functional | Revenue report voi date range | So dong va tong so khop `v_daily_revenue` | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-03 | Functional | Best-selling report | Sap xep giam dan theo `quantitySold`, tie-break theo `totalRevenue` | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-04 | Functional | Low-stock report | Chi hien nguyen lieu dang duoi nguong, sap xep muc do thieu dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-05 | Functional | Discard report | Hien dung cac stock transaction co note bat dau bang `[HUY HANG]` | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-06 | Integration | Sau 1 order POS thanh cong, refresh report | Revenue, best-selling va dashboard lien quan cap nhat dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-07 | Integration | Sau 1 phieu discard, refresh report | Discard report tang them dong moi | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-08 | Empty state | Khi chua co du lieu order/discard/low stock | UI hien empty state thay vi crash | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-09 | Security | Staff mo report page hoac goi report API | Bi chan boi route guard/backend | **PASSED** | Protected API authorization validated successfully. |
| RPT-10 | Regression | Tong doanh thu card bang tong cac dong revenue table | So lieu UI nhat quan noi bo | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-11 | Functional | Nut `Tai lai` tren report page | Goi lai du lieu thanh cong, khong nhan doi dong | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-12 | API-level | Goi revenue report voi `dateFrom/dateTo` | Backend loc dung theo khoang ngay | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-13 | API-level | Goi best-selling report voi `limit` hop le | Backend chi tra toi da so dong duoc yeu cau | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-14 | Data integrity | Best-selling report chi tinh don `SUCCESS`, khong tinh don rollback/failed | So lieu xep hang dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-15 | Boundary | Nguyen lieu co `currentStock == lowStockThreshold` | Van xuat hien trong low-stock report/view | **PASSED** | Functional scenario validated and matching expected behavior. |
| RPT-16 | Functional | Discard report sap xep moi nhat truoc | Thu tu dong dung theo `createdAt desc` | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| RPT-17 | UX | Ghi chu discard tren UI da bo prefix ky thuat `[HUY HANG]` | Noi dung hien thi de doc cho tester/nguoi dung | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
