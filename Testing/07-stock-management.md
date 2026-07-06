# Stock Management

## Pham vi
- UI: `/admin/stock`, `/staff/stock`
- APIs:
  - `POST /api/stock/import`
  - `POST /api/stock/import/batch`
  - `POST /api/stock/adjust`
  - `POST /api/stock/count/daily`
  - `POST /api/stock/discard`
  - `GET /api/stock/transactions`
  - `GET /api/stock/forecast`
- Coverage mix: Functional, Boundary, Integration, Security, Reliability

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| STOCK-01 | Functional | Import 1 nguyen lieu hop le | Stock tang dung, tao 1 transaction `IMPORT` |
| STOCK-02 | Validation | Import quantity `<= 0` hoac ingredientId rong | Bi chan, stock khong doi |
| STOCK-03 | Functional | Batch import nhieu dong hop le | Tat ca dong duoc xu ly trong 1 session, co `sessionCode` va transaction tung dong |
| STOCK-04 | Validation | Batch import co dong trung ingredient | Bi chan toan bo payload |
| STOCK-05 | Functional | Daily count voi `actualStock` khac ton ly thuyet | Update stock, tao transaction `ADJUST`, danh dau `changed=true` |
| STOCK-06 | Boundary | Daily count voi `actualStock` bang ton ly thuyet | Khong tao transaction moi, `unchangedCount` tang |
| STOCK-07 | Functional | Manual adjust giam stock hop le | Stock giam dung, co transaction `ADJUST` |
| STOCK-08 | Boundary | Adjust vuot qua ton kho hien tai | Bao `Insufficient stock`, rollback khong doi stock |
| STOCK-09 | Functional | Xem transaction history va loc theo ingredient/type/date | Ket qua loc dung, thu tu moi nhat truoc |
| STOCK-10 | Functional | Forecast admin | Hien `average_daily_usage`, `days_remaining`, `suggested_reorder` dung cong thuc hien tai |
| STOCK-11 | Security | Staff vao tab `forecast` hoac `transactions` | UI tu dua ve tab `adjust`; backend forecast/transactions cua admin van duoc chan |
| STOCK-12 | Functional | Discard nguyen lieu thuan | Stock giam, note co prefix `[HUY HANG]`, transaction vao history/report |
| STOCK-13 | Functional | Discard theo san pham co recipe | He thong tru tat ca ingredient theo recipe x quantity san pham |
| STOCK-14 | Business rule | Discard san pham chua co recipe hoac recipe rong | Bi chan voi thong bao ro rang |
| STOCK-15 | Reliability | Loi xay ra giua qua trinh discard san pham nhieu ingredient | Rollback toan bo, khong tru mot phan kho |
| STOCK-16 | Regression | Sau import/count/discard, ingredient list, transaction history va report lien quan cap nhat dung | Du lieu giua cac module nhat quan |
| STOCK-17 | Functional | Staff mo `/staff/stock` va thuc hien import/adjust/count/discard duoc cap quyen | Cac action write duoc backend chap nhan theo role hien tai |
| STOCK-18 | Security | Staff co gang truy cap tab `forecast`/`transactions` bang query param | UI dua ve `adjust`, khong lo report admin-only |
| STOCK-19 | Functional | Download file mau Excel cho import va daily count | Mau file tai duoc, dung mode dang chon |
| STOCK-20 | Validation | Nap file Excel sai format hoac cot thieu | UI bao loi parse/import, khong ghi DB |
| STOCK-21 | Validation | `countDate` sai dinh dang `YYYY-MM-DD` khi goi API daily count | Backend chan |
| STOCK-22 | Functional | Daily count tra ve `changedCount` va `unchangedCount` dung voi so dong thay doi thuc te | So lieu summary hop ly |
| STOCK-23 | Functional | Transaction history hien dung `context`, `sessionCode`, `eventDate` cho batch import/daily count | Meta thong tin duoc parse dung tu structured note |
| STOCK-24 | Integration | Sau 1 order POS thanh cong, transaction history co them dong `ORDER_DEDUCT` | Dong lich su moi co `orderId` va stock delta am |
| STOCK-25 | Functional | Forecast khi ingredient khong co usage 30 ngay gan nhat | `average_daily_usage = 0`, `days_remaining = null`, khong tinh reorder sai |
| STOCK-26 | Functional | Forecast de xuat nhap them khi `days_remaining <= 5` hoac stock duoi threshold | `suggested_reorder` > 0 theo cong thuc hien tai |
| STOCK-27 | Validation | Filter transaction voi `type` khong hop le bang API | Backend chan voi thong bao `Stock transaction type is invalid.` |
| STOCK-28 | Reliability | Batch import nhieu dong, 1 dong ingredient khong ton tai | Rollback toan bo session import, khong cap nhat dong nao |
