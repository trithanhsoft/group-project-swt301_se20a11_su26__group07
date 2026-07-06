# Edge Cases and UI Resilience

## Pham vi
- UI: Toan bo cac trang (`/login`, `/admin/*`, `/staff/*`, `/profile`)
- Luong kiem thu: Edge case, Offline Mode, UI/Layout misalignment, Overflow, Concurrency, Injection attempts.

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| EDGE-01 | Offline Mode | Mat ket noi mang / mat ket noi backend khi dang o POS | Hien indicator offline, block checkout, giu nguyen danh sach cart trong state va hien thong bao huong dan nguoi dung ket noi lai |
| EDGE-02 | UI Overflow | Ten san pham / nguyen lieu qua dai (VD: 150 ky tu) | Chu tu dong xuong dong hoac hien thi dang ellipsis (...), layout card hoac bang khong bi vo, nut bam khong bi day lech |
| EDGE-03 | Concurrency | Click dup (double-click) lien tiep vao nut thanh toan don hang | Chi gui 1 request checkout duy nhat len backend, khong tao don hang trung, khong tru kho 2 lan |
| EDGE-04 | Responsive | Kich thuoc man hinh thu ve mobile (375px) | Menu sidebar thu gon thanh hamburger, cac grid POS va admin dashboard tu xep chong (stack) theo chieu doc, khong bi overlap chu hoac nut bam |
| EDGE-05 | Security/Sanitization | Nhap ma script / SQL (VD: `<script>alert(1)</script>` hoac `' OR '1'='1`) vao o search hoac o ten | He thong escape dau ky tu dac biet, khong crash ung dung, khong bi XSS hay pha query DB |
| EDGE-06 | Session Invalidation | Token het han khi dang giua phien lam viec (VD: dang mo gio hang POS hoac dang sua user) | Khi goi API tiep theo, he thong tu dong day ve `/login`, xoa sach session cu ma khong gay trang trang/loader quay vo tan |
| EDGE-07 | Extreme Inputs | Gia san pham dat qua lon (VD: `999,999,999,999` VND) hoac threshold qua nho (VD: `0.00000000000000000001`) | Bao loi gioi han chu so hoac he thong kiem soat dung chu so thap phan phu hop, khong gay crash database (overflow numeric) |
| EDGE-08 | Multi-tab Concurrency | Mo hai tab tren cung 1 trinh duyet, tab A thuc hien logout | Tab B khi click vao bat ky tinh nang protected nao se lap tuc bi day ve trang login, khong lo du lieu cache |
| EDGE-09 | Font Zooming | Zoom trinh duyet len 200% | Cac component UI tu dong co gian hop ly, text khong bi de len nhau, layout chinh van su dung duoc binh thuong |
| EDGE-10 | Empty States & Slow Loading | Mang cham (Slow 3G) load trang san pham / ingredient | Hien thong bao loading hoac skeleton screen truoc, neu loi mang hien nút "Thử lại", layout khong bi flicker do lech anh sang/kich thuoc |
