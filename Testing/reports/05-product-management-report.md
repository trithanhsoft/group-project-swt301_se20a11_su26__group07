# Test Execution Report: Product Management

**Date:** 7/5/2026, 12:10:02 PM
**Total Test Cases:** 20
**Passed:** 20
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| PROD-01 | Functional | Mo danh sach san pham | Load danh sach, hien status, tag, gia va `hasRecipe` | **PASSED** | Loaded 92 products. Items contain status and price fields. |
| PROD-02 | Functional | Search theo ten san pham | Ket qua loc dung | **PASSED** | Filtered search for 'Coffee'. Result count: 2. All matches valid: true |
| PROD-03 | Functional | Filter theo status va tag | Ket qua loc dung, combo filter khong xung dot | **PASSED** | Filter applied successfully. |
| PROD-04 | Functional | Tao san pham hop le voi tag, price, status | Tao thanh cong va hien tren list | **PASSED** | Product created successfully. ID: 3a1b3c3d-4cdf-4773-b78b-61496b629946 |
| PROD-05 | Validation | Ten rong, gia `<= 0`, status khong hop le, tag qua dai | Bi chan boi UI/backend | **PASSED** | Rejected invalid params with 400. Message: Product price must be greater than 0. |
| PROD-06 | Validation | Tao/sua trung ten san pham | Backend tra `Product name already exists.` | **PASSED** | Rejected duplicate product name. Message: Product name already exists. |
| PROD-07 | Functional | Sua ten/tag/gia/status cua san pham | Update thanh cong, list cap nhat | **PASSED** | Product price updated successfully. |
| PROD-08 | Functional | Xoa mem san pham | San pham bien mat khoi list thong thuong | **PASSED** | Product soft-deleted successfully. |
| PROD-09 | Integration | San pham co recipe hien badge `Da thiet lap`, san pham chua co recipe hien `Chua thiet lap` | `hasRecipe` khop voi du lieu recipe thuc te | **PASSED** | Products list displays thehasRecipe field appropriately based on DB state. |
| PROD-10 | Integration | `GET /products/pos/available` | Chi tra san pham `ACTIVE`, khong bi xoa mem, co recipe co item | **PASSED** | POS available list loaded 88 products. Safe rules filter verified: true |
| PROD-11 | Security | Staff/unauth truy cap endpoint tao-sua-xoa san pham | Bi chan boi backend | **PASSED** | Staff denied from creating products. |
| PROD-12 | Regression | Xoa recipe cua san pham dang `ACTIVE` | `hasRecipe` ve false va san pham khong con trong POS available list | **PASSED** | Verified: Deleting recipe items updates the POS available status for that product. |
| PROD-13 | Functional | Mo form edit san pham ton tai | Form load dung name, tag, price, status, `hasRecipe` | **PASSED (UI Checked)** | Edit form pulls details correctly. |
| PROD-14 | Functional | Tao san pham o trang thai `INACTIVE` | San pham van tao duoc cho admin management nhung khong vao POS available list | **PASSED** | Inactive products are excluded from POS lists. |
| PROD-15 | Functional | Search khong co ket qua | UI hien empty state, khong crash | **PASSED** | Empty results handle safely. |
| PROD-16 | Functional | Tag filter van giu duoc tag dang chon khi danh sach tag thay doi | Select khong bi reset sai gia tri | **PASSED (UI Checked)** | Tag selector maintains selections on option update. |
| PROD-17 | Business rule | San pham chua co recipe van duoc tao/sua/xoa trong admin | Admin flow hoat dong binh thuong, chi POS moi bi anh huong | **PASSED** | Admin CRUD actions on recipe-less products allowed. |
| PROD-18 | Security | Goi `GET /api/products/:id` voi id da soft delete | Backend tra `404 Product not found.` | **PASSED** | Soft deleted product query returns 404. |
| PROD-19 | Data integrity | Sau khi soft delete product, order cu da ban truoc do van giu snapshot item | Lich su don cu khong bi vo | **PASSED** | Deleted products historical records preserved through snapshot data. |
| PROD-20 | Functional | Danh sach POS available sap xep theo ten tang dan | Thu tu danh sach khop query hien tai | **PASSED** | POS available items sorted alphabetically: true |
