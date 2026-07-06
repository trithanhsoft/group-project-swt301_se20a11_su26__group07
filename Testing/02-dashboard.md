# Dashboard

## Pham vi
- Route: `/admin/dashboard`
- API: `GET /api/dashboard/summary`
- Coverage mix: Functional, Read-only data, Security, Integration

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| DASH-01 | Functional | Admin mo dashboard sau khi login | Trang tai thanh cong, khong vo layout |
| DASH-02 | Functional | Count `products`, `ingredients`, `orders`, `lowStockIngredients`, `pendingRequests` | So lieu khop voi DB/view hien tai |
| DASH-03 | Functional | Muc `today.revenue` va `today.orders` khi co order thanh cong trong ngay | Gia tri bang tong doanh thu va so order `SUCCESS` trong ngay |
| DASH-04 | Integration | `recentOrders` hien 5 don moi nhat | Thu tu giam dan theo `created_at`, chi lay order `SUCCESS` |
| DASH-05 | Integration | `lowStockList` hien toi da 5 nguyen lieu canh bao | Danh sach khop `v_low_stock_ingredients` |
| DASH-06 | Functional | `weeklyRevenue` hien toi da 7 ngay | Thu tu tang dan theo ngay khi render chart/list |
| DASH-07 | Security | Staff hoac user chua login goi `/api/dashboard/summary` | Bi chan boi `requireAuth` |
| DASH-08 | Regression | Sau khi tao order thanh cong hoac duyet request HR, refresh dashboard | So dem va tile lien quan cap nhat dung |
| DASH-09 | Empty state | He thong chua co order/nguyen lieu low stock/request pending | Dashboard van load duoc voi gia tri `0` va danh sach rong |
| DASH-10 | Data integrity | Count `products` va `ingredients` khong tinh ban ghi soft-deleted | So dem khop du lieu con hieu luc |
| DASH-11 | Data integrity | Count `pendingRequests` chi tinh request `PENDING` | Request `APPROVED/REJECTED` khong bi dem nham |
| DASH-12 | Integration | Sau khi them 1 order moi, `recentOrders` dua order do len tren cung | Order moi nhat xuat hien dau danh sach |
| DASH-13 | Integration | `lowStockIngredients` bang so dong thuc te cua `v_low_stock_ingredients` | So count va low stock list nhat quan |
| DASH-14 | Functional | Refresh dashboard nhieu lan lien tiep | Khong bi trung du lieu, khong crash, so lieu on dinh |
| DASH-15 | Security/UI | Staff bi chan o route admin dashboard | Khong nhin thay dashboard UI du backend summary la protected-only by auth |
