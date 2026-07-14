# STRUCTURE.md

## 1. Purpose

This file tells both team members and AI coding tools where to place code, where to find UI reference screens, and how the project should be organized.

The project must stay feature-based and easy to test.

---

## 2. Root Structure

Expected root folder:

```txt
Mini_Coffee_POS_SWT/
├── backend/
├── frontend/
├── database/
├── docs/
├── AI_GUIDE.md
├── SET_UP.md
└── STRUCTURE.md
```

Recommended docs folder:

```txt
docs/
├── RECIPE_SEED_GUIDE.txt
├── test-plan/
├── test-cases/
└── screens/
```

Database folder:

```txt
database/
├── supabase_schema_v1.sql
├── supabase_seed_v1.sql
└── supabase_recipe_seed_from_old_project_v1.sql
```

---

## 3. Frontend Structure

Frontend framework:

```txt
React + Vite + JavaScript
```

Expected frontend structure:

```txt
frontend/
├── public/
│   └── Screens/
│       └── ...static UI reference screens
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── routes.jsx
│   │   └── providers/
│   │       └── AuthProvider.jsx
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── feedback/
│   │   │   ├── Alert.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   ├── forms/
│   │   │   ├── FormInput.jsx
│   │   │   ├── FormSelect.jsx
│   │   │   └── FormTextarea.jsx
│   │   └── layout/
│   │       ├── AppLayout.jsx
│   │       ├── AuthLayout.jsx
│   │       ├── Header.jsx
│   │       ├── Sidebar.jsx
│   │       └── PageHeader.jsx
│   ├── constants/
│   │   ├── roles.js
│   │   ├── routes.js
│   │   ├── productStatus.js
│   │   └── units.js
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── profile/
│   │   ├── products/
│   │   ├── ingredients/
│   │   ├── stock/
│   │   ├── recipes/
│   │   ├── pos/
│   │   ├── orders/
│   │   └── reports/
│   ├── hooks/
│   ├── services/
│   │   ├── apiClient.js
│   │   └── tokenService.js
│   ├── styles/
│   │   ├── variables.css
│   │   ├── global.css
│   │   └── utilities.css
│   └── utils/
│       ├── currency.js
│       ├── date.js
│       └── validators.js
├── .env.example
├── package.json
└── vite.config.js
```

---

## 4. Frontend Feature Pattern

Every feature should follow this pattern:

```txt
features/<feature-name>/
├── api/
│   └── <feature>Api.js
├── components/
│   └── ...feature components
├── hooks/
│   └── use<Feature>.js
└── pages/
    └── ...feature pages
```

Example Product feature:

```txt
features/products/
├── api/
│   └── productApi.js
├── components/
│   ├── ProductForm.jsx
│   ├── ProductTable.jsx
│   └── ProductStatusBadge.jsx
├── hooks/
│   └── useProducts.js
└── pages/
    ├── ProductListPage.jsx
    └── ProductFormPage.jsx
```

Example POS feature:

```txt
features/pos/
├── api/
│   └── posApi.js
├── components/
│   ├── ProductGrid.jsx
│   ├── CartPanel.jsx
│   ├── CartItemRow.jsx
│   └── OrderSuccessModal.jsx
├── hooks/
│   └── useCart.js
└── pages/
    └── POSPage.jsx
```

---

## 5. Frontend Route Map

Public routes:

```txt
/login
```

Protected shared routes:

```txt
/profile
```

Admin routes:

```txt
/admin/dashboard
/admin/users
/admin/users/new
/admin/users/:id/edit
/admin/products
/admin/products/new
/admin/products/:id/edit
/admin/ingredients
/admin/ingredients/new
/admin/ingredients/:id/edit
/admin/stock
/admin/stock/transactions
/admin/recipes
/admin/recipes/new
/admin/recipes/:id/edit
/admin/reports
```

Staff routes:

```txt
/staff/dashboard
/staff/pos
/staff/orders
/staff/orders/:id
```

Default redirect:

```txt
/ -> /login if not logged in
/ -> /admin/dashboard if Admin
/ -> /staff/pos or /staff/dashboard if Staff
```

---

## 6. UI Screen Reference Rule

Original screen files are reference only.

Expected source:

```txt
frontend/public/Screens/
```

or if moved to docs:

```txt
docs/screens/
```

When AI or member implements a page:

```txt
1. Open the matching screen reference.
2. Identify layout, fields, buttons, table columns, and states.
3. Rebuild it as React components.
4. Put page code in the correct feature folder.
5. Put shared UI into components/common, components/forms, or components/layout.
6. Do not paste raw HTML directly without cleanup.
```

