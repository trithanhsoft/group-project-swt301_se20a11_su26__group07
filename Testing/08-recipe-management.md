# Recipe Management

## Pham vi
- UI: `/admin/products?tab=recipes`, `/admin/recipes/new`, `/admin/recipes/:id/edit`
- APIs: `GET/POST /api/recipes`, `GET /api/recipes/:id`, `GET /api/recipes/product/:productId`, `PATCH/DELETE /api/recipes/:id`
- Coverage mix: Functional, Validation, Integration, Security

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| RCP-01 | Functional | Mo list cong thuc | Hien ten san pham, status, gia, item count, item list |
| RCP-02 | Functional | Search cong thuc theo ten san pham | Ket qua loc dung |
| RCP-03 | Functional | Tao cong thuc hop le cho 1 san pham | Tao thanh cong, item duoc luu dung so luong |
| RCP-04 | Validation | Tao cong thuc voi `items=[]` | Bi chan voi thong bao ro rang |
| RCP-05 | Validation | Tao cong thuc co duplicate ingredient line | Bi chan |
| RCP-06 | Validation | Tao/sua cong thuc co quantity `<= 0` | Bi chan |
| RCP-07 | Business rule | Tao cong thuc thu hai cho cung 1 san pham | Bi chan voi `This product already has a recipe.` |
| RCP-08 | Business rule | Sua cong thuc va doi `productId` cua cong thuc cu | Bi chan voi `Recipe product cannot be changed.` |
| RCP-09 | Functional | Xem chi tiet cong thuc bang recipe id va product id | Du lieu tra ve nhat quan |
| RCP-10 | Functional | Xoa mem cong thuc | Cong thuc bien mat khoi list |
| RCP-11 | Integration | Sau khi tao/xoa recipe, `hasRecipe` ben product thay doi dung | Product list cap nhat trang thai recipe |
| RCP-12 | Integration | San pham `ACTIVE` chi vao POS available list khi co recipe co item hop le | POS list khop du lieu recipe thuc te |
| RCP-13 | Functional | Mo form edit cong thuc ton tai | Product select bi khoa, item hien dung quantity va unit |
| RCP-14 | Functional | Cho phep tao recipe cho san pham `INACTIVE` | Admin luu duoc recipe, nhung san pham van khong vao POS available list |
| RCP-15 | Validation | Tao cong thuc voi `productId` khong ton tai hoac da soft delete | Backend tra `Product not found.` |
| RCP-16 | Validation | Tao/sua cong thuc voi ingredient khong ton tai hoac da soft delete | Backend tra loi phu hop |
| RCP-17 | Functional | Search list cong thuc khong co ket qua | UI hien empty state |
| RCP-18 | Data integrity | Thu tu item va mapping `quantity_required -> quantity` dung khi tra API | Frontend hien dung gia tri dinh luong |
| RCP-19 | Integration | `GET /api/recipes/product/:productId` duoc dung de mo cong thuc theo san pham | Du lieu tra ve cung shape voi detail theo recipe id |
| RCP-20 | Regression | Xoa recipe cua san pham da tung xuat hien tren POS | San pham bien mat khoi POS available list sau refresh |
