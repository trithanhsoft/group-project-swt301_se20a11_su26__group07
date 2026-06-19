# SET_UP.md

## 1. Purpose

This file is for team members who clone the project from GitHub after the project owner has already created the Supabase cloud database and pushed the V1 source code.

Team members should only need to:

```txt
1. Clone the repository.
2. Install dependencies.
3. Copy .env.example to .env.
4. Fill environment variables provided by the team lead.
5. Run backend and frontend.
```

No member needs to create a local database.

Database is hosted on Supabase PostgreSQL cloud.

---

## 2. Required Tools

Install these tools:

```txt
Node.js
npm
Git
VS Code
Google Chrome or Microsoft Edge
```

Recommended tools:

```txt
Postman or Thunder Client
Supabase Dashboard access if assigned
```

---

## 3. Project Structure After Clone

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

---

## 4. Important Environment Rule

Never push real `.env` files to GitHub.

Only push `.env.example`.

Real secrets must stay local.

Files that must be ignored by Git:

```txt
backend/.env
frontend/.env
node_modules/
dist/
```

---

## 5. Backend Environment

Go to backend folder:

```bash
cd backend
```

Copy env example:

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux/Git Bash:

```bash
cp .env.example .env
```

Backend `.env` format:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:YOUR_DATABASE_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres?sslmode=require

JWT_SECRET=change_this_to_a_long_random_secret_for_team_dev
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

Ask the team lead for the real `DATABASE_URL` value.

Do not use frontend Supabase variables for backend database connection.

Backend uses `DATABASE_URL`, not:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

---

## 6. Frontend Environment

Go to frontend folder:

```bash
cd frontend
```

Copy env example:

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux/Git Bash:

```bash
cp .env.example .env
```

Frontend `.env` format:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Frontend does not connect directly to Supabase.

Frontend calls backend APIs only.

---

## 7. Install Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

---

## 8. Run Backend

From backend folder:

```bash
cd backend
npm run db:test
```

Expected result:

```txt
Database connection OK
```

Then run backend:

```bash
npm run dev
```

Expected backend URL:

```txt
http://localhost:5000
```

Health check:

```txt
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Mini Coffee POS API is running"
}
```

---

## 9. Run Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Expected frontend URL:

```txt
http://localhost:5173
```

---

## 10. Default Login Accounts

Use these accounts if seed data has been imported:

```txt
Admin
username: admin
password: Admin123@

Staff
username: staff
password: Staff123@
```

Admin should be redirected to Admin Dashboard.

Staff should be redirected to Staff Dashboard or POS page depending on current implementation.

---

## 11. Database Setup for Team Lead Only

Only the team lead or assigned database owner should run database scripts.

Recommended script order in Supabase SQL Editor:

```txt
1. database/supabase_schema_v1.sql
2. database/supabase_seed_v1.sql
3. database/supabase_recipe_seed_from_old_project_v1.sql optional, if using full recipe list
```

Do not ask every team member to run DB scripts unless the team uses separate Supabase projects.

---

## 12. Seed Data Notes

Basic seed data should include:

```txt
Admin user
Staff user
Products
Ingredients
Recipes
Stock quantity
Sample orders if needed
```

Recipe seed from old project only imports data into:

```txt
ingredients
products
recipes
recipe_items
```

It does not create order trigger, stock deduction trigger, or database business functions.

Order and stock logic is handled in backend service.

---

## 13. Recommended Backend Scripts

Backend `package.json` should include:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:test": "node src/scripts/testDbConnection.js",
    "seed": "node src/seed/seed.js",
    "seed:recipes": "node src/seed/recipeSeed.js"
  }
}
```

---

## 14. Recommended Frontend Scripts

Frontend `package.json` should include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 15. Common Problems

### Backend cannot connect to database

Check:

```txt
DATABASE_URL exists in backend/.env
Database password is correct
Supabase project is not paused
Internet connection is available
sslmode=require is included if needed
```

---

### Frontend cannot call backend

Check frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Check backend `.env`:

```env
CLIENT_URL=http://localhost:5173
```

Check backend is running on port 5000.

---

### Login returns invalid username or password

Check seed data:

```txt
admin / Admin123@
staff / Staff123@
```

If seed has not been run, ask team lead to import seed data.

---

### Staff can access Admin page

Check both sides:

```txt
Frontend RoleRoute
Backend role middleware
```

Never rely on frontend-only protection.

---

### Internal Server Error appears for business cases

Expected business cases should return clear messages:

```txt
Cart is empty
Product has no recipe
Insufficient stock for Milk
Access denied
```

Fix backend service error handling if only generic error is returned.

---

## 16. Basic Manual Test After Setup

After running both backend and frontend:

```txt
1. Open http://localhost:5173
2. Login as admin.
3. Confirm Admin Dashboard opens.
4. Logout.
5. Login as staff.
6. Confirm Staff Dashboard or POS page opens.
7. Try opening an Admin URL as Staff.
8. Confirm access is denied or redirected.
```

---

## 17. Git Workflow for Members

Before coding:

```bash
git pull origin main
```

Create branch:

```bash
git checkout -b feature/your-feature-name
```

After coding:

```bash
git add .
git commit -m "feat: add product list page"
git push origin feature/your-feature-name
```

Open Pull Request into `main`.

Do not commit `.env`.
