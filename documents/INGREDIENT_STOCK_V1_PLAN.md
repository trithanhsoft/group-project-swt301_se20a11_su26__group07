# INGREDIENT_STOCK_V1_PLAN.md

## 1. Objective

Implement Ingredient and Stock Management V1 for the Mini Coffee POS system.

This feature should cover:

- Ingredient master data
- Current stock visibility
- Low-stock threshold
- Stock import
- Stock adjustment
- Stock transaction history

This should stay simple, test-friendly, and traceable.

---

## 2. Why This Next

This is the most practical next feature after Product Management because:

- Ingredients are required before Recipe can be managed properly.
- Stock movement must exist before POS order deduction can be tested clearly.
- Frontend already has these screens:
  - `frontend/src/features/ingredients/pages/IngredientListPage.jsx`
  - `frontend/src/features/ingredients/pages/IngredientFormPage.jsx`
  - `frontend/src/features/stock/pages/StockPage.jsx`
  - `frontend/src/features/stock/pages/StockTransactionPage.jsx`
- Backend does not yet have:
  - `backend/src/modules/ingredients/`
  - `backend/src/modules/stock/`

So this feature can turn more existing UI from mock mode into real working flow and prepare the system for Recipe and POS.

---

## 3. In Scope

### Ingredient Management

- View ingredient list
- Search ingredient by name
- Filter low-stock items
- Create ingredient
- Edit ingredient
- Soft delete ingredient

### Stock Management

- Import stock for an ingredient
- Adjust stock down for loss / manual correction
- View stock transaction history

### Business Rules

- Ingredient name cannot be empty
- Ingredient stock cannot be negative
- Stock import quantity must be greater than 0
- Stock adjustment quantity must be greater than 0
- Stock adjustment must not make current stock negative
- Low-stock warning when `current_stock <= low_stock_threshold`

### Access Control

- Only Admin can access ingredient and stock screens
- Only Admin can call ingredient and stock management APIs

---

## 4. Out of Scope

- Supplier management
- Purchase order workflow
- Stock transfer between branches
- Expiry / batch / lot tracking
- Automatic reorder
- Inventory audit approval flow
- Barcode support
- Recipe editing
- POS order deduction UI

---

## 5. V1 Design Decision

This feature should be treated as two closely related sub-features:

### Part A: Ingredient Master Data

Ingredient screen should manage stable reference data:

- name
- unit
- low_stock_threshold

### Part B: Stock Movement

Stock screen should manage quantity-changing actions:

- import
- adjust down
- transaction history

Important V1 rule:

- Do not freely edit `current_stock` from the ingredient edit form after stock transaction flow exists.
- Stock quantity should change through stock transaction APIs so the team can trace and test every stock update clearly.

Recommended exception:

- If needed, allow setting initial stock only when creating a brand-new ingredient.
- After creation, future stock changes should go through stock transactions only.

---

## 6. Data Contract

### Safe Ingredient Fields Confirmed By Current Seed

```txt
id
name
unit
current_stock
low_stock_threshold
created_by
created_at
updated_at
deleted_at
```

### Fields Currently Uncertain In Real Database

The current frontend skeleton assumes these may exist:

```txt
status
notes
```

Recommended V1 choice:

- Do not depend on `status` or `notes` unless the real database schema is confirmed.
- If schema is uncertain, remove them from V1 UI/API.

### Recommended Stock Transaction Fields

```txt
id
ingredient_id
type
quantity
before_stock
after_stock
notes
order_id nullable
created_by
created_at
```

Transaction types:

```txt
IMPORT
ADJUST
ORDER_DEDUCT
```

Notes:

- `IMPORT` and `ADJUST` are handled by Admin stock screens.
- `ORDER_DEDUCT` will later be created automatically by backend order service.
- If `before_stock`, `after_stock`, or `notes` do not exist yet in the real database, confirm schema direction with the team before coding.

Recommended reason to keep them:

- They make manual testing and debugging much easier.

---

## 7. Backend Plan

Create:

```txt
backend/src/modules/ingredients/
ingredient.routes.js
ingredient.controller.js
ingredient.service.js
ingredient.validation.js optional
```

Create:

```txt
backend/src/modules/stock/
stock.routes.js
stock.controller.js
stock.service.js
stock.validation.js optional
```

Recommended constants:

```txt
backend/src/constants/units.js
backend/src/constants/stockTransactionTypes.js
```

Mount in:

```txt
backend/src/app.js
```

### Phase 1: Ingredient APIs

Endpoints:

```txt
GET    /api/ingredients
POST   /api/ingredients
GET    /api/ingredients/:id
PATCH  /api/ingredients/:id
DELETE /api/ingredients/:id
```

Rules:

- Require `ADMIN` role
- Never return soft-deleted ingredients in normal list/detail APIs
- Ingredient name should be unique case-insensitively
- `unit` only accepts supported values
- `low_stock_threshold` must be `>= 0`
- `current_stock` must be `>= 0`
- `DELETE` should be soft delete using `deleted_at`

Recommended list query support:

```txt
search
lowStock=true optional
```

Recommended returned ingredient shape:

```json
{
  "id": 1,
  "name": "Coffee bean",
  "unit": "GRAM",
  "currentStock": 1000,
  "lowStockThreshold": 100,
  "isLowStock": false,
  "createdAt": "2026-06-20T10:00:00.000Z",
  "updatedAt": "2026-06-20T10:00:00.000Z"
}
```

### Phase 2: Stock APIs

Endpoints:

```txt
POST /api/stock/import
POST /api/stock/adjust
GET  /api/stock/transactions
```

Rules:

