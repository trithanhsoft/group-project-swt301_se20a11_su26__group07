# End To End Regression

## Muc tieu
- Dam bao cac module lien ket dung nhau sau moi lan sua code.
- Uu tien cac luong tao anh huong day chuyen den stock, order, report, session va HR salary.

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| E2E-01 | Integration | Admin tao product `ACTIVE` -> tao recipe -> staff mo POS | San pham xuat hien tren POS available list |
| E2E-02 | Integration | Admin tao ingredient -> batch import -> daily count -> xem transactions | So lieu ingredient va stock history nhat quan |
| E2E-03 | Integration | Staff checkout thanh cong | Tao order, order items, stock deduct, transaction `ORDER_DEDUCT`, KDS `NEW` |
| E2E-04 | Reliability | Staff checkout that bai do thieu stock | Khong co order, khong co order item, khong tru kho, report khong doi |
| E2E-05 | Integration | KDS complete order vua tao | KDS chuyen trang thai, order detail/history cap nhat dung |
| E2E-06 | Integration | Reports sau order thanh cong | Revenue, best-selling, dashboard counts cap nhat dung |
| E2E-07 | Integration | Discard san pham da co recipe | Kho giam theo recipe, transaction/discard report cap nhat dung |
| E2E-08 | Security | Admin deactivate 1 staff dang su dung he thong | Session/API tiep theo cua staff bi vo hieu hoa |
| E2E-09 | Integration | Admin xep ca -> staff check-in/out -> salary summary -> HR cost report | Luong staff va tong chi phi HR khop nhau |
| E2E-10 | Reliability | Request leave duoc approve cho ngay da co ca | Shift lien quan thanh `ABSENT`, salary ky do cap nhat |
| E2E-11 | Regression | Soft delete recipe cua 1 product tung ban duoc | Order cu van giu snapshot, product moi khong con ban duoc tren POS |
| E2E-12 | Non-functional | Chay lai bo filter/search/tab chinh tren product, ingredient, stock, users, reports | UI khong crash, bo loc hoat dong on dinh |
| E2E-13 | Concurrency | 2 staff session checkout gan nhu dong thoi tren cung stock canh tranh | Chi session hop le thanh cong theo stock khoa `FOR UPDATE`, khong am kho |
| E2E-14 | Usability | Loi nghiep vu hien thi de hieu tren login, POS, stock, HR | Thong diep cu the, giup tester xac dinh duoc dieu kien fail |
| E2E-15 | Integration | Admin tao user staff moi -> staff dang nhap -> vao POS -> tao order | Luong account moi va nghiep vu ban hang thong suot |
| E2E-16 | Integration | Staff doi mat khau tai profile -> logout -> login lai -> tiep tuc tao order | Session/profile khong pha vo flow nghiep vu |
| E2E-17 | Integration | Tao order thanh cong -> doi ten/gia product -> mo lai order detail cu | Snapshot item cu khong bi thay doi theo master data moi |
| E2E-18 | Integration | Ingredient ve muc low-stock sau order/discard -> dashboard va reports dong bo canh bao | Cac man hinh doc du lieu thong nhat |
| E2E-19 | Security | Staff co yen URL admin HR/Reports/Product/Users sau khi login | Tat ca deu bi chan dung UI + backend |
| E2E-20 | Regression | Xoa mem product/ingredient/recipe sau khi da co order lich su | Lich su don va report cu van doc duoc, khong vo tham chieu |
| E2E-21 | Integration | Admin approve swap request -> staff moi check-in/check-out -> HR cost report cap nhat | Du lieu lich, attendance va salary noi thong |
| E2E-22 | Reliability | App bootstrap voi token cu tren route protected, sau do user bi inactive | Session bi thu hoi sach se, khong hien du lieu protected |