Suggested mapping:

```txt
Login screen -> features/auth/pages/LoginPage.jsx
Admin dashboard screen -> features/dashboard/pages/AdminDashboardPage.jsx
Staff/POS dashboard screen -> features/dashboard/pages/StaffDashboardPage.jsx
User management screen -> features/users/pages/UserListPage.jsx
User add/edit screen -> features/users/pages/UserFormPage.jsx
Profile screen -> features/profile/pages/ProfilePage.jsx
Product management screen -> features/products/pages/ProductListPage.jsx
Product add/edit screen -> features/products/pages/ProductFormPage.jsx
Ingredient management screen -> features/ingredients/pages/IngredientListPage.jsx
Ingredient add/edit screen -> features/ingredients/pages/IngredientFormPage.jsx
Stock import/adjust screen -> features/stock/pages/StockAdjustPage.jsx
Stock transaction history screen -> features/stock/pages/StockTransactionPage.jsx
Recipe management screen -> features/recipes/pages/RecipeListPage.jsx
Recipe add/edit screen -> features/recipes/pages/RecipeFormPage.jsx
POS screen -> features/pos/pages/POSPage.jsx
Order history screen -> features/orders/pages/OrderHistoryPage.jsx
Order detail screen -> features/orders/pages/OrderDetailPage.jsx
Reports screen -> features/reports/pages/ReportsPage.jsx
```

---

## 7. Backend Structure

Backend framework:

```txt
Node.js + Express + pg
```

Expected backend structure:

```txt
backend/
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── constants/
│   │   ├── roles.js
│   │   ├── orderStatus.js
│   │   ├── productStatus.js
│   │   └── stockTransactionTypes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── products/
│   │   ├── ingredients/
│   │   ├── stock/
│   │   ├── recipes/
│   │   ├── orders/
│   │   └── reports/
│   ├── scripts/
│   │   └── testDbConnection.js
│   ├── seed/
│   │   ├── seed.js
│   │   └── recipeSeed.js
│   └── utils/
│       ├── ApiError.js
│       ├── asyncHandler.js
│       ├── generateToken.js
│       └── response.js
├── .env.example
└── package.json
```

---

## 8. Backend Module Pattern

Every backend feature module should follow this pattern:

```txt
modules/<feature>/
├── <feature>.routes.js
├── <feature>.controller.js
├── <feature>.service.js
└── <feature>.validation.js
```

Example Auth module:

```txt
modules/auth/
├── auth.routes.js
├── auth.controller.js
├── auth.service.js
└── auth.validation.js
```

Example Orders module:

```txt
modules/orders/
├── order.routes.js
├── order.controller.js
├── order.service.js
└── order.validation.js
```

---

## 9. Backend API Route Map

Health:

```txt
GET /api/health
```

Auth:

```txt
POST /api/auth/login
GET  /api/auth/me
PATCH /api/auth/me
PATCH /api/auth/change-password
POST /api/auth/logout optional frontend clear token only
```

Dashboard:

```txt
GET /api/dashboard/summary
```

Users:

```txt
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
PATCH  /api/users/:id/reset-password
```

Products:

```txt
GET    /api/products
POST   /api/products
GET    /api/products/:id
PATCH  /api/products/:id
DELETE /api/products/:id
GET    /api/products/pos/available
```

Ingredients:

```txt
GET    /api/ingredients
POST   /api/ingredients
GET    /api/ingredients/:id
PATCH  /api/ingredients/:id
DELETE /api/ingredients/:id
```

Stock:

```txt
POST /api/stock/import
POST /api/stock/adjust
GET  /api/stock/transactions
```

Recipes:

```txt
GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/:id
GET    /api/recipes/product/:productId
PATCH  /api/recipes/:id
DELETE /api/recipes/:id
```

Orders:

```txt
POST /api/orders
GET  /api/orders
GET  /api/orders/:id
```

Reports:

```txt
GET /api/reports/summary
GET /api/reports/revenue
GET /api/reports/best-selling-products
GET /api/reports/low-stock-ingredients
```

---

## 10. Role Access Matrix

Admin can access:

```txt
/admin/dashboard
/admin/users
/admin/products
/admin/ingredients
/admin/stock
/admin/recipes
/admin/reports
/profile
```

Staff can access:

```txt
/staff/dashboard
/staff/pos
/staff/orders
/staff/orders/:id
/profile
```

Backend protection:

