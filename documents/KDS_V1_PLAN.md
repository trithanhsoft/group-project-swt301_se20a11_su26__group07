# KDS_V1_PLAN.md

## 1. Objective

Build a staff-facing KDS page for Mini Coffee POS so the team can:

- see new paid orders waiting for preparation
- mark an order as completed after the drink is made
- move completed orders into a separate visual area

KDS V1 is intentionally simple and does not replace payment or stock logic.

---

## 2. Core Decision

Do not reuse `orders.status` for kitchen flow.

Reason:

- current project already uses `orders.status = 'SUCCESS'` for paid orders
- dashboard and reports depend on that meaning
- changing it would create unnecessary regressions

KDS therefore uses its own fields on `orders`:

- `kds_status`
- `kds_completed_at`
- `kds_completed_by`

---

## 3. Scope

### In Scope

- new KDS screen for `STAFF`
- 2 KDS sections:
  - new orders
  - completed orders
- backend API to load KDS orders
- backend API to mark order completed
- DB migration for KDS fields

### Out of Scope

- kitchen-only role
- websocket/live push
- cancel or recall order
- separate kitchen printer flow
- multi-step prep statuses

---

## 4. Data Model

Recommended KDS fields on `orders`:

- `kds_status text not null default 'NEW'`
- `kds_completed_at timestamptz`
- `kds_completed_by uuid`

Allowed values:

- `NEW`
- `COMPLETED`

Backfill rule for old orders:

- existing historical orders become `COMPLETED`

---

## 5. API

### GET `/api/kds/orders`

Return:

- `newOrders`
- `completedOrders`

### PATCH `/api/kds/orders/:id/complete`

Rules:

- only `STAFF`
- only order with `kds_status = 'NEW'` can be completed
- double complete must be rejected safely

---

## 6. UI

Route:

- `/staff/kds`

Layout:

- left/right or responsive 2-column sections
- each order shown as a card
- show order code, created time, note, staff username, items
- button `Hoan thanh` only for new orders

Behavior:

- complete action moves order from `Don moi` to `Da hoan thanh`
- refresh manually and auto-refresh every 15 seconds

---

## 7. Future V2

Possible next upgrades:

- `KITCHEN` role
- more statuses such as `PREPARING` or `READY`
- sound notification
- real-time websocket updates
- print chit for kitchen
