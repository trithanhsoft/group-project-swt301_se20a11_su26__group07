# RECIPE_MANAGEMENT_V1_PLAN.md

## 1. Objective

Implement Recipe Management V1 for the Mini Coffee POS system.

This feature should cover:

- Recipe list
- Recipe detail
- Create recipe for one product
- Edit recipe ingredient items and quantities
- Delete recipe
- Product recipe readiness for POS

This should stay simple, test-friendly, and aligned with the existing product, ingredient, and stock flow.

---

## 2. Why This Next

This is the best next feature after Ingredient and Stock Management because:

- Product management already exposes `hasRecipe` as a derived field.
- Frontend recipe screens already exist and are waiting for real backend APIs.
- Backend seed logic already writes into `recipes` and `recipe_items`.
- POS cannot be implemented correctly until recipe data is real and queryable.
- Backend does not yet have:
  - `backend/src/modules/recipes/`

Frontend already has these files:

- `frontend/src/features/recipes/api/recipeApi.js`
- `frontend/src/features/recipes/pages/RecipeListPage.jsx`
- `frontend/src/features/recipes/pages/RecipeFormPage.jsx`

So this feature can turn the current recipe UI from mock mode into a real working admin flow and prepare the backend for POS stock deduction.

---

## 3. In Scope

### Admin Recipe Management

- View recipe list
- Search recipe by product name
- View recipe detail by recipe id
- View recipe detail by product id
- Create recipe
- Edit recipe
- Delete recipe

### Recipe Data Rules

- One active recipe per product
- Product must exist and not be soft-deleted
- Recipe must contain at least 1 ingredient line
- Ingredient must exist and not be soft-deleted
- Recipe ingredient quantity must be greater than 0
- Duplicate ingredient lines in the same recipe are not allowed
- Recipe edit must not move an existing recipe to another product
- Low stock or zero stock does not block recipe setup
- Ingredient unit is derived from ingredient master data, not typed manually in recipe item

### Access Control

- Only Admin can access recipe screens
- Only Admin can call recipe management APIs

---

## 4. Out of Scope

- Recipe version history
- Recipe cost calculation
- Recipe import from Excel
- Batch recipe clone or copy
- Product variant inheritance logic
- PREP / backflush logic from the old project
- Automatic stock deduction UI
- POS order creation
- Order rollback flow

---

## 5. V1 Design Decision

This feature should be treated as two related parts:

### Part A: Recipe Header

Recipe header should manage the product-level relationship:

- one recipe belongs to one product
- recipe existence controls whether product `hasRecipe` is true

### Part B: Recipe Items

Recipe items should manage the exact ingredient quantities needed for one product unit:

- ingredient
- quantity required
- unit from ingredient master data

Important V1 rules:

- Do not allow multiple active recipes for the same product.
- Do not allow editing `product_id` on an existing recipe.
- Expose `recipe_items.quantity_required` to frontend as `quantity`.
- Update recipe items by replacing the full item set in one database transaction.

Recommended V1 choice about product status:

- Allow Admin to prepare recipe for any non-deleted product, including `INACTIVE`.
- POS later must still sell only `ACTIVE` products that have a recipe.

This keeps product sellability and recipe setup as separate concerns.

---

## 6. Data Contract

### Safe Recipe Fields Confirmed By Current Seed And Code

```txt
recipes.id
recipes.product_id
recipes.created_by
recipes.created_at
recipes.updated_at
recipes.deleted_at
recipe_items.recipe_id
recipe_items.ingredient_id
recipe_items.quantity_required
```

### Fields Currently Uncertain In Real Database

The current codebase does not yet prove whether these exist:

```txt
recipe_items.id
notes
yield_quantity
is_active
```

Recommended V1 choice:

- Do not depend on extra recipe columns unless the real Supabase schema confirms them.
- Keep V1 API independent from `recipe_items.id`.

### Recommended Create / Update Request Shape

```json
{
  "productId": 1,
  "items": [
    {
      "ingredientId": 1,
      "quantity": 20
    }
  ]
}
```

Notes:

- `POST` requires `productId` and `items`.
- `PATCH` may receive `productId`, but must reject it if it differs from the existing recipe product.
- Backend should map API `quantity` to database `quantity_required`.

### Recommended Recipe Response Shape

```json
{
  "id": 1,
  "productId": 1,
  "productName": "Milk Coffee",
  "productStatus": "ACTIVE",
  "productPrice": 30000,
  "itemCount": 2,
  "items": [
    {
      "ingredientId": 1,
      "ingredientName": "Coffee bean",
      "unit": "GRAM",
      "quantity": 20
    },
    {
      "ingredientId": 2,
      "ingredientName": "Milk",
      "unit": "ML",
      "quantity": 100
    }
  ],
  "createdAt": "2026-06-20T10:00:00.000Z",
  "updatedAt": "2026-06-20T10:00:00.000Z"
}
```

Why this response shape is recommended:

- It matches current frontend assumptions closely.
- It avoids exposing raw snake_case database columns to React code.
- It gives recipe list, recipe form, and later POS-related screens enough information without extra joins in the frontend.

---

## 7. Backend Plan

Create:

```txt
backend/src/modules/recipes/
recipe.routes.js
recipe.controller.js
recipe.service.js
recipe.validation.js optional
```

Recommended mapper helper:

```txt
backend/src/utils/recipe.js
```

Mount in:

```txt
backend/src/app.js
```

### Phase 1: Recipe APIs

Endpoints:

```txt
GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/:id
GET    /api/recipes/product/:productId
PATCH  /api/recipes/:id
DELETE /api/recipes/:id
```

Rules:

- Require `ADMIN` role
- Never return soft-deleted recipes in normal list or detail APIs
- `POST` must reject product ids that already have a non-deleted recipe
- `POST` and `PATCH` must reject empty item arrays
- `POST` and `PATCH` must reject duplicate ingredient ids in one recipe
- `POST` and `PATCH` must reject any quantity `<= 0`
- `PATCH` must reject any attempt to move a recipe to another product
- `DELETE` should soft delete the recipe using `deleted_at`
- Product existence check must reject deleted or missing products
- Ingredient existence check must reject deleted or missing ingredients
- Recipe header and recipe item changes must happen in one database transaction

Recommended list query support:

```txt
search
```

Recommended backend query direction:

- Join recipe with product data for list and detail output
- Join recipe items with ingredient data for item rows
- Group flat SQL rows into one recipe DTO in service layer

### Phase 2: Shared Query Readiness For POS

Recipe Management V1 should also prepare for later order logic by making sure the backend can reliably load recipe data by product id.

Recommended internal behavior:

- Keep `GET /api/recipes/product/:productId` consistent with list and detail DTO shape
- Reuse the same core query pattern later inside the order service
- Do not make POS call recipe APIs directly to deduct stock; order logic must still stay in backend service

If `recipe_items.id` does not exist in the real database:

- Use delete-and-reinsert strategy for item updates inside one transaction
- Do not build V1 around per-row item patching

---

## 8. Frontend Plan

Reuse existing files:

```txt
frontend/src/features/recipes/api/recipeApi.js
frontend/src/features/recipes/pages/RecipeListPage.jsx
frontend/src/features/recipes/pages/RecipeFormPage.jsx
```

### Phase 3: Recipe List Cleanup

Needed cleanup:

- Remove localStorage mock fallback
- Use backend response envelope correctly
- Add search by product name if the current UI keeps a search bar
- Keep delete confirmation dialog
- Render ingredient chips from real backend item data
- Make sure product name, price, and item list all come from one normalized API shape

### Phase 4: Recipe Form Cleanup

Needed cleanup:

- Load products from real product API
- Load ingredients from real ingredient API
- Filter product options to products without recipe, while keeping the current product visible in edit mode
- Keep product select disabled in edit mode
- Keep duplicate ingredient validation in UI
- Show ingredient unit next to quantity input
- Send payload as `productId` plus `items[].ingredientId` and `items[].quantity`
- Remove local mock fallback

Important V1 alignment:

- Do not hide ingredients only because stock is low or zero
- Do not force recipe input to care about current stock state
- If the team accepts inactive products in recipe setup, remove the current frontend assumption that only `ACTIVE` products can be selected

