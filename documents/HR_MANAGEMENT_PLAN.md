# HR_MANAGEMENT_PLAN.md

## 1. Objective

Build a comprehensive Human Resources (HR) Management subsystem for Mini Coffee POS & Inventory system.
The system will allow:
- Staff members to register availability, view assigned shifts, track calculated salary, and create leave or shift swap requests.
- Admins to view staff availability, assign shifts, process requests, and monitor overall HR costs.

---

## 2. Core Databases (Already Applied)

- `shifts`: Work shift metadata and standard hourly rates.
- `staff_availability`: Register times when staff members are free.
- `staff_shifts`: Work shift schedules assigned to staff members. Automatically logs hourly rate snapshot and calculates salary.
- `staff_requests`: Staff requests for leaves or shift swaps.

---

## 3. Phased Implementation Plan

### Phase 1: Database Seed & Backend API Foundation
- Update database seed to include basic shifts (Ca Sáng, Ca Chiều, Ca Tối) and verify table constraints.
- Create `/api/hr` endpoint structure in Express backend under `backend/src/modules/hr/`.
- Build services, controllers, and routes to perform CRUD operations on availability, shifts, shift assignments, requests, and cost statistics.
- Verify security: Ensure `STAFF` cannot modify other users' shifts, availability, or process requests. Ensure `ADMIN` has full access to administrative tasks.

### Phase 2: Frontend API Connection & Staff HR Views
- Create `frontend/src/features/hr/api/hrApi.js` to connect all backend endpoints.
- Create `StaffHRPage.jsx` containing:
  - Tab 1: Shift Calendar & Availability Registry.
  - Tab 2: Requests Inbox (Create leave/swap requests).
  - Tab 3: Monthly Salary Stub (Summarize worked shifts, total hours, and estimated payout).
- Update sidebar navigation to direct `STAFF` users to the new page.

### Phase 3: Admin HR Views & Cost Reports
- Create `AdminHRPage.jsx` containing:
  - Tab 1: Shift Assign Planner (Grid visualizing staff availability, allowing Admin to click and assign shifts).
  - Tab 2: Employee Request Processor (View requests, input admin notes, and Approve/Reject).
  - Tab 3: HR Cost Dashboard (Grouped costs by employee and timeframe).
- Update sidebar navigation to direct `ADMIN` users to the new page.

### Phase 4: Integration, Edge-case Validations & Verification
- Integrate shift-assign changes: Automatically check conflicts when scheduling (prevent double-booking the same staff on overlapping times on the same date).
- Automatically trigger shift modifications or cancellations when a leave request is approved.
- Run complete manual and automated test suites to ensure build sanity.
