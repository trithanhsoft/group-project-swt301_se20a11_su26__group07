# AI_GUIDE.md

## 1. Project Identity

Project name: Mini Coffee POS & Inventory System  
Subject: SWT301 - Software Testing  
Project type: Web application for manual testing practice  
Database strategy: Supabase PostgreSQL cloud only, no local database.

Tech stack:

- Frontend: React + Vite + JavaScript
- Backend: Node.js + Express
- Database: Supabase PostgreSQL cloud
- Authentication: custom login using `app_users` table, bcrypt password hash, backend JWT

Main purpose:

Build a small POS and inventory system for a mini coffee shop. The system must be easy to test, easy to debug, and easy for team members to extend by feature.

Main business flow:

```txt
Admin prepares data:
Ingredient -> Product -> Recipe -> Stock Import

Staff sells at counter:
POS Cart -> Check Product -> Check Recipe -> Check Stock -> Create Order -> Deduct Stock -> Save Stock Transaction

Admin checks result:
Order History -> Reports -> Low Stock Ingredients
```

The most important testing flow is:

```txt
Product -> Recipe -> Inventory -> Order -> Stock Deduction -> Report
```

---

## 2. Scope Lock

Do not add new features unless the team lead confirms.

In scope:

- Login and Authorization
- Admin Dashboard
- Staff Dashboard / POS Dashboard
- Product Management
- Ingredient Management
- Stock Import / Stock Adjustment
- Recipe Management
- POS Order
- Order History
- Basic Reports

Out of scope:

- Payment gateway
- Voucher / Promotion
- Loyalty / Membership
- Customer app
- Delivery
- Multi-branch
- AI prediction
- Supabase Auth
- Direct frontend database access
- Complex business workspace or onboarding database flow

If a UI reference screen contains extra flows, keep them as reference only. Do not create backend/database features for them unless requested.

---

## 3. Architecture Rule

Use this architecture:

```txt
React Frontend -> Node.js Express Backend -> Supabase PostgreSQL Cloud
```

Frontend must not connect directly to Supabase database.

Frontend must call backend APIs only:

```txt
VITE_API_BASE_URL=http://localhost:5000/api
```

Backend connects to Supabase PostgreSQL using:

```txt
DATABASE_URL=postgresql://...
```

Do not put database password, Supabase secret key, service role key, or JWT secret in frontend code.

---

## 4. Core Business Rules

Always follow these rules:

1. User must login before using internal screens.
2. Admin can manage products, ingredients, stock, recipes, users if needed, and reports.
3. Staff can create POS orders and view order history.
4. Staff must not access Admin screens or Admin APIs.
5. Ingredient name cannot be empty.
6. Ingredient stock cannot be negative.
7. Stock import or stock adjustment quantity must be valid.
8. Product name cannot be empty.
9. Product price must be greater than 0.
10. Product status can be `ACTIVE` or `INACTIVE`.
11. Inactive products must not be sold on POS.
12. A product must have a valid recipe before it can be sold.
13. Recipe ingredient quantity must be greater than 0.
14. Order cannot be created from an empty cart.
15. Order can only be created if all ingredients have enough stock.
16. If order fails, do not create order, do not create order items, do not deduct stock, and do not create stock transactions.
17. If order succeeds, stock must decrease according to recipe quantity multiplied by ordered product quantity.
18. Every successful stock deduction must create a `stock_transactions` record.
19. Order History only shows successful orders.
20. Reports only count successful orders.

---

## 5. Authentication Rules

Use custom authentication.

Database table:

```txt
app_users
```

Login input:

```txt
username
password
```

Backend login flow:

```txt
1. Find user by username.
2. Reject if user does not exist.
3. Reject if user status is INACTIVE.
4. Compare password with password_hash using bcrypt.
5. Reject wrong password with clear error message.
6. Generate JWT.
7. Return user profile without password_hash.
```

JWT payload should contain:

```txt
userId
username
role
```

Never return `password_hash` to frontend.

---

## 6. Backend Coding Rules

Use feature-based modules.

Each backend module should follow this pattern:

```txt
modules/<feature>/
├── <feature>.routes.js
├── <feature>.controller.js
├── <feature>.service.js
└── <feature>.validation.js   optional
```

Rules:

- Route files only define endpoints and middleware.
- Controller files only read request data, call service, and return response.
- Service files contain business logic and database queries.
- Do not put SQL and business logic directly in route files.
- Use `asyncHandler` for async controller errors.
- Use `ApiError` for expected errors.
- Use centralized error middleware.
- Use role middleware for protected Admin/Staff APIs.

