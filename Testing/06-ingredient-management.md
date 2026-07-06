# Ingredient Management

## Pham vi
- UI: `/admin/ingredients`
- APIs: `GET/POST /api/ingredients`, `GET/PATCH/DELETE /api/ingredients/:id`
- Coverage mix: Functional, Validation, Data integrity, Security

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| ING-01 | Functional | Mo danh sach nguyen lieu | Load du lieu, hien unit, current stock, threshold, tag, low-stock badge |
| ING-02 | Functional | Search theo ten nguyen lieu | Chi hien dong phu hop |
| ING-03 | Functional | Filter `low stock` va filter theo tag | Ket qua dung, co the ket hop cung search |
| ING-04 | Functional | Tao nguyen lieu hop le | Tao thanh cong, current stock mac dinh `0` |
| ING-05 | Validation | Ten rong, unit sai, threshold am, tag qua dai | Bi chan boi validation |
| ING-06 | Validation | Tao/sua trung ten nguyen lieu | Backend tra `Ingredient name already exists.` |
| ING-07 | Functional | Sua ten/tag/unit/threshold | Update thanh cong, list cap nhat dung |
| ING-08 | Business rule | Thu sua `current_stock` truc tiep qua form/API ingredient | Bi chan, chi duoc doi qua stock transaction |
| ING-09 | Functional | Xoa mem nguyen lieu chua duoc tham chieu | Xoa thanh cong va bien mat khoi list |
| ING-10 | Business rule | Xoa nguyen lieu dang duoc dung trong recipe | Bi chan |
| ING-11 | Business rule | Xoa nguyen lieu da co stock transaction | Bi chan |
| ING-12 | Security | Staff goi API tao-sua-xoa ingredient | Backend tra `403` |
| ING-13 | Functional | Mo form edit nguyen lieu ton tai | Form load dung name, tag, unit, threshold va current stock read-only |
| ING-14 | Boundary | `current_stock == low_stock_threshold` | `isLowStock` van bang `true`, badge canh bao van hien |
| ING-15 | Functional | Search khong co ket qua | UI hien empty state dung |
| ING-16 | Functional | Filter tag ket hop voi low-stock mode | Ket qua loc dung o ca 2 dieu kien |
| ING-17 | Validation | Unit ngoai `GRAM/ML/PIECE` | Backend chan voi `Ingredient unit is invalid.` |
| ING-18 | Security | Goi `GET /api/ingredients/:id` voi id da soft delete | Backend tra `404 Ingredient not found.` |
| ING-19 | Data integrity | Danh sach ingredient khong hien ban ghi soft-deleted | UI/API khong lo du lieu da xoa mem |
| ING-20 | Regression | Sau import/adjust/discard, low-stock badge cua ingredient doi trang thai dung | Canh bao ton kho nhat quan voi stock hien tai |
