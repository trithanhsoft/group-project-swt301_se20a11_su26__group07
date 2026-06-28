# REPORTS_V1_PLAN.md

## 1. Objective

Implement Reports V1 for Admin in the Mini Coffee POS system.

This feature should cover:

- Daily revenue report
- Best-selling product report
- Low-stock ingredient report
- Admin-only access control
- Real backend data instead of frontend local mock fallback

This should stay simple, read-only, and aligned with the core business flow:

```txt
Product -> Recipe -> Inventory -> Order -> Stock Deduction -> Report
```

---

## 2. Why This Next

This is the best next feature after POS Order because:

- Successful orders now exist as the real source for revenue and best-selling statistics.
- Stock deduction now exists as the real source for low-stock warnings.
- Frontend already has these report files:
  - `frontend/src/features/reports/pages/ReportsPage.jsx`
  - `frontend/src/features/reports/api/reportApi.js`
- Backend does not yet have:
  - `backend/src/modules/reports/`
- Real database views already exist for reporting.

So this feature can replace the current mock-style fallback with real Admin reporting backed by Supabase views.

---

## 3. In Scope

### Admin Report Read Flow

- View daily revenue from database
- View best-selling products from database
- View low-stock ingredients from database
- Refresh report data from UI
- Show proper loading, empty, and error states

### Business Rules

- Only successful orders should affect revenue and best-selling reports
- Low-stock data should come from the database view, not frontend local calculation
- Reports are read-only in V1
- Empty report result should return an empty list, not an API error

### Access Control

- Only authenticated `ADMIN` can call report APIs
- Staff should not access Admin reports in V1

---

## 4. Out of Scope

- CSV, Excel, or PDF export
- Charts or dashboard visualization beyond the existing table/card UI
- Custom date grouping by week or month
- Drill-down from report row to order detail
- Staff-facing reports
- Admin order history report UI based on `v_order_history`
- Rebuilding report logic from raw tables when a view already exists

---

## 5. V1 Design Decision

This feature should be treated as a read-only reporting module on top of existing database views.

Important V1 rules:

- Backend should query reporting views directly instead of rebuilding heavy aggregation logic in application code.
- Backend should map raw database field names to stable frontend-friendly response fields.
- Frontend should stop calculating report data from localStorage fallback.
- Frontend may still calculate display-only summary cards from returned API data.
- Dashboard summary should remain under `/api/dashboard/summary` unless the team later needs a separate report summary contract.

This keeps V1 small, reliable, and easy to verify.

---

## 6. Safe View Contracts Confirmed By Real Database

The following public views already exist in the real database:

```txt
v_daily_revenue
v_best_selling_products
v_low_stock_ingredients
v_order_history
```

### Confirmed `v_daily_revenue` Columns

```txt
order_date date
total_orders bigint
total_revenue numeric
```

### Confirmed `v_best_selling_products` Columns

```txt
product_id uuid
product_name_snapshot text
total_quantity bigint
total_revenue numeric
```

### Confirmed `v_low_stock_ingredients` Columns

```txt
id uuid
name text
unit USER-DEFINED
current_stock numeric
low_stock_threshold numeric
created_at timestamptz
updated_at timestamptz
```

### Confirmed `v_order_history` Columns

```txt
id uuid
order_code text
total_amount numeric
status USER-DEFINED
created_at timestamptz
staff_name text
item_count bigint
```

### Current Reality Check

- In the current environment, these report views return empty rows right now.
- That means the report module must handle empty states cleanly.
- Manual QA must create successful orders or low-stock situations before expecting visible report data.

### Important Frontend Mismatch Already Visible

The current `ReportsPage.jsx` assumes fields such as:

```txt
product_name
quantity_sold
```

But the real best-selling view exposes:

```txt
product_name_snapshot
total_quantity
```

Recommended V1 direction:

- Do not expose raw view names directly to the page.
- Map them in backend service responses to stable camelCase names.

---

## 7. Recommended API Contract

Create:

```txt
backend/src/modules/reports/
report.routes.js
report.controller.js
report.service.js
report.validation.js optional
```

Mount in:

```txt
backend/src/app.js
```

### Endpoint 1: Daily Revenue

```txt
GET /api/reports/revenue
```

Recommended response item shape:

```json
{
  "orderDate": "2026-06-20",
  "totalOrders": 4,
  "totalRevenue": 220000
}
```

Optional future-friendly query params:

```txt
dateFrom
dateTo
```

### Endpoint 2: Best-Selling Products

```txt
GET /api/reports/best-selling-products
```

Recommended response item shape:

```json
{
  "productId": "eceb609b-0c39-4c88-901d-26555b9b5012",
  "productName": "Americano Da - L",
  "quantitySold": 12,
  "totalRevenue": 660000
}
```

Optional future-friendly query params:

```txt
limit
```

### Endpoint 3: Low-Stock Ingredients

```txt
GET /api/reports/low-stock-ingredients
```

Recommended response item shape:

```json
{
  "id": "6b68a4f1-7867-45f7-9628-6dca2fb50fb8",
  "name": "Sua tuoi",
  "unit": "ML",
  "currentStock": 450,
  "lowStockThreshold": 500,
  "updatedAt": "2026-06-20T10:00:00.000Z"
}
```