Example response format:

Success:

```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": []
}
```

---

## 7. Database Rules

The project uses Supabase PostgreSQL cloud.

Core tables:

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

Core views:

```txt
v_pos_available_products
v_low_stock_ingredients
v_daily_revenue
v_best_selling_products
v_order_history
```

Database scripts should be stored in:

```txt
database/
```

Suggested files:

```txt
database/supabase_schema_v1.sql
database/supabase_seed_v1.sql
database/supabase_recipe_seed_from_old_project_v1.sql
```

Do not create hidden database triggers for order deduction.

Allowed database trigger:

```txt
updated_at trigger only
```

Order checking and stock deduction must stay in backend service so the team can test and debug clearly.

---

## 8. POS Order Service Rule

The order service is the most important backend logic.

Required flow:

```txt
1. Check logged-in user.
2. Check role is STAFF.
3. Check cart is not empty.
4. Load products from database.
5. Reject missing products.
6. Reject inactive products.
7. Load recipe for each product.
8. Reject products without recipe.
9. Calculate order item subtotal.
10. Calculate total amount.
11. Combine required ingredients across all cart items.
12. Check current stock for each ingredient.
13. Reject insufficient stock and identify ingredient name.
14. Start database transaction.
15. Insert order.
16. Insert order items.
17. Update ingredient stock.
18. Insert stock transactions.
19. Commit transaction.
20. Return order code and total amount.
```

Rollback rule:

```txt
If any step fails, stock must remain unchanged and no successful order should be saved.
```

Do not create partial data.

---

## 9. Frontend Coding Rules

Use React functional components only.

Frontend structure must be feature-based:

```txt
features/<feature>/pages
features/<feature>/components
features/<feature>/api
features/<feature>/hooks
```

Do not put all pages/components in `App.jsx`.

All API calls must go through:

```txt
src/services/apiClient.js
```

Use route guards:

```txt
ProtectedRoute
RoleRoute
```

Store token in one place only:

```txt
src/services/tokenService.js
```

Avoid duplicated localStorage logic across pages.

---

## 10. UI Reference Rules

Static screens from the original uploaded UI should be treated as UI reference only.

Expected location:

```txt
frontend/public/Screens/
```

or:

```txt
docs/screens/
```

Rules:

- Do not copy raw HTML directly into React without cleanup.
- Convert static screen into reusable React components.
- Keep UI clean, readable, and test-friendly.
- Do not use random icons or decorative emojis.
- Use consistent button, table, form, modal, empty, loading, and error components.
- All money values should use VND format.
- All dates should use readable format.

---

## 11. Naming Rules

Frontend:

```txt
LoginPage.jsx
DashboardPage.jsx
ProductListPage.jsx
ProductForm.jsx
productApi.js
useProducts.js
```

Backend:

```txt
auth.routes.js
auth.controller.js
auth.service.js
product.routes.js
product.controller.js
product.service.js
```

Database:

```txt
snake_case table and column names
```

JavaScript:

```txt
camelCase variables and functions
PascalCase React components
UPPER_CASE constants when needed
```

---

## 12. Error Message Rules

Use clear error messages because this is a testing project.

Examples:

```txt
Invalid username or password.
Your account is inactive.
Access denied.
Product name is required.
Product price must be greater than 0.
Ingredient name is required.
Stock quantity cannot be negative.
Cart is empty.
Product is inactive.
Product has no recipe.
Insufficient stock for Milk.
Order failed. Stock was not deducted.
```

Do not return only `Internal Server Error` for expected validation or business errors.

---

## 13. Testing Support Rules

Seed data should support these cases:

```txt
Admin login success
Staff login success
Wrong password
Inactive user
Staff cannot access Admin pages
Product active/inactive
Product with recipe
Product without recipe
Enough stock
Exactly enough stock
Insufficient stock
Order success
Order fail without stock deduction
Order history
Revenue report
Best-selling product report
Low-stock ingredient report
```

Keep data predictable so testers can calculate expected results manually.

---

## 14. Git Rules

Do not push:

```txt
.env
node_modules
dist
coverage
```

Only push:

```txt
.env.example
source code
database scripts
documentation
```

Commit messages should be simple:

```txt
chore: initialize project structure
feat: add login api
feat: add dashboard page
fix: handle inactive user login
```
