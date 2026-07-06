# Overview And Coverage

## Muc tieu
- Cover day du cac chuc nang thuc te cua he thong POS, Inventory, KDS, HR va Attendance.
- Giu testcase gon, de phan cong, de chay manual, nhung van du loai test cho mon SWT.
- Bám theo code hien tai, bao gom ca cac phan scope mo rong nhu `discard`, `forecast`, `KDS`, `HR`, `attendance`, `cash payment`.

## Quy mo bo testcase
- Bo tai lieu hien co hon 300 testcase/scenario.
- Case duoc chia thanh 3 lop:
  - Feature-local: CRUD, validation, empty/error state, role access.
  - Business/integration: tac dong qua lai giua Product, Recipe, Stock, POS, KDS, Reports, HR, Attendance.
  - Regression/reliability: rollback, snapshot data, concurrency, soft delete, session invalidation.

## Feature Map
- Xac thuc, session va route/API access control
- Dashboard quan tri
- User management noi bo
- Profile tu cap nhat
- Product management
- Ingredient management
- Stock management
- Recipe management
- POS ordering
- Order history va order detail
- KDS
- Reports
- HR management
- Attendance
- Edge cases and UI Resilience

## Loai testing can co
- Functional: luong chinh, CRUD, navigation, API success.
- Validation/Boundary: field rong, gia tri `0`, am, trung lap, gioi han do dai, stock vua du/thieu 1 don vi.
- Security/Authorization: chua login, sai role, staff truy cap admin API/page, token het hieu luc.
- Integration/Data integrity: Product -> Recipe -> Stock -> POS -> Order -> KDS -> Reports; HR Shift -> Attendance -> Salary -> Cost.
- Reliability/Regression: rollback transaction, khong tao partial data, re-test sau khi sua loi module lien quan.
- UI/Usability: thong bao loi ro rang, bang du lieu/tabs/filter hoat dong dung, trang thai loading-empty-error.

## Test Data Nen co
- 1 `ADMIN` active, 1 `STAFF` active, 1 user `INACTIVE`.
- Product:
  - 1 san pham `ACTIVE` co recipe.
  - 1 san pham `ACTIVE` chua co recipe.
  - 1 san pham `INACTIVE`.
- Ingredient:
  - 1 nguyen lieu ton du.
  - 1 nguyen lieu ton vua du cho boundary.
  - 1 nguyen lieu low stock.
- Recipe:
  - 1 cong thuc hop le.
  - 1 san pham chua co recipe.
- Stock:
  - Du lieu import, daily count, adjust, discard.
- Order:
  - 1 order thanh cong de kiem tra history/report/KDS.
- HR:
  - Shift mau, availability, assigned shift, pending leave request, pending swap request.

## Luong uu tien cao de regression
1. Login -> role redirect -> protected route/API.
2. Product -> Recipe -> POS available list.
3. Ingredient -> Stock import/count/discard -> transaction history -> forecast.
4. POS checkout success -> stock deduct -> order history -> KDS -> dashboard -> reports.
5. POS checkout fail -> khong tao order, khong tru kho, khong sinh transaction.
6. HR assign shift -> attendance check-in/check-out -> salary -> HR cost report.
