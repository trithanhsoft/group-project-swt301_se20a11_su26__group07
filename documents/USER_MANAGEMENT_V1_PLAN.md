# USER_MANAGEMENT_V1_PLAN.md

## 1. Objective

Implement a simple internal User Management feature for the Mini Coffee POS system.

This V1 is intentionally small:

- Admin can create internal accounts.
- Admin can manage role and active status.
- Admin can reset password.
- Users can view and update their own profile.
- Users can change their own password.

This V1 must reuse the existing `app_users` table and current JWT auth flow.

---

## 2. In Scope

### Admin User Management

- View user list
- Search by username, full name, email
- Filter by role and status
- Create new internal account
- Edit full name, email, role, status
- Reset password for a selected user

### User Self Service

- View current profile
- Update own full name and email
- Change own password

### Access Control

- Only Admin can access `/admin/users`
- Only authenticated users can access `/profile`
- Staff must not access User Management APIs or screens

---

## 3. Out of Scope

- Public self-registration
- Invite code
- Join business flow
- Owner role
- Workspace or multi-business flow
- Forgot password by email
- Hard delete user
- Avatar upload
- Audit log UI

---

## 4. Reuse Existing Data

Use the current `app_users` table only.

Expected fields used in V1:

```txt
id
username
email
full_name
password_hash
role
status
last_login_at
created_at
updated_at
deleted_at
```

Recommended V1 statuses:

```txt
ACTIVE
INACTIVE
```

Recommended V1 roles:

```txt
ADMIN
STAFF
```

---

## 5. Backend Plan

### Phase 1: Admin User APIs

Create `backend/src/modules/users/`:

```txt
user.routes.js
user.controller.js
user.service.js
user.validation.js optional
```

Endpoints:

```txt
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
PATCH  /api/users/:id/reset-password
```

Rules:

- Require `ADMIN` role for all `/api/users/*`
- Never return `password_hash`
- Hash passwords with bcrypt
- Reject duplicate username
- Reject duplicate email if email is used
- Reject self-deactivation
- Reject self-role-downgrade if it would lock the current admin out
- Reject deactivating the last active admin

### Phase 2: Profile APIs

Add to existing `auth` module:

```txt
PATCH /api/auth/me
PATCH /api/auth/change-password
```

Rules:

- Require authenticated user
- `PATCH /api/auth/me` updates only own profile fields
- `PATCH /api/auth/change-password` requires current password
- New password must be hashed before saving

---

## 6. Frontend Plan

### Phase 3: Admin User Screens

Create:

```txt
frontend/src/features/users/api/userApi.js
frontend/src/features/users/pages/UserListPage.jsx
frontend/src/features/users/pages/UserFormPage.jsx
```

UI scope:

- User list table
- Search input
- Role filter
- Status filter
- Create user button
- Edit user form
- Reset password action
- Inactive / active badge

Recommended routes:

```txt
/admin/users
/admin/users/new
/admin/users/:id/edit
```

### Phase 4: Profile Screen

Create:

```txt
frontend/src/features/profile/pages/ProfilePage.jsx
```

UI scope:

- Show username, role, last login if available
- Edit full name
- Edit email
- Change password form

Recommended route:

```txt
/profile
```

---

## 7. Suggested Build Order

1. Add backend user service and admin APIs
2. Add auth profile update and change-password APIs
3. Add frontend routes and sidebar/profile entry
4. Build User List page
5. Build Create/Edit User form
6. Build Reset Password action
7. Build Profile page
8. Add seed and manual test data updates if needed

---

## 8. Acceptance Criteria

### Admin User Management

- Admin can create a Staff account
- Admin can create another Admin account
- Admin can edit name, email, role, status
- Admin can set a user to `INACTIVE`
- Inactive user cannot login
- Admin can reset password and the new password works

### Profile

- Logged-in user can open `/profile`
- User can update own full name and email
- User can change own password by entering current password
- Old password no longer works after password change

### Security

- Staff cannot access `/admin/users`
- Staff cannot call `/api/users`
- API never returns `password_hash`

---

## 9. Manual Test Checklist

- Create Staff account -> login success
- Create Admin account -> login success
- Duplicate username -> clear error
- Duplicate email -> clear error
- Set user inactive -> login blocked
- Reset password -> old password fails, new password works
- Change own password -> current password required
- Staff access admin user URL -> denied
- Staff call admin user API -> denied

---

## 10. Nice To Have Later

- Force password change on first login
- Soft delete user action
- Audit log for role and password changes
- Pagination for large user list
- Import users from file