Recommended API behavior:

- Return arrays for all three endpoints
- Return `200` with empty arrays when no data exists
- Return `403` for non-admin access
- Keep sorting stable and explicit in service logic

Recommended sort direction:

- Revenue: newest `orderDate` first
- Best-selling: `quantitySold` descending, then `totalRevenue` descending
- Low stock: most severe shortage first

---

## 8. Backend Plan

### Phase 1: Reports Module Setup

- Create `reports` backend module
- Add authenticated and role-protected routes
- Mount `/api/reports` in the main app

### Phase 2: Revenue Service

- Read from `v_daily_revenue`
- Apply optional `dateFrom` and `dateTo` filters if implemented
- Map snake_case fields to camelCase response objects
- Return ordered rows

### Phase 3: Best-Selling Service

- Read from `v_best_selling_products`
- Map `product_name_snapshot` to `productName`
- Map `total_quantity` to `quantitySold`
- Keep revenue value numeric-safe in response mapping

### Phase 4: Low-Stock Service

- Read from `v_low_stock_ingredients`
- Return inventory warning rows directly from the view
- Keep unit, current stock, threshold, and updated time visible

### Phase 5: Error and Access Handling

- Reject non-admin access clearly
- Keep empty data as success responses
- Use centralized API error format for unexpected failures

---

## 9. Frontend Plan

Reuse existing files:

```txt
frontend/src/features/reports/api/reportApi.js
frontend/src/features/reports/pages/ReportsPage.jsx
```

### Phase 6: API Alignment

- Keep using the three existing report endpoints
- Update the page to consume real backend field names after backend mapping
- Remove all localStorage mock fallback logic

### Phase 7: UI Cleanup

- Keep the existing refresh action
- Keep summary cards
- Show empty states when no orders or no low-stock rows exist
- Show backend error messages instead of switching silently to mock mode

### Phase 8: Data Table Mapping

Revenue table should render:

- `orderDate`
- `totalOrders`
- `totalRevenue`

Best-selling table should render:

- `productName`
- `quantitySold`
- `totalRevenue`

Low-stock table should render:

- `name`
- `currentStock`
- `lowStockThreshold`
- `unit`

Important V1 alignment:

- Frontend should not reconstruct revenue, best-seller, or low-stock data locally
- Frontend should trust report APIs as the source of truth

---

## 10. Suggested Build Order

1. Confirm real report view columns
2. Create backend `reports` module
3. Build `GET /api/reports/revenue`
4. Build `GET /api/reports/best-selling-products`
5. Build `GET /api/reports/low-stock-ingredients`
6. Mount `/api/reports` in backend app
7. Connect `ReportsPage` to real backend response mapping
8. Remove report page mock fallback
9. Verify admin-only access behavior
10. Regression test dashboard and reports for data consistency

---

## 11. Acceptance Criteria

### Admin Report Page

- Admin can open `/admin/reports`
- Revenue report loads from database
- Best-selling report loads from database
- Low-stock report loads from database
- Refresh button reloads data successfully

### Business Rules

- Report data reflects successful orders only
- Empty views return clean empty states
- Non-admin users cannot access report APIs
- Frontend no longer depends on localStorage mock report calculation

### Data Contract

- Best-selling response exposes stable product name and sold quantity fields
- Low-stock response exposes stock and threshold fields clearly
- Revenue rows are ordered newest first

---

## 12. Manual Test Checklist

- Login as `admin` -> `/admin/reports` opens
- Report page loads with no crash when database has no report rows
- Revenue table empty state appears correctly when there are no orders
- Best-selling table empty state appears correctly when there are no sold products
- Low-stock table empty state appears correctly when all ingredients are safe
- Login as `staff` and try Admin report route/API -> blocked
- Create one successful POS order -> revenue report updates after refresh
- Create multiple successful orders on the same day -> daily totals aggregate correctly
- Sell the same product multiple times -> best-selling quantity increases correctly
- Lower ingredient stock below threshold -> ingredient appears in low-stock report
- Refresh dashboard and reports -> counts and revenue stay consistent

---

## 13. Risks And Decisions

### Decision 1: View-First Reporting

Recommended V1:

- Use reporting views as the source of truth
- Do not duplicate the same aggregation logic in Node.js unless a view is missing

### Decision 2: Backend Mapping Layer

Recommended V1:

- Hide raw database column names from the page
- Return consistent camelCase DTOs from backend services

### Decision 3: Empty Data Is Normal

Recommended V1:

- Treat empty result sets as a valid business state
- Do not convert "no rows" into API failure

### Decision 4: No Report Mock Mode

Recommended V1:

- Remove localStorage fallback from the report page
- Show explicit errors when the backend is unavailable

### Decision 5: Keep `v_order_history` For Later

Recommended V1:

- Do not expand report scope just because `v_order_history` exists
- Save admin order-history analytics or export flows for a later feature

---

## 14. Recommended Next After Reports

After this feature, the next best follow-up areas should be:

1. Admin order reporting or export based on `v_order_history`
2. Report filters and date-range UX
3. CSV or Excel export

Reason:

- `v_order_history` is already available but not yet used in the Admin report UI
- Export and filters add value only after the base reports are trustworthy
- V1 should first prove that the core report data is correct end-to-end
