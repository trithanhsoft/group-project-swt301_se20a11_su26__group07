# PRODUCT_MANAGEMENT_V1_PLAN.md

## 1. Objective

Implement Product Management V1 for the Mini Coffee POS system.

This should be the next feature after User Management because:

- It is part of the core business flow.
- Frontend product screens already exist and are waiting for real backend APIs.
- It unlocks Recipe, POS, Order, and Report features later.

This V1 should stay simple and focus on admin CRUD plus clean API contracts.

---

## 2. Why This Next

Current state:

- Frontend already has:
  - `frontend/src/features/products/pages/ProductListPage.jsx`
  - `frontend/src/features/products/pages/ProductFormPage.jsx`
  - `frontend/src/features/products/api/productApi.js`
- Backend does not yet have:
  - `backend/src/modules/products/`

Current product pages are still using mock/local fallback when backend APIs fail.

So Product Management V1 is the fastest feature to turn an existing UI into a real working feature.

---

## 3. In Scope

### Admin Product Management

- View product list
- Search product by name
- Filter by status
- Create product
- Edit product
- Soft delete product
- Show whether a product already has a recipe

### Product Data Rules

- Product name is required
- Product price must be greater than 0
- Product status can be `ACTIVE` or `INACTIVE`
- Inactive product must not appear in POS available list later

### Access Control

- Only Admin can access `/admin/products`
- Only Admin can call `/api/products/*` except shared POS-read endpoint if added

---

## 4. Out of Scope

- Recipe editing
- Product image upload
- Product categories
- Product size / variant
- Combo / topping
- Bulk import
- Public product page
- Advanced POS search optimization

---

## 5. Data Contract

Reuse the existing `products` table.

Expected safe V1 fields:

```txt
id
name
price
status
created_by
created_at
updated_at
deleted_at
```

Derived field returned to frontend:

```txt
hasRecipe
```

Notes:

- `hasRecipe` should be derived from `recipes.product_id`, not stored directly.
- `description` is currently used by the frontend mock UI, but the current backend seed does not prove that the database already has a `description` column.
- For V1, choose one of these before coding:
  - Option A: include `description` only if the real database column already exists.
  - Option B: remove `description` from Product V1 and keep only `name`, `price`, `status`.

Recommended choice:

- Use Option B if the database schema is still uncertain.
- Add `description` later only when schema is confirmed.

---

## 6. Backend Plan

Create:

```txt
backend/src/modules/products/
product.routes.js
product.controller.js
product.service.js
product.validation.js optional
```

Mount route in:

```txt
backend/src/app.js
```

### Phase 1: Admin Product APIs

Endpoints:

```txt
GET    /api/products
POST   /api/products
GET    /api/products/:id
PATCH  /api/products/:id
DELETE /api/products/:id
```

Rules:

- Require `ADMIN` role for all admin product endpoints
- Never return soft-deleted products in normal list/detail APIs
- `DELETE` should be soft delete using `deleted_at`
- Product name should be unique case-insensitively
- Product price must be greater than 0
- Product status only accepts `ACTIVE` or `INACTIVE`
- Return standardized response envelope:
  - list: `data.products`
  - detail/create/update: `data.product`

Recommended list query support:

```txt
search
status
```

Recommended returned product shape:

```json
{
  "id": 1,
  "name": "Milk Coffee",
  "price": 30000,
  "status": "ACTIVE",
  "hasRecipe": true,
  "createdAt": "2026-06-20T10:00:00.000Z",
  "updatedAt": "2026-06-20T10:00:00.000Z"
}
```

### Phase 2: POS-Ready Read Endpoint

Optional but recommended in the same feature:

```txt
GET /api/products/pos/available
```

Rules:

- Return only non-deleted `ACTIVE` products
- Can stay protected for authenticated users only, or for `STAFF` + `ADMIN`
- This endpoint will be reused by POS later

---

## 7. Frontend Plan

Reuse existing files:

```txt
frontend/src/features/products/api/productApi.js
frontend/src/features/products/pages/ProductListPage.jsx
frontend/src/features/products/pages/ProductFormPage.jsx
```

### Phase 3: Connect Existing Product UI to Real APIs

Needed cleanup:

- Remove `localStorage` mock fallback logic
- Use backend response envelope correctly
- Keep search and status filter behavior
- Keep delete confirmation dialog
- Keep status badge and recipe badge

### Phase 4: Align UI With Real Data Contract

Important alignment:

- `productApi.getProducts()` should read from `response.data.products`
- `productApi.getProduct(id)` should read from `response.data.product`
- Create/update should use returned `response.data.product`

If `description` is not in DB:

- Remove description field from form UI in V1
- Remove description usage from mock assumptions

If `description` is confirmed in DB:

- Keep form field and wire it to backend

---

## 8. Suggested Build Order

1. Confirm whether `products.description` exists in the real database
2. Create backend `products` module
3. Add list/create/detail/update/delete product APIs
4. Mount `/api/products` in backend app
5. Return `hasRecipe` in product list/detail queries
6. Connect existing frontend product pages to real APIs
7. Remove product mock fallback
8. Add optional `/api/products/pos/available`
9. Update seed data if needed

---

## 9. Acceptance Criteria

### Admin Product Management

- Admin can open `/admin/products`
- Admin can see product list from database
- Admin can search by product name
- Admin can filter by status
- Admin can create a new product
- Admin can edit an existing product
- Admin can soft delete a product
- Deleted product no longer appears in normal list

### Business Rules

- Product name cannot be empty
- Product price must be greater than 0
- Duplicate product name is rejected with clear error
- Product status only accepts `ACTIVE` or `INACTIVE`

### Recipe Readiness

- Product list shows whether recipe is already set
- Product without recipe can still exist in admin management
- POS available endpoint later must exclude inactive products

---

## 10. Manual Test Checklist

- Open product list -> data loads from backend
- Search by product name -> matching rows only
- Filter `ACTIVE` -> only active products
- Filter `INACTIVE` -> only inactive products
- Create valid product -> success
- Create duplicate product name -> clear error
- Create product with empty name -> blocked
- Create product with price `0` -> blocked
- Edit product name/price/status -> success
- Soft delete product -> row disappears from list
- Product with recipe -> badge shows set
- Product without recipe -> badge shows not set

---

## 11. Risks And Decisions

### Decision 1: Description Field

This must be decided before implementation:

- If DB does not already have `description`, do not silently add it in this feature unless the team approves a schema change.

### Decision 2: Delete Rule

Recommended V1 behavior:

- Use soft delete only
- Do not physically remove product rows

This keeps later order history and recipe relationships safer.

### Decision 3: Response Contract Cleanup

The current frontend product pages were written around mock behavior.

Before calling Product V1 done, make sure:

- no local mock fallback remains
- API response shape matches project standard

---

## 12. Recommended Next After Product

After Product Management V1, follow this order:

1. Ingredient Management V1
2. Recipe Management V1
3. Stock Import / Adjustment V1
4. POS Order V1
5. Order History V1
6. Reports V1

This order follows the core testing flow:

```txt
Product -> Recipe -> Inventory -> Order -> Stock Deduction -> Report
```
