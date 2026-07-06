# Reports

## Pham vi
- UI: `/admin/reports`
- APIs:
  - `GET /api/reports/revenue`
  - `GET /api/reports/best-selling-products`
  - `GET /api/reports/low-stock-ingredients`
  - `GET /api/reports/discards`
- Coverage mix: Functional, Read-only data, Security, Integration

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| RPT-01 | Functional | Admin mo report page | 4 nhom du lieu load duoc: revenue, best seller, low stock, discards |
| RPT-02 | Functional | Revenue report voi date range | So dong va tong so khop `v_daily_revenue` |
| RPT-03 | Functional | Best-selling report | Sap xep giam dan theo `quantitySold`, tie-break theo `totalRevenue` |
| RPT-04 | Functional | Low-stock report | Chi hien nguyen lieu dang duoi nguong, sap xep muc do thieu dung |
| RPT-05 | Functional | Discard report | Hien dung cac stock transaction co note bat dau bang `[HUY HANG]` |
| RPT-06 | Integration | Sau 1 order POS thanh cong, refresh report | Revenue, best-selling va dashboard lien quan cap nhat dung |
| RPT-07 | Integration | Sau 1 phieu discard, refresh report | Discard report tang them dong moi |
| RPT-08 | Empty state | Khi chua co du lieu order/discard/low stock | UI hien empty state thay vi crash |
| RPT-09 | Security | Staff mo report page hoac goi report API | Bi chan boi route guard/backend |
| RPT-10 | Regression | Tong doanh thu card bang tong cac dong revenue table | So lieu UI nhat quan noi bo |
| RPT-11 | Functional | Nut `Tai lai` tren report page | Goi lai du lieu thanh cong, khong nhan doi dong |
| RPT-12 | API-level | Goi revenue report voi `dateFrom/dateTo` | Backend loc dung theo khoang ngay |
| RPT-13 | API-level | Goi best-selling report voi `limit` hop le | Backend chi tra toi da so dong duoc yeu cau |
| RPT-14 | Data integrity | Best-selling report chi tinh don `SUCCESS`, khong tinh don rollback/failed | So lieu xep hang dung |
| RPT-15 | Boundary | Nguyen lieu co `currentStock == lowStockThreshold` | Van xuat hien trong low-stock report/view |
| RPT-16 | Functional | Discard report sap xep moi nhat truoc | Thu tu dong dung theo `createdAt desc` |
| RPT-17 | UX | Ghi chu discard tren UI da bo prefix ky thuat `[HUY HANG]` | Noi dung hien thi de doc cho tester/nguoi dung |
