# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **PC Builder Shop / TECHLAB** e-commerce app under `project/`, split into two services:

- **Backend** — Laravel 13 / PHP 8.3 REST API in `project/backend` (runs on `http://localhost:8000`).
- **Frontend** — React 19 + Vite SPA in `project/frontend` (Vite dev server on port `5173`, proxies `/api` and `/sanctum` to `localhost:8000`).

The update script already installs Composer and npm dependencies for both services on startup. Standard commands are documented in `README.md`, `project/backend/composer.json`, and `project/frontend/package.json`.

### Database (non-obvious)
- The committed `project/backend/.env` was changed from MySQL to **SQLite** (`DB_CONNECTION=sqlite`) so the backend runs with no external DB server. **Please merge this change so future agents remember it** — otherwise `.env` reverts to MySQL and the API won't connect (there is no MySQL server in this environment).
- The SQLite file lives at `project/backend/database/database.sqlite` (untracked; persisted in the VM snapshot). If it is ever missing, recreate it and load data with:
  ```bash
  cd project/backend
  touch database/database.sqlite
  php artisan migrate --force
  php artisan db:seed --class=FillDatabaseSeeder --force
  ```
- Catalog/user data comes from `FillDatabaseSeeder` (NOT the default `DatabaseSeeder`, which only creates one test user). It seeds 30 users, 240 components, 30 prebuilt PCs. Note `database/seeders/OldFDS.php` declares the same `FillDatabaseSeeder` class and is skipped by PSR-4 autoload — ignore the warning.

### Seeded login accounts
- Admin: `admin@test.com` / `admin`
- Manager: `manager@test.com` / `manager`
- Users: `user1@test.com` / `user1` … `user28@test.com` / `user28`

### Running the services (dev)
- Backend: `cd project/backend && php artisan serve --host=0.0.0.0 --port=8000` (the `composer dev` script also starts queue/pail/backend-vite, which are optional and not needed for the React app).
- Frontend: `cd project/frontend && npm run dev -- --host 0.0.0.0`.

### Lint / test
- Backend tests: `cd project/backend && php artisan test` (only the default Laravel example tests exist).
- Frontend lint: `cd project/frontend && npm run lint` — this currently reports pre-existing lint errors in the app source (e.g. unused `motion` imports, `__dirname` in `vite.config.js`). The tooling works; the errors are pre-existing code issues, not an environment problem.
