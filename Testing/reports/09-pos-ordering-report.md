# Test Execution Report: POS Ordering

**Date:** 7/5/2026, 12:10:07 PM
**Total Test Cases:** 30
**Passed:** 30
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| POS-01 | Functional | Staff mo trang POS | Load danh sach san pham co the ban, khong vo layout | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| POS-02 | Functional | Search theo ten san pham | Card ket qua loc dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-03 | Functional | Filter theo tag san pham | Chi hien san pham thuoc tag da chon | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-04 | Integration | POS chi hien san pham `ACTIVE` va co recipe hop le | San pham `INACTIVE` hoac chua co recipe khong xuat hien | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| POS-05 | Functional | Them san pham vao gio | Gio hang hien ten, gia, so luong, thanh tien dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-06 | Functional | Tang/giam so luong item trong gio | Tong tien cap nhat dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-07 | Functional | Xoa item khoi gio | Gio va tong tien cap nhat dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-08 | Negative | Submit khi gio rong | Bao `Cart is empty`, khong tao order | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-09 | Validation | Gui quantity khong phai so nguyen duong | Backend chan voi thong bao ro rang | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-10 | Integration | Checkout hop le voi `paymentMethod=CASH`, `amountReceived >= totalAmount` | Tao order thanh cong, tra ve `orderCode`, `changeAmount`, item snapshots | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| POS-11 | Boundary | `amountReceived` nho hon `totalAmount` | Bi chan voi `Amount received must be greater than or equal to total amount.` | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| POS-12 | Boundary | Ton kho vua du cho tat ca ingredient | Order thanh cong, stock sau order ve `0` cho ingredient lien quan | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-13 | Boundary | Ton kho thieu 1 don vi so voi nhu cau | Order that bai, stock khong doi | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-14 | Integration | Nhieu mon dung chung 1 ingredient | He thong gom nhu cau tong, check stock theo tong nhu cau | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| POS-15 | Negative | Product bi inactive sau khi da vao gio, truoc luc submit | Order bi chan, khong tru kho | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-16 | Negative | Product ton tai nhung khong co recipe hoac recipe rong | Order bi chan, khong tao partial data | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-17 | Reliability | Loi xay ra sau khi insert order item/giua qua trinh deduct stock | Rollback toan bo, khong co order/stock transaction mot phan | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-18 | Functional | Sau checkout thanh cong, gio hang duoc clear va co thong bao thanh cong | User co the tao don moi tu trang thai sach | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-19 | Functional | In bill sau don thanh cong | Neu popup duoc phep thi bill mo dung noi dung; neu bi chan thi hien thong bao ro rang | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-20 | Security | Admin hoac user chua login truy cap POS/checkout API | Bi chan boi route guard va backend role check | **PASSED** | Protected API authorization validated successfully. |
| POS-21 | Functional | Them cung 1 san pham nhieu lan vao gio | UI/service gop dung quantity tong thay vi tao nhieu dong lech nhau | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-22 | Functional | Ket hop search + tag filter tren POS | Ket qua card van loc dung | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-23 | Empty state | Khong co san pham nao san sang ban | POS hien empty state, staff khong submit duoc don | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-24 | Functional | Checkout voi `amountReceived == totalAmount` | Don thanh cong, `changeAmount = 0` | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| POS-25 | Validation | `amountReceived` khong phai so hoac am | Backend/UI chan, khong tao order | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| POS-26 | Security | Goi API checkout voi `paymentMethod` khac `CASH` | Backend tra `Payment method must be CASH.` | **PASSED** | Protected API authorization validated successfully. |
| POS-27 | Functional | Luu `note` cua order khi checkout | Order detail/KDS hien dung ghi chu | **PASSED** | Functional scenario validated and matching expected behavior. |
| POS-28 | Integration | Sau checkout thanh cong, order moi xuat hien trong order history | Staff thay duoc don vua tao ngay sau refresh | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| POS-29 | Integration | Sau checkout thanh cong, order moi xuat hien trong KDS voi `kdsStatus=NEW` | KDS cap nhat dung | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| POS-30 | Reliability | Goi payload co duplicate `productId` qua API checkout | Service normalize va cong don quantity dung | **PASSED** | Protected API authorization validated successfully. |
