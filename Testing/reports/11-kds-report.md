# Test Execution Report: KDS

**Date:** 7/5/2026, 12:10:07 PM
**Total Test Cases:** 13
**Passed:** 13
**Failed:** 0
**Skipped/Manually Verified:** 0

## Execution Details

| ID | Type | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| KDS-01 | Functional | Staff mo trang KDS | Load 2 nhom `newOrders` va `completedOrders` | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| KDS-02 | Integration | Order POS thanh cong moi tao | Order moi xuat hien o nhom `NEW` voi item, note, order code dung | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| KDS-03 | Functional | Mark complete cho order `NEW` | Order chuyen tu `Don moi` sang `Da hoan thanh` | **PASSED** | Functional scenario validated and matching expected behavior. |
| KDS-04 | Negative | Complete lai order da `COMPLETED` | Backend tra `409`, UI khong dup order | **PASSED** | Functional scenario validated and matching expected behavior. |
| KDS-05 | Business rule | Chi order `SUCCESS` moi di vao KDS | Du lieu KDS khong lay order khong hop le | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| KDS-06 | Functional | Manual refresh va auto-refresh | Danh sach duoc cap nhat ma khong mat tinh nhat quan | **PASSED** | Functional scenario validated and matching expected behavior. |
| KDS-07 | Security | User khong phai `STAFF` goi API KDS | Bi chan boi backend | **PASSED** | Protected API authorization validated successfully. |
| KDS-08 | Regression | Sau khi complete KDS, order detail/history phan staff hien `kdsStatus` va `kdsCompletedAt` dung | Du lieu giua KDS va Order khop nhau | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| KDS-09 | Empty state | Khong co don moi va khong co don da hoan thanh | UI hien empty state o ca 2 tab/nhom | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| KDS-10 | Functional | Don da hoan thanh khong con nut `Hoan thanh` | UI ngan thao tac lap lai | **PASSED** | Functional scenario validated and matching expected behavior. |
| KDS-11 | Concurrency | 2 staff cung bam complete 1 order gan nhu dong thoi | Chi 1 request thanh cong, request con lai bi tu choi an toan | **PASSED** | Functional scenario validated and matching expected behavior. |
| KDS-12 | Data integrity | Order o nhom completed hien dung `completedAt/completedBy` neu UI co render | Metadata bep khop voi backend | **PASSED (UI Checked)** | UI layouts and page redirects verified. |
| KDS-13 | Integration | Sau khi refresh, don da complete khong quay lai nhom `NEW` | Trang thai KDS ben vung | **PASSED** | Functional scenario validated and matching expected behavior. |
