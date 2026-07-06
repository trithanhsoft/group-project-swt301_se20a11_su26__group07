# Product Management

## Pham vi
- UI: `/admin/products?tab=products`
- APIs: `GET/POST /api/products`, `GET/PATCH/DELETE /api/products/:id`, `GET /api/products/pos/available`
- Coverage mix: Functional, Validation, Integration, Security

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| PROD-01 | Functional | Mo danh sach san pham | Load danh sach, hien status, tag, gia va `hasRecipe` |
| PROD-02 | Functional | Search theo ten san pham | Ket qua loc dung |
| PROD-03 | Functional | Filter theo status va tag | Ket qua loc dung, combo filter khong xung dot |
| PROD-04 | Functional | Tao san pham hop le voi tag, price, status | Tao thanh cong va hien tren list |
| PROD-05 | Validation | Ten rong, gia `<= 0`, status khong hop le, tag qua dai | Bi chan boi UI/backend |
| PROD-06 | Validation | Tao/sua trung ten san pham | Backend tra `Product name already exists.` |
| PROD-07 | Functional | Sua ten/tag/gia/status cua san pham | Update thanh cong, list cap nhat |
| PROD-08 | Functional | Xoa mem san pham | San pham bien mat khoi list thong thuong |
| PROD-09 | Integration | San pham co recipe hien badge `Da thiet lap`, san pham chua co recipe hien `Chua thiet lap` | `hasRecipe` khop voi du lieu recipe thuc te |
| PROD-10 | Integration | `GET /products/pos/available` | Chi tra san pham `ACTIVE`, khong bi xoa mem, co recipe co item |
| PROD-11 | Security | Staff/unauth truy cap endpoint tao-sua-xoa san pham | Bi chan boi backend |
| PROD-12 | Regression | Xoa recipe cua san pham dang `ACTIVE` | `hasRecipe` ve false va san pham khong con trong POS available list |
| PROD-13 | Functional | Mo form edit san pham ton tai | Form load dung name, tag, price, status, `hasRecipe` |
| PROD-14 | Functional | Tao san pham o trang thai `INACTIVE` | San pham van tao duoc cho admin management nhung khong vao POS available list |
| PROD-15 | Functional | Search khong co ket qua | UI hien empty state, khong crash |
| PROD-16 | Functional | Tag filter van giu duoc tag dang chon khi danh sach tag thay doi | Select khong bi reset sai gia tri |
| PROD-17 | Business rule | San pham chua co recipe van duoc tao/sua/xoa trong admin | Admin flow hoat dong binh thuong, chi POS moi bi anh huong |
| PROD-18 | Security | Goi `GET /api/products/:id` voi id da soft delete | Backend tra `404 Product not found.` |
| PROD-19 | Data integrity | Sau khi soft delete product, order cu da ban truoc do van giu snapshot item | Lich su don cu khong bi vo |
| PROD-20 | Functional | Danh sach POS available sap xep theo ten tang dan | Thu tu danh sach khop query hien tai |
