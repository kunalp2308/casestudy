# Frontend

React UI for the Task Tracker application, powered by Vite.

## Capabilities

- Google SSO login through the backend auth flow
- Dashboard summary for projects, tasks, users, and roles
- Project management views
- Task management views with project and status filters
- User management with single-role assignment
- Role management
- Toast notifications for common actions

## Run

```powershell
npm install
npm run dev
```

The UI runs at `http://localhost:5173`.

The backend should be running at `http://localhost:8000` before signing in or loading data.

## Environment

Create `frontend/.env` if the API URL differs from the default:

```text
VITE_API_URL=http://localhost:8000/api
```

Google login redirects to the backend `/auth/google/login` endpoint, so Google OAuth client settings live in the backend `.env`.

## Scripts

```powershell
npm run dev
npm run build
npm run preview
```
