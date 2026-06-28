# POS_ORDER_V1_PLAN.md

## 1. Objective

Implement POS Order V1 for Staff in the Mini Coffee POS system.

This feature should cover:

- Staff POS product selection
- Cart quantity update
- Create order from cart
- Real backend stock validation
- Real backend stock deduction
- Order success feedback with order code
- Staff order history
- Staff order detail

This should stay simple, traceable, and aligned with the core testing flow:

```txt
Product -> Recipe -> Inventory -> Order -> Stock Deduction -> Report
```

---

## 2. Why This Next

This is the best next feature after Recipe Management because:

- Product, ingredient, stock, and recipe data are now ready to support real order logic.
- Frontend already has these staff-facing screens:
  - `frontend/src/features/pos/pages/POSPage.jsx`
  - `frontend/src/features/orders/pages/OrderHistoryPage.jsx`
  - `frontend/src/features/orders/pages/OrderDetailPage.jsx`
- Frontend already has these API files:
  - `frontend/src/features/pos/api/posApi.js`
  - `frontend/src/features/orders/api/orderApi.js`
- Backend does not yet have:
  - `backend/src/modules/orders/`

So this feature can turn the current staff flow from mock mode into the most important real business flow in the system.

---

## 3. In Scope

### Staff POS Flow

- Load POS-available products
- Search product by name
- Add product to cart
- Increase or decrease cart quantity
- Remove product from cart
- Submit order
- Show success order code after checkout

### Staff Order Read Flow

- View own successful orders
- View own order detail

### Business Rules

- Only authenticated `STAFF` can create POS orders
- Cart cannot be empty
- Item quantity must be a positive integer
- Product must exist and not be soft-deleted
- Product must be `ACTIVE`
- Product must have a valid recipe
- Stock must be sufficient for all required ingredients
- Total amount must be calculated by backend from database price, not trusted from frontend
- If order fails, no order, no order items, no stock update, and no stock transaction should be saved
- Every successful stock deduction must create `stock_transactions` rows with type `ORDER_DEDUCT`
- Only successful orders are stored in `orders`

### Access Control

- Only `STAFF` can call `POST /api/orders`
- Staff can read only their own orders in V1
- Admin order browsing can wait for a later feature unless the team explicitly wants it now

---

## 4. Out of Scope

- Payment gateway
- Cash received / change returned
- Discount / voucher / promotion
- Split bill
- Order cancel / refund
- Failed order persistence
- Kitchen workflow
- Receipt printer integration
- Multi-branch POS
- Offline POS sync
- Admin order management UI

---

## 5. V1 Design Decision

This feature should be treated as two closely related parts:

### Part A: Checkout Command

The checkout API is the write path:

- validate cart
- validate products
- validate recipes
- validate stock
- create order
- create order items
- deduct stock
- create stock transactions

### Part B: Order Read Flow

The order read APIs are the trace path:

- history list
- detail view
- item snapshot verification

Important V1 rules:

- Backend is the source of truth for stock and pricing.
- Frontend must send only `productId` and `quantity`.
- Frontend must not make final stock deduction decisions.
- Order creation and stock deduction must happen in one database transaction.
- Order items must store product name and price snapshots at sale time.

Recommended V1 rule about order status:

- Keep order status simple and always save `SUCCESS`.
- Do not insert failed orders into the database.

This matches the current real enum and keeps the testing story clear.

---

## 6. Data Contract

### Safe Order Fields Confirmed By Real Database

All ids below are `uuid`.

```txt
orders.id
orders.order_code
orders.staff_id
orders.total_amount
orders.status
orders.note
orders.created_at
orders.updated_at
order_items.id
order_items.order_id
order_items.product_id
order_items.product_name_snapshot
order_items.quantity
order_items.unit_price
order_items.subtotal
order_items.created_at
stock_transactions.id
stock_transactions.ingredient_id
stock_transactions.type
stock_transactions.quantity
stock_transactions.before_stock
stock_transactions.after_stock
stock_transactions.order_id
stock_transactions.note
stock_transactions.created_by
stock_transactions.created_at
```

### Safe Enum Direction Confirmed By Real Database

```txt
order_status = SUCCESS
```

Recommended V1 meaning:

- Only successful orders are inserted into `orders`
- Failure stays as API error only

### Fields Currently Uncertain In Real Database

The current metadata does not prove these exist:

```txt
orders.deleted_at
payment_method
cash_received
change_amount
discount_amount
```

Recommended V1 choice:

- Do not depend on any of these fields unless schema support is confirmed later.

### Recommended Create Order Request Shape