- Require `ADMIN` role
- Quantity sent to import/adjust API must be positive
- `import` increases `ingredients.current_stock`
- `adjust` decreases `ingredients.current_stock`
- Reject any adjustment that would make stock negative
- Every successful stock change must insert one `stock_transactions` record
- Ingredient stock update and transaction insert must happen in one database transaction

Recommended transaction list query support:

```txt
ingredientId optional
type optional
dateFrom optional
dateTo optional
```

Recommended transaction response shape:

```json
{
  "id": 1,
  "ingredientId": 1,
  "ingredientName": "Coffee bean",
  "type": "IMPORT",
  "quantity": 500,
  "beforeStock": 500,
  "afterStock": 1000,
  "notes": "Restock from supplier",
  "createdBy": "admin",
  "createdAt": "2026-06-20T10:00:00.000Z"
}
```

---

## 8. Frontend Plan

Reuse existing files:

```txt
frontend/src/features/ingredients/api/ingredientApi.js
frontend/src/features/ingredients/pages/IngredientListPage.jsx
frontend/src/features/ingredients/pages/IngredientFormPage.jsx
frontend/src/features/stock/api/stockApi.js
frontend/src/features/stock/pages/StockPage.jsx
frontend/src/features/stock/pages/StockTransactionPage.jsx
```

### Phase 3: Ingredient Screen Cleanup

Needed cleanup:

- Remove localStorage mock fallback
- Align API response envelope with project standard
- Keep search and low-stock filter behavior
- Keep delete confirmation dialog
- Show low-stock warning clearly

Important V1 cleanup:

- If schema is uncertain, remove `status` and `notes` from ingredient UI
- Move stock-changing behavior out of ingredient edit form and into stock transaction screen

### Phase 4: Stock Screen Cleanup

Needed cleanup:

- Remove local mock transactions
- Use real ingredient options from backend
- Post real import/adjust transactions to backend
- Reload ingredient list after stock change
- Show stock transaction history from backend

### Phase 5: Shared UI Alignment

Make sure these concepts are consistent:

- `currentStock`
- `lowStockThreshold`
- `isLowStock`
- `IMPORT`
- `ADJUST`
- `ORDER_DEDUCT`

Do not mix snake_case and camelCase inconsistently in frontend state once API mapping is decided.

---

## 9. Suggested Build Order

1. Confirm whether ingredient `status` and `notes` exist in the real database
2. Confirm actual `stock_transactions` columns in the real database
3. Create backend `ingredients` module
4. Build ingredient list/detail/create/update/delete APIs
5. Create backend `stock` module
6. Build import, adjust, and transaction history APIs
7. Make stock update + stock transaction insert atomic in one DB transaction
8. Connect ingredient frontend pages to real APIs
9. Remove ingredient mock fallback
10. Connect stock frontend pages to real APIs
11. Remove stock mock fallback
12. Update seed data if needed

---

## 10. Acceptance Criteria

### Ingredient Management

- Admin can open `/admin/ingredients`
- Admin can see ingredient list from database
- Admin can search ingredient by name
- Admin can create a new ingredient
- Admin can edit ingredient name, unit, and low-stock threshold
- Admin can soft delete an ingredient
- Low-stock ingredients are visually identifiable

### Stock Management

- Admin can import stock for an ingredient
- Admin can adjust stock down for an ingredient
- System blocks any stock adjustment that would make stock negative
- Successful import updates current stock and creates one stock transaction
- Successful adjustment updates current stock and creates one stock transaction
- Admin can open `/admin/stock/transactions` and view transaction history

### Traceability

- Ingredient quantity changes are traceable through transaction history
- Stock history shows ingredient, type, quantity, and time
- Order deduction is reserved for later order service but transaction type is already planned

---

## 11. Manual Test Checklist

- Open ingredient list -> data loads from backend
- Search ingredient by name -> matching rows only
- Create valid ingredient -> success
- Create duplicate ingredient name -> clear error
- Create ingredient with empty name -> blocked
- Create ingredient with negative threshold -> blocked
- Import stock -> current stock increases
- Adjust stock -> current stock decreases
- Adjust stock beyond available quantity -> blocked
- Transaction history shows import row
- Transaction history shows adjust row
- Low-stock ingredient appears in warning/filter state
- Deleted ingredient no longer appears in normal list

---

## 12. Risks And Decisions

### Decision 1: Ingredient Status

The current frontend mock uses `status`, but current backend seed does not prove it exists.

Recommended V1:

- Do not require ingredient `status` unless schema is confirmed.

### Decision 2: Ingredient Notes

The current ingredient form mock uses `notes`, but schema is uncertain.

Recommended V1:

- Keep notes out of V1 unless database support already exists.

### Decision 3: Stock Editing Location

Recommended V1 rule:

- Do not edit current stock directly in ingredient update API after stock APIs exist.

This keeps all quantity changes traceable.

### Decision 4: Delete Rule

Recommended V1 behavior:

- Use soft delete only
- Prefer rejecting delete if ingredient is already referenced by recipe items or stock transactions

If that restriction feels too strict for the first pass:

- At minimum, still use soft delete and never physically remove rows

---

## 13. Recommended Next After Ingredient Stock

After this feature, the next best feature should be:

1. Recipe Management V1
2. POS Order V1
3. Order History V1
4. Reports V1

Reason:

- Recipe needs real ingredients
- POS needs recipes and stock
- Orders need real stock deduction
- Reports need real transaction/order data

Detailed follow-up plan:

- `documents/RECIPE_MANAGEMENT_V1_PLAN.md`

This keeps the project aligned with the core testing flow:

```txt
Product -> Recipe -> Inventory -> Order -> Stock Deduction -> Report
```