### Phase 5: Cross-Feature Alignment

Make sure these concepts stay consistent:

- product `hasRecipe`
- recipe `items`
- item `quantity`
- ingredient `unit`
- product `status`

Recommended frontend rule:

- Keep camelCase in React state and API responses
- Do not leak raw snake_case fields into page components once mapping is decided

---

## 9. Suggested Build Order

1. Confirm actual `recipes` and `recipe_items` columns in the real Supabase database
2. Create backend `recipes` module
3. Build recipe list, detail, create, update, delete APIs
4. Add recipe response mapper and normalized DTO shape
5. Make recipe header update plus item replacement atomic in one DB transaction
6. Mount `/api/recipes` in backend app
7. Connect recipe list page to real APIs
8. Remove recipe mock fallback
9. Connect recipe form page to products, ingredients, and recipe APIs
10. Align product `hasRecipe` refresh behavior after recipe create or delete
11. Regression test product list, recipe list, and POS-ready product flow
12. Update seed data if needed

---

## 10. Acceptance Criteria

### Recipe Management

- Admin can open `/admin/recipes`
- Admin can see recipe list from database
- Admin can search recipe by product name
- Admin can create a recipe for one product
- Admin can edit recipe ingredient lines and quantities
- Admin can delete a recipe
- Admin can open recipe detail by recipe id or product id

### Business Rules

- One product cannot have more than one active recipe
- Recipe must contain at least one ingredient line
- Ingredient quantity must be greater than 0
- Duplicate ingredient lines are rejected with a clear error
- Missing or deleted product is rejected
- Missing or deleted ingredient is rejected
- Editing a recipe must not move it to a different product

### Cross-Feature Readiness

- Product list `hasRecipe` becomes true after recipe creation
- Product list `hasRecipe` becomes false after recipe deletion
- POS available product list later must only include `ACTIVE` products with recipe
- Recipe data is structured clearly enough for later order stock deduction logic

---

## 11. Manual Test Checklist

- Open recipe list -> data loads from backend
- Search recipe by product name -> matching rows only
- Create valid recipe -> success
- Create second recipe for the same product -> blocked
- Create recipe with no items -> blocked
- Create recipe with duplicate ingredient line -> blocked
- Create recipe with quantity `0` -> blocked
- Create recipe with deleted or missing ingredient -> blocked
- Edit recipe quantities -> success
- Try to change recipe product during edit -> blocked
- Delete recipe -> recipe disappears from normal list
- Delete recipe -> related product shows `hasRecipe = false`
- Product inactive but has recipe -> still excluded from POS available list later

---

## 12. Risks And Decisions

### Decision 1: API Quantity Naming

Current database naming and frontend naming are different.

Recommended V1:

- Database keeps `quantity_required`
- API exposes `quantity`
- Mapping happens only in backend service / DTO layer

### Decision 2: Can Inactive Product Have A Recipe

Current frontend mock assumes only active products can be selected.

Recommended V1:

- Allow recipe setup for any non-deleted product
- Let POS availability depend on product `status`, not on admin recipe form filtering

### Decision 3: Recipe Item Update Strategy

The real schema may not have `recipe_items.id`.

Recommended V1:

- Replace the full item set inside one database transaction
- Do not build V1 around row-by-row item patch logic

### Decision 4: Delete Behavior

Recommended V1 behavior:

- Soft delete recipe header only
- Keep recipe items attached to the deleted recipe unless the team later adds versioning or archival rules

This is simpler and avoids unnecessary data loss in V1.

---

## 13. Recommended Next After Recipe

After this feature, the next best feature should be:

1. POS Order V1
2. Order History V1
3. Reports V1

Reason:

- POS needs real products, recipes, and stock data together
- Order history depends on successful order creation
- Reports need real order and stock transaction data

Detailed follow-up plan:

- `documents/POS_ORDER_V1_PLAN.md`

This keeps the project aligned with the core testing flow:

```txt
Product -> Recipe -> Inventory -> Order -> Stock Deduction -> Report
```