```json
{
  "items": [
    {
      "productId": "eceb609b-0c39-4c88-901d-26555b9b5012",
      "quantity": 2
    }
  ],
  "note": "optional"
}
```

Notes:

- `note` can stay optional because the real table supports it
- POS UI does not need a note field in V1 unless the team wants it

### Recommended Create Order Response Shape

```json
{
  "id": "5dbf6cb2-3a7f-4de1-a668-a9ef31200d74",
  "orderCode": "OD202606200001",
  "staffId": "6f5d0644-8b6b-40d7-b63c-b3fdf7e59abc",
  "staffUsername": "staff",
  "totalAmount": 110000,
  "status": "SUCCESS",
  "note": "",
  "createdAt": "2026-06-20T10:00:00.000Z",
  "items": [
    {
      "productId": "eceb609b-0c39-4c88-901d-26555b9b5012",
      "productName": "Americano Da - L",
      "quantity": 2,
      "unitPrice": 55000,
      "subtotal": 110000
    }
  ]
}
```

### Recommended Order History Response Shape

```json
{
  "id": "5dbf6cb2-3a7f-4de1-a668-a9ef31200d74",
  "orderCode": "OD202606200001",
  "staffId": "6f5d0644-8b6b-40d7-b63c-b3fdf7e59abc",
  "staffUsername": "staff",
  "totalAmount": 110000,
  "status": "SUCCESS",
  "createdAt": "2026-06-20T10:00:00.000Z"
}
```

---

## 7. Backend Plan

Create:

```txt
backend/src/modules/orders/
order.routes.js
order.controller.js
order.service.js
order.validation.js optional
```

Recommended mapper helper:

```txt
backend/src/utils/order.js
```

Mount in:

```txt
backend/src/app.js
```

### Phase 1: Checkout API

Endpoint:

```txt
POST /api/orders
```

Rules:

- Require authenticated `STAFF`
- Reject empty cart
- Reject item quantity `<= 0`
- Merge duplicate product ids in service layer or reject them clearly
- Load products from database by ids sent by frontend
- Reject missing products
- Reject inactive products
- Load recipes and recipe items for all cart products
- Reject any product without recipe
- Aggregate required ingredient quantities across the whole cart
- Lock ingredient rows before final stock check and update
- Reject insufficient stock with clear ingredient name in error message
- Insert `orders` row with status `SUCCESS`
- Insert `order_items` rows using product name and price snapshots
- Update `ingredients.current_stock`
- Insert `stock_transactions` rows with `ORDER_DEDUCT` and `order_id`
- Commit on success, rollback on any failure

Recommended service flow:

```txt
1. Validate user and role
2. Validate request body
3. Normalize cart items
4. Load products
5. Load recipes
6. Compute order totals
7. Compute required ingredients
8. Lock and check ingredient stock
9. Insert order
10. Insert order items
11. Deduct ingredient stock
12. Insert stock transactions
13. Commit
14. Return order summary
```

Important implementation note:

- Do not trust frontend cart total
- Do not trust frontend recipe or stock pre-checks

### Phase 2: Staff Order Read APIs

Endpoints:

```txt
GET /api/orders
GET /api/orders/:id
```

Rules:

- Require authenticated user
- In V1, `STAFF` should see only their own orders
- If admin support is added later, decide separately whether Admin can see all orders
- Return only successful orders
- Detail endpoint should include item snapshots

Recommended list query support:

```txt
dateFrom optional
dateTo optional
```

Recommended query direction:

- Join `orders` with `app_users` for staff username
- Join `order_items` only in detail endpoint
- Keep list endpoint lightweight

---

## 8. Frontend Plan

Reuse existing files:

```txt
frontend/src/features/pos/api/posApi.js
frontend/src/features/pos/pages/POSPage.jsx
frontend/src/features/orders/api/orderApi.js
frontend/src/features/orders/pages/OrderHistoryPage.jsx
frontend/src/features/orders/pages/OrderDetailPage.jsx
```

### Phase 3: POS Page Cleanup

Needed cleanup:

- Remove localStorage mock fallback
- Load products only from `/api/products/pos/available`
- Stop depending on live `ingredientApi` and `recipeApi` in real POS mode
- Keep search and cart UX
- Keep add, remove, and quantity update behavior
- Send only `productId` and `quantity` to checkout API
- Show backend error messages clearly
- Show success order code from backend response

Important V1 alignment:

- Frontend can keep cart state locally
- Frontend must not calculate final authoritative stock result
- Frontend may show optimistic total from visible product price, but backend result is final

