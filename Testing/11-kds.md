# KDS

## Pham vi
- UI: `/staff/kds`
- APIs: `GET /api/kds/orders`, `PATCH /api/kds/orders/:id/complete`
- Coverage mix: Functional, Integration, Concurrency-safe behavior, Security

| ID | Type | Scenario | Expected result |
|---|---|---|---|
| KDS-01 | Functional | Staff mo trang KDS | Load 2 nhom `newOrders` va `completedOrders` |
| KDS-02 | Integration | Order POS thanh cong moi tao | Order moi xuat hien o nhom `NEW` voi item, note, order code dung |
| KDS-03 | Functional | Mark complete cho order `NEW` | Order chuyen tu `Don moi` sang `Da hoan thanh` |
| KDS-04 | Negative | Complete lai order da `COMPLETED` | Backend tra `409`, UI khong dup order |
| KDS-05 | Business rule | Chi order `SUCCESS` moi di vao KDS | Du lieu KDS khong lay order khong hop le |
| KDS-06 | Functional | Manual refresh va auto-refresh | Danh sach duoc cap nhat ma khong mat tinh nhat quan |
| KDS-07 | Security | User khong phai `STAFF` goi API KDS | Bi chan boi backend |
| KDS-08 | Regression | Sau khi complete KDS, order detail/history phan staff hien `kdsStatus` va `kdsCompletedAt` dung | Du lieu giua KDS va Order khop nhau |
| KDS-09 | Empty state | Khong co don moi va khong co don da hoan thanh | UI hien empty state o ca 2 tab/nhom |
| KDS-10 | Functional | Don da hoan thanh khong con nut `Hoan thanh` | UI ngan thao tac lap lai |
| KDS-11 | Concurrency | 2 staff cung bam complete 1 order gan nhu dong thoi | Chi 1 request thanh cong, request con lai bi tu choi an toan |
| KDS-12 | Data integrity | Order o nhom completed hien dung `completedAt/completedBy` neu UI co render | Metadata bep khop voi backend |
| KDS-13 | Integration | Sau khi refresh, don da complete khong quay lai nhom `NEW` | Trang thai KDS ben vung |
