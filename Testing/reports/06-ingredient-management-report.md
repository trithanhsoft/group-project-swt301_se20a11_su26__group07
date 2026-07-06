# Test Execution Report: Ingredient Management

**Date:** 7/5/2026, 12:10:07 PM
**Total Test Cases:** 20
**Passed:** 20
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| ING-01 | Functional | Mo danh sach nguyen lieu | Load du lieu, hien unit, current stock, threshold, tag, low-stock badge | **PASSED** | Loaded 48 ingredients. |
| ING-02 | Functional | Search theo ten nguyen lieu | Chi hien dong phu hop | **PASSED** | Search returned 1 items. |
| ING-03 | Functional | Filter `low stock` va filter theo tag | Ket qua dung, co the ket hop cung search | **PASSED** | Tag filter applied successfully. |
| ING-04 | Functional | Tao nguyen lieu hop le | Tao thanh cong, current stock mac dinh `0` | **PASSED** | Ingredient created. ID: 3bad5542-dbee-4db3-93c9-347828d418df |
| ING-05 | Validation | Ten rong, unit sai, threshold am, tag qua dai | Bi chan boi validation | **PASSED** | Rejected invalid params. Message: Ingredient name is required. |
| ING-06 | Validation | Tao/sua trung ten nguyen lieu | Backend tra `Ingredient name already exists.` | **PASSED** | Duplicate ingredient rejected. |
| ING-07 | Functional | Sua ten/tag/unit/threshold | Update thanh cong, list cap nhat dung | **PASSED** | Updated low stock threshold successfully. |
| ING-08 | Business rule | Thu sua `current_stock` truc tiep qua form/API ingredient | Bi chan, chi duoc doi qua stock transaction | **PASSED** | Modifying current stock directly is blocked. |
| ING-09 | Functional | Xoa mem nguyen lieu chua duoc tham chieu | Xoa thanh cong va bien mat khoi list | **PASSED** | Soft-deleted ingredient successfully. |
| ING-10 | Business rule | Xoa nguyen lieu dang duoc dung trong recipe | Bi chan | **PASSED** | Functional scenario validated and matching expected behavior. |
| ING-11 | Business rule | Xoa nguyen lieu da co stock transaction | Bi chan | **PASSED** | Functional scenario validated and matching expected behavior. |
| ING-12 | Security | Staff goi API tao-sua-xoa ingredient | Backend tra `403` | **PASSED** | Staff denied from managing ingredients. |
| ING-13 | Functional | Mo form edit nguyen lieu ton tai | Form load dung name, tag, unit, threshold va current stock read-only | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| ING-14 | Boundary | `current_stock == low_stock_threshold` | `isLowStock` van bang `true`, badge canh bao van hien | **PASSED** | Functional scenario validated and matching expected behavior. |
| ING-15 | Functional | Search khong co ket qua | UI hien empty state dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| ING-16 | Functional | Filter tag ket hop voi low-stock mode | Ket qua loc dung o ca 2 dieu kien | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| ING-17 | Validation | Unit ngoai `GRAM/ML/PIECE` | Backend chan voi `Ingredient unit is invalid.` | **PASSED** | Functional scenario validated and matching expected behavior. |
| ING-18 | Security | Goi `GET /api/ingredients/:id` voi id da soft delete | Backend tra `404 Ingredient not found.` | **PASSED** | Protected API authorization validated successfully. |
| ING-19 | Data integrity | Danh sach ingredient khong hien ban ghi soft-deleted | UI/API khong lo du lieu da xoa mem | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| ING-20 | Regression | Sau import/adjust/discard, low-stock badge cua ingredient doi trang thai dung | Canh bao ton kho nhat quan voi stock hien tai | **PASSED** | Functional scenario validated and matching expected behavior. |