### Phase 4: Order History Cleanup

Needed cleanup:

- Remove localStorage mock fallback
- Use real `/api/orders`
- Show real order code, staff username, total amount, and created time
- Keep detail navigation

### Phase 5: Order Detail Cleanup

Needed cleanup:

- Remove localStorage mock fallback
- Use real `/api/orders/:id`
- Render item snapshots from backend
- Show order summary, total amount, and status clearly

### Phase 6: Cross-Feature Alignment

Make sure these concepts stay consistent:

- POS available products come from `ACTIVE` + has recipe
- recipe quantity is for one product unit
- stock deduction uses recipe quantity multiplied by cart quantity
- order item uses product snapshot name and price
- stock transaction type is `ORDER_DEDUCT`

---

## 9. Suggested Build Order

1. Confirm real `orders`, `order_items`, and `stock_transactions` columns
2. Create backend `orders` module
3. Build `POST /api/orders`
4. Make order insert + order items + stock deduction + stock transactions atomic in one DB transaction
5. Build `GET /api/orders`
6. Build `GET /api/orders/:id`
7. Mount `/api/orders` in backend app
8. Connect `POSPage` to real checkout flow
9. Remove POS mock fallback
10. Connect order history page to real APIs
11. Remove order history mock fallback
12. Connect order detail page to real APIs
13. Remove order detail mock fallback
14. Regression test dashboard order counts and later report dependencies

---

## 10. Acceptance Criteria

### Staff POS

- Staff can open `/staff/pos`
- Staff can see only POS-available products
- Staff can add products to cart
- Staff can update quantities in cart
- Staff can remove products from cart
- Staff can submit a valid order
- Staff receives a success order code after checkout

### Business Rules

- Empty cart is rejected
- Inactive product is rejected
- Product without recipe is rejected
- Missing product is rejected
- Insufficient stock is rejected with clear ingredient name
- Successful order total is calculated by backend
- Failed order does not deduct stock
- Failed order does not insert order or order items
- Successful order deducts stock and creates stock transactions

### Staff Order Read

- Staff can open `/staff/orders`
- Staff can see own successful orders from database
- Staff can open `/staff/orders/:id`
- Staff can see product snapshots, quantities, prices, and total amount

---

## 11. Manual Test Checklist

- Login as `staff` -> POS page opens
- POS product list loads from backend
- Search product by name -> matching product cards only
- Add one active product with recipe -> cart updates
- Increase and decrease quantity -> cart total updates
- Remove one item -> cart updates
- Checkout with empty cart -> blocked
- Checkout with inactive product manually forced in payload -> blocked
- Checkout with product without recipe -> blocked
- Checkout with insufficient stock -> blocked and stock unchanged
- Checkout with exact enough stock -> success
- Successful checkout -> `orders` row inserted
- Successful checkout -> `order_items` rows inserted
- Successful checkout -> `ingredients.current_stock` reduced correctly
- Successful checkout -> `stock_transactions` rows inserted with `ORDER_DEDUCT`
- Staff order history shows the new order
- Staff order detail shows correct item snapshots and total

---

## 12. Risks And Decisions

### Decision 1: UUID IDs

Real database ids for products, ingredients, recipes, orders, and order_items are `uuid`.

Recommended V1:

- Keep ids as string UUID values end-to-end
- Do not assume numeric ids in frontend or backend

### Decision 2: Order Status Simplicity

The real enum currently exposes only:

```txt
SUCCESS
```

Recommended V1:

- Save only successful orders
- Return API errors for failures instead of storing failed rows

### Decision 3: Stock Race Condition

Multiple staff sessions may try to sell overlapping stock at the same time.

Recommended V1:

- Lock ingredient rows during final stock check and update
- Do not rely on frontend pre-check

### Decision 4: Order Code Generation

Order code must be unique and readable for staff.

Recommended V1:

- Generate order code in backend service
- Use a simple deterministic prefix such as `OD...`
- Check uniqueness if needed before commit

### Decision 5: Staff Read Scope

Recommended V1:

- Staff sees only own orders
- Admin read-all order scope should be decided in a later reporting or admin order feature

---

## 13. Recommended Next After POS Order

After this feature, the next best feature should be:

1. Order History V1 cleanup if not completed together
2. Reports V1

Reason:

- Order history is the first verification surface for successful checkout
- Reports need real successful order and stock deduction data

Detailed follow-up plan:

- `documents/REPORTS_V1_PLAN.md`

This keeps the project aligned with the core testing flow:

```txt
Product -> Recipe -> Inventory -> Order -> Stock Deduction -> Report
```
