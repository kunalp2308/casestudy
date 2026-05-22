# Task Tracker

React + FastAPI + MySQL task tracker for managing projects, tasks, users, and roles.

Docker is intentionally left out for now. The backend exposes working CRUD APIs, Google SSO authentication, and connects to MySQL through:

```text
mysql+pymysql://root:Root%40123@localhost:3306/task_tracker
```

## Project Structure

```text
backend/   FastAPI API, SQLAlchemy models, MySQL connection
frontend/  React UI powered by Vite
```

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

Before starting the backend, create the database if it does not already exist:

```sql
CREATE DATABASE task_tracker;
```

Create `backend/.env` from `backend/.env.example` and set:

```text
GOOGLE_CLIENT_ID=...
JWT_SECRET_KEY=replace-this-with-a-long-random-secret
GOOGLE_ADMIN_EMAILS=your.admin.email@example.com
```

In Google Cloud Console, add this authorized JavaScript origin:

```text
http://localhost:5173
```

With `BOOTSTRAP_FIRST_GOOGLE_USER_AS_ADMIN=true`, the first Google user to sign in becomes an admin. Users listed in `GOOGLE_ADMIN_EMAILS` are also granted the admin role on login.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

The UI runs at `http://localhost:5173`.

Set `VITE_API_URL` if the backend URL changes. See `frontend/.env.example`.
Set `VITE_GOOGLE_CLIENT_ID` to the same Google client ID used by the backend.