```txt
Admin APIs require role ADMIN.
User Management APIs require role ADMIN.
Profile APIs require authenticated user only.
Staff POS order API requires role STAFF.
Order history can be STAFF, or ADMIN if the team decides Admin can view all orders.
Reports require role ADMIN.
```

Default rule:

```txt
Only Staff creates POS orders.
Admin manages data and reports.
```

---

## 11. Database Structure

Core database tables:

```txt
app_users
products
ingredients
recipes
recipe_items
orders
order_items
stock_transactions
```

Core database views:

```txt
v_pos_available_products
v_low_stock_ingredients
v_daily_revenue
v_best_selling_products
v_order_history
```

Important notes:

```txt
orders only store successful orders.
failed orders are not inserted.
stock_transactions record stock import, adjust, and order deduction.
recipe_items define ingredient quantity for one product unit.
order_items store product name and price snapshots.
```

---

## 12. Database Relationship Summary

```txt
app_users 1 - N orders
products 1 - 1 recipes
recipes 1 - N recipe_items
ingredients 1 - N recipe_items
ingredients 1 - N stock_transactions
orders 1 - N order_items
orders 1 - N stock_transactions
products 1 - N order_items
```

---

## 13. POS Order Logic Location

Order logic must be placed in:

```txt
backend/src/modules/orders/order.service.js
```

Do not place order stock deduction logic in:

```txt
React frontend
SQL trigger
hidden database function
route file
controller file
```

Required service steps:

```txt
validate cart
load products
check active products
load recipes
combine required ingredients
check stock
begin transaction
insert order
insert order items
update ingredients
insert stock transactions
commit transaction
rollback on error
```

---

## 14. Code Placement Examples

Login page:

```txt
frontend/src/features/auth/pages/LoginPage.jsx
frontend/src/features/auth/api/authApi.js
frontend/src/features/auth/hooks/useLogin.js
backend/src/modules/auth/auth.routes.js
backend/src/modules/auth/auth.controller.js
backend/src/modules/auth/auth.service.js
```

Dashboard:

```txt
frontend/src/features/dashboard/pages/AdminDashboardPage.jsx
frontend/src/features/dashboard/pages/StaffDashboardPage.jsx
frontend/src/features/dashboard/api/dashboardApi.js
backend/src/modules/dashboard/dashboard.routes.js
backend/src/modules/dashboard/dashboard.controller.js
backend/src/modules/dashboard/dashboard.service.js
```

Users:

```txt
frontend/src/features/users/pages/UserListPage.jsx
frontend/src/features/users/pages/UserFormPage.jsx
frontend/src/features/users/api/userApi.js
frontend/src/features/profile/pages/ProfilePage.jsx
backend/src/modules/users/user.routes.js
backend/src/modules/users/user.controller.js
backend/src/modules/users/user.service.js
backend/src/modules/auth/auth.routes.js
backend/src/modules/auth/auth.controller.js
backend/src/modules/auth/auth.service.js
```

Products:

```txt
frontend/src/features/products/pages/ProductListPage.jsx
frontend/src/features/products/pages/ProductFormPage.jsx
backend/src/modules/products/product.routes.js
backend/src/modules/products/product.controller.js
backend/src/modules/products/product.service.js
```

POS Order:

```txt
frontend/src/features/pos/pages/POSPage.jsx
frontend/src/features/pos/components/CartPanel.jsx
frontend/src/features/pos/components/ProductGrid.jsx
backend/src/modules/orders/order.routes.js
backend/src/modules/orders/order.controller.js
backend/src/modules/orders/order.service.js
```

---

## 15. AI Instruction When Modifying Code

When asking AI to code, always include:

```txt
1. Read AI_GUIDE.md first.
2. Read STRUCTURE.md first.
3. Do not change project scope.
4. Put code in the correct feature folder.
5. Keep frontend calling backend only.
6. Do not expose secrets in frontend.
7. Keep order deduction logic in backend service.
8. Use existing shared components when possible.
9. Do not duplicate API client logic.
10. Return full file content when changing a file.
```

---

## 16. First V1 Target

V1 should include only:

```txt
Backend database connection
Backend health API
Backend login API
Backend me API
Backend dashboard summary API
Frontend login page
Frontend route guard
Frontend dashboard page
Basic Admin/Staff redirect
```

Approved next feature after V1:

```txt
User Management V1
- Admin user list
- Admin create internal account
- Admin update role/status
- Admin reset password
- User profile page
- User change own password
```

After V1 is pushed, other members can implement feature modules independently.
