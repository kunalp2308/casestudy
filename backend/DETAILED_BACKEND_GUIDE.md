# Task Tracker Backend - Comprehensive Technical Guide

## Table of Contents

1. [Overview](#overview)
2. [Project Architecture](#project-architecture)
3. [Code Flow from Request to Response](#code-flow-from-request-to-response)
4. [Libraries and Dependencies](#libraries-and-dependencies)
5. [File Structure and Purpose](#file-structure-and-purpose)
6. [Database Setup and Connection](#database-setup-and-connection)
7. [ORM Commands and SQLAlchemy Operations](#orm-commands-and-sqlalchemy-operations)
8. [Authentication and Authorization](#authentication-and-authorization)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Step-by-Step Setup Guide](#step-by-step-setup-guide)

---

## Overview

This is a **FastAPI-based Task Tracker backend** that manages users, roles, projects, and tasks. It uses:

- **FastAPI**: Modern Python web framework for building APIs
- **SQLAlchemy**: ORM (Object-Relational Mapping) for database operations
- **PyMySQL**: MySQL database driver
- **Pydantic**: Data validation and serialization
- **JWT Authentication**: JSON Web Token for user authentication
- **Google OAuth 2.0**: Single Sign-On (SSO) support

The application follows a **layered architecture** pattern with clear separation of concerns:

- **Router Layer**: API endpoints and HTTP request handling
- **Service Layer**: Business logic and database operations
- **Database Layer**: SQLAlchemy ORM models and database connection
- **Auth Layer**: Authentication and authorization logic

---

## Project Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│                   http://localhost:5173                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    HTTP/REST Requests
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    FastAPI Application                        │
│                  http://localhost:8000                        │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              CORS Middleware Layer                       │ │
│  │  (Handles Cross-Origin requests from frontend)          │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Router Layer (Endpoints)                    │ │
│  │  ├─ /api/auth (Authentication & Google SSO)            │ │
│  │  ├─ /api/users (User management)                       │ │
│  │  ├─ /api/roles (Role management)                       │ │
│  │  ├─ /api/projects (Project management)                 │ │
│  │  └─ /api/tasks (Task management)                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           Authentication & Authorization Layer           │ │
│  │  ├─ JWT Token creation and verification                │ │
│  │  ├─ Google OAuth 2.0 flow                              │ │
│  │  ├─ Role-based access control (RBAC)                  │ │
│  │  └─ Current user dependency injection                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │             Pydantic Schema Layer                        │ │
│  │  ├─ Request validation                                 │ │
│  │  ├─ Response serialization                             │ │
│  │  └─ Custom validators                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │            Service/Business Logic Layer                  │ │
│  │  ├─ Database operation helpers                         │ │
│  │  ├─ Data validation logic                              │ │
│  │  ├─ Default role seeding                               │ │
│  │  └─ Schema-to-Model conversion                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         Configuration Layer                              │ │
│  │  ├─ Environment variable loading                        │ │
│  │  ├─ Database URL configuration                         │ │
│  │  ├─ JWT settings                                       │ │
│  │  └─ Google OAuth settings                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         SQLAlchemy ORM Layer                             │ │
│  │  ├─ Database connection pool                           │ │
│  │  ├─ Session management                                 │ │
│  │  ├─ Model definitions                                  │ │
│  │  └─ Relationship mapping                               │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    Database Queries
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  MySQL Database                              │
│            mysql://root@localhost:3306/task_tracker          │
│  ├─ users (User accounts)                                   │
│  ├─ roles (Permission roles)                                │
│  ├─ user_roles (Junction table for many-to-many)           │
│  ├─ projects (Projects container)                           │
│  └─ tasks (Individual tasks)                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Code Flow from Request to Response

### Complete Request-Response Journey

#### **Step 1: Request Arrives at FastAPI Application**

```
Client Request: GET /api/users HTTP/1.1
                Authorization: Bearer <JWT_TOKEN>
```

**File**: `app/main.py`

```python
app = FastAPI(title="Task Tracker API", version="0.1.0")
# FastAPI creates an application instance that listens for HTTP requests
```

---

#### **Step 2: CORS Middleware Processing**

**File**: `app/main.py`

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**What Happens**:

- Middleware checks if the request origin is allowed
- If origin matches frontend URL or localhost:5173, request proceeds
- CORS headers are added to the response
- Preflight OPTIONS requests are handled automatically

**Purpose**: Allows frontend to make cross-origin requests to the backend API

---

#### **Step 3: Routing to Correct Handler**

**File**: `app/main.py`

```python
app.include_router(users.router, prefix="/api")
```

FastAPI matches the request path `/api/users` to the correct router:

- `/api/auth` → `routers/auth.py`
- `/api/users` → `routers/users.py`
- `/api/roles` → `routers/roles.py`
- `/api/projects` → `routers/projects.py`
- `/api/tasks` → `routers/tasks.py`

**Example Handler** in `app/routers/users.py`:

```python
@router.get("", response_model=list[schemas.UserRead])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
```

---

#### **Step 4: Dependency Injection (FastAPI's Depends)**

**Dependency 1: Database Session** - `app/database.py`

```python
def get_db():
    db = SessionLocal()  # Creates a new SQLAlchemy session
    try:
        yield db  # Provides the session to the endpoint
    finally:
        db.close()  # Closes the session after endpoint execution
```

FastAPI automatically calls `get_db()` and injects the database session into the endpoint.

**Dependency 2: Current User** - `app/auth.py`

```python
def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    # 1. Extracts JWT token from Authorization header
    # 2. Decodes and validates the token
    # 3. Queries database for the user
    # 4. Returns the User object or raises 401 Unauthorized
```

**Flow**:

```
Request with Authorization Header
         ↓
bearer_scheme extracts "Bearer <TOKEN>"
         ↓
decode_access_token() validates JWT signature and expiration
         ↓
Query database: SELECT * FROM users WHERE id = <user_id>
         ↓
Check if user is active (is_active = True)
         ↓
Load user's roles using selectinload (eager loading)
         ↓
Return User object to endpoint
```

**Dependency 3: Role-Based Access Control** - `app/auth.py`

```python
def require_any_role(*allowed_roles: str):
    def dependency(current_user: models.User = Depends(get_current_user)) -> models.User:
        if not has_any_role(current_user, allowed_roles):
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user
    return dependency
```

Used in endpoints:

```python
def create_user(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_any_role("admin")),  # Only admin can create users
):
```

---

#### **Step 5: Request Payload Validation (Pydantic)**

**File**: `app/schemas.py`

When a POST request with JSON body arrives:

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "role_ids": [1, 2]
}
```

Pydantic automatically:

1. **Validates data types**: Checks if `role_ids` is a list of integers
2. **Validates constraints**:
   ```python
   full_name: str = Field(..., min_length=2, max_length=120)  # Length check
   email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")  # Email regex
   ```
3. **Handles missing fields**: Raises validation error if required fields are missing
4. **Type coercion**: Converts "123" (string) to 123 (integer) if possible
5. **Returns a schema object**: `UserCreate(full_name="John Doe", ...)`

**Custom Validators** - `app/schemas.py`

```python
@field_validator("end_date")
@classmethod
def end_date_cannot_be_before_start_date(cls, end_date: date | None, info):
    start_date = info.data.get("start_date")
    if start_date and end_date and end_date < start_date:
        raise ValueError("end_date cannot be before start_date")
    return end_date
```

---

#### **Step 6: Business Logic Execution**

**File**: `app/routers/users.py`

```python
@router.post("", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_any_role("admin")),
):
    # Step 1: Extract data from Pydantic schema
    data = payload.model_dump(exclude={"role_ids"})  # Excludes role_ids
    # Result: {"full_name": "John Doe", "email": "john@example.com", "is_active": True}

    # Step 2: Create SQLAlchemy model instance (not saved yet)
    user = models.User(**data)

    # Step 3: Validate and fetch role objects from database
    user.roles = ensure_role_ids_exist(db, payload.role_ids)
    # Function in services.py:
    # - Queries: SELECT * FROM roles WHERE id IN (1, 2)
    # - Checks if all role IDs exist
    # - Raises 404 if any role is missing
    # - Returns list of Role objects

    # Step 4: Add to session (marks as pending insert)
    db.add(user)

    # Step 5: Commit to database with error handling
    commit_or_409(db, "User email already exists")
    # Function in services.py:
    # - Executes: INSERT INTO users (...) VALUES (...)
    # - Catches IntegrityError (e.g., duplicate email)
    # - Raises HTTP 409 Conflict if error occurs
    # - Commits transaction on success

    # Step 6: Refresh object to get generated ID
    db.refresh(user)
    # Queries database to reload the user with auto-generated ID

    # Step 7: Return User object (will be converted to JSON by Pydantic)
    return user
```

---

#### **Step 7: Response Serialization (Pydantic)**

Pydantic schema automatically converts the SQLAlchemy model to JSON:

**File**: `app/schemas.py`

```python
class UserRead(UserBase):
    id: int
    avatar_url: str | None = None
    roles: list[RoleRead] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)  # Allows ORM mode
```

**Conversion Process**:

```
SQLAlchemy User Object
    ↓
Pydantic reads attributes using from_attributes=True (ORM mode)
    ↓
Recursively converts nested relationships:
    - user.roles → list[RoleRead]
    - role.name → str
    ↓
Handles None values and defaults
    ↓
Returns JSON serializable dict
```

---

#### **Step 8: HTTP Response Sent to Client**

```http
HTTP/1.1 201 Created
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:5173

{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "is_active": true,
  "avatar_url": null,
  "roles": [
    {
      "id": 1,
      "name": "admin",
      "description": "Can manage users, roles, projects, and tasks."
    }
  ]
}
```

---

## Libraries and Dependencies

### Core Libraries

#### **1. FastAPI (>=0.110.0)**

**Purpose**: Modern Python web framework for building APIs

**Key Features Used**:

- `@app.on_event("startup")`: Runs code on server startup
- `@router.get()`, `@router.post()`: Define HTTP endpoints
- `Depends()`: Dependency injection system
- `HTTPException`: Raise HTTP errors with status codes
- `Response`: Custom HTTP responses
- `Query()`, `Path()`, `Body()`: Extract request parameters

**Example Usage**:

```python
from fastapi import FastAPI, Depends, HTTPException, Query

app = FastAPI(title="Task Tracker API", version="0.1.0")

@app.get("/api/tasks")
def list_tasks(status: str | None = Query(None, alias="status")):
    # Query parameter: /api/tasks?status=completed
    return tasks
```

---

#### **2. Uvicorn (>=0.27.0)**

**Purpose**: ASGI web server for running FastAPI applications

**Installation Command**:

```bash
pip install "uvicorn[standard]>=0.27.0"
```

**Running the server**:

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Configuration Details**:

- `app.main:app` → Import `app` from `app/main.py`
- `--reload` → Auto-restart on file changes
- `--host 0.0.0.0` → Listen on all network interfaces
- `--port 8000` → Server runs on port 8000
- `--workers 4` → Use 4 worker processes

---

#### **3. SQLAlchemy (>=2.0.36)**

**Purpose**: Object-Relational Mapping (ORM) library for database operations

**Key Components**:

**A. Database Engine** - `app/database.py`

```python
from sqlalchemy import create_engine

engine = create_engine(
    settings.database_url,  # Connection string: mysql+pymysql://...
    pool_pre_ping=True      # Test connections before using them
)
```

**B. Session Factory** - `app/database.py`

```python
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(
    autocommit=False,  # Manual commit required
    autoflush=False,   # Manual flush required
    bind=engine        # Bind to the engine
)
```

**C. ORM Models** - `app/models.py`

```python
from sqlalchemy import Column, String, Integer, Date, Boolean, ForeignKey, Table
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    is_active = Column(Boolean, nullable=False, default=True)
```

---

#### **4. PyMySQL (>=1.1.0)**

**Purpose**: Python MySQL driver for connecting to MySQL database

**Connection URL Format**:

```
mysql+pymysql://username:password@host:port/database
mysql+pymysql://root:Root%40123@localhost:3306/task_tracker
```

**URL Components**:

- `mysql+pymysql://` → Protocol
- `root` → Username
- `Root%40123` → Password (URL encoded: @ = %40)
- `localhost:3306` → Host and port
- `task_tracker` → Database name

---

#### **5. Pydantic (>=2.6.0)**

**Purpose**: Data validation and serialization library

**Key Features Used**:

**A. BaseModel** - Define schema classes

```python
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    full_name: str
    email: str
```

**B. Field Validators** - Custom validation logic

```python
from pydantic import field_validator

@field_validator("end_date")
@classmethod
def validate_end_date(cls, v, info):
    start_date = info.data.get("start_date")
    if start_date and v and v < start_date:
        raise ValueError("end_date cannot be before start_date")
    return v
```

**C. ConfigDict** - Schema configuration

```python
from pydantic import ConfigDict

class UserRead(BaseModel):
    id: int
    full_name: str
    model_config = ConfigDict(from_attributes=True)  # ORM mode
```

**D. model_dump()** - Convert schema to dict

```python
data = payload.model_dump()  # All fields
data = payload.model_dump(exclude={"role_ids"})  # Exclude specific fields
data = payload.model_dump(exclude_unset=True)  # Only fields that were set
```

---

#### **6. Python-dotenv (>=1.0.0)**

**Purpose**: Load environment variables from `.env` file

**Usage** - `app/config.py`

```python
from dotenv import load_dotenv
import os

ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_FILE)

class Settings:
    database_url: str = os.getenv("MY_SQL_DATABASE_URL", DEFAULT_URL)
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "dev-key")
```

**.env File Example**:

```
MY_SQL_DATABASE_URL=mysql+pymysql://root:password@localhost:3306/task_tracker
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET_KEY=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

---

#### **7. Google-auth (>=2.29.0)**

**Purpose**: Google OAuth 2.0 authentication

**Used For**: Validating Google OAuth tokens and fetching user profiles

---

#### **8. Python-jose (>=3.3.0) with cryptography**

**Purpose**: Create and verify JSON Web Tokens (JWT)

**Custom JWT Implementation** in `app/auth.py`:

```python
from jose import jwt
import json
import base64
import hmac
import hashlib

def create_signed_token(payload: dict, expires_delta: timedelta) -> str:
    # Creates JWT token with custom signature
    header = {"alg": "HS256", "typ": "JWT"}
    encoded_header = _base64url_encode(json.dumps(header).encode("utf-8"))
    encoded_payload = _base64url_encode(json.dumps(payload).encode("utf-8"))
    signing_input = f"{encoded_header}.{encoded_payload}"
    signature = _sign(signing_input)
    return f"{signing_input}.{signature}"

def decode_signed_token(token: str) -> dict:
    # Verifies JWT signature and expiration
    encoded_header, encoded_payload, signature = token.split(".", 2)
    # ... verification logic ...
    return payload
```

---

#### **9. Requests (>=2.31.0)**

**Purpose**: HTTP client for making external API calls

**Not actively used in current code but available for:**

- Calling external APIs
- Making HTTP requests to third-party services

---

### FastAPI Middleware

#### **CORSMiddleware**

**Purpose**: Handle Cross-Origin Resource Sharing

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Parameters**:

- `allow_origins`: List of allowed frontend URLs
- `allow_credentials`: Allow cookies and authorization headers
- `allow_methods`: Allowed HTTP methods (GET, POST, PUT, DELETE, etc.)
- `allow_headers`: Allowed request headers

---

## File Structure and Purpose

### Directory Tree

```
backend/
├── .env                          # Environment variables (not in git)
├── .venv/                        # Virtual environment
├── requirements.txt              # Python dependencies
├── README.md                     # Project README
│
├── app/
│   ├── __init__.py              # Python package marker
│   ├── main.py                  # FastAPI application setup (ENTRY POINT)
│   ├── config.py                # Configuration and settings
│   ├── database.py              # SQLAlchemy setup and session management
│   ├── models.py                # SQLAlchemy ORM models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── auth.py                  # JWT and authentication logic
│   ├── services.py              # Shared business logic and utilities
│   │
│   └── routers/                 # API endpoint handlers
│       ├── __init__.py
│       ├── auth.py              # Authentication and Google SSO endpoints
│       ├── users.py             # User management endpoints
│       ├── roles.py             # Role management endpoints
│       ├── projects.py          # Project management endpoints
│       └── tasks.py             # Task management endpoints
```

---

### File-by-File Breakdown

#### **app/main.py** - Application Entry Point

**Responsibilities**:

1. Create FastAPI application instance
2. Configure CORS middleware
3. Register routers (mount endpoints)
4. Define startup event handlers
5. Define health check endpoints

**Key Code**:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, SessionLocal, engine
from .routers import auth, projects, roles, tasks, users
from .services import ensure_user_auth_columns, seed_default_roles

# 1. Create app
app = FastAPI(title="Task Tracker API", version="0.1.0")

# 2. Add CORS middleware
app.add_middleware(CORSMiddleware, ...)

# 3. Startup hook
@app.on_event("startup")
def on_startup():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    # Add new columns to existing tables (for migrations)
    ensure_user_auth_columns(engine)
    # Seed default roles (admin, task creator, etc.)
    db = SessionLocal()
    try:
        seed_default_roles(db)
    finally:
        db.close()

# 4. Health check endpoints
@app.get("/health")
def health_check():
    return {"status": "ok"}

# 5. Register routers
app.include_router(users.router, prefix="/api")
app.include_router(roles.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
```

**Execution Flow on Server Start**:

```
1. FastAPI app is created
2. CORS middleware is added
3. Routers are included
4. on_startup() event fires
5. Database tables are created (if needed)
6. Database schema is updated (if needed)
7. Default roles are seeded
8. Server starts listening on port 8000
```

---

#### **app/config.py** - Configuration Management

**Responsibilities**:

1. Load environment variables from `.env` file
2. Provide default values
3. Define settings class for type hints

**Key Code**:

```python
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env file from parent directory
ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_FILE)

class Settings:
    # Database configuration
    database_url: str = os.getenv(
        "MY_SQL_DATABASE_URL",
        "mysql+pymysql://root:Root%40123@localhost:3306/task_tracker"
    )

    # Frontend configuration
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    frontend_app_url: str = os.getenv("FRONTEND_APP_URL", "http://localhost:5173")

    # Google OAuth configuration
    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
    google_client_secret: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    google_redirect_uri: str = os.getenv(
        "GOOGLE_REDIRECT_URI",
        "http://localhost:8000/api/auth/google/callback",
    )

    # JWT configuration
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "dev-only-change-this-secret")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

    # Helper property for admin emails
    @property
    def google_admin_email_set(self) -> set[str]:
        emails = self.google_admin_emails.split(",")
        return {email.strip().lower() for email in emails if email.strip()}

# Global settings instance
settings = Settings()
```

**Usage Throughout App**:

```python
from .config import settings

# Access settings
db_url = settings.database_url
frontend_url = settings.frontend_origin
```

---

#### **app/database.py** - Database Connection and Session Management

**Responsibilities**:

1. Create SQLAlchemy engine (connection pool)
2. Create session factory
3. Provide session dependency for endpoints

**Key Code**:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# 1. Create engine with connection pooling
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True  # Test connection before using it
)

# 2. Create session factory
SessionLocal = sessionmaker(
    autocommit=False,  # Don't auto-commit changes
    autoflush=False,   # Don't auto-flush changes
    bind=engine        # Bind to the engine
)

# 3. Create declarative base for ORM models
Base = declarative_base()

# 4. Dependency function for FastAPI
def get_db():
    """
    Dependency that provides a database session.
    FastAPI calls this function for each request.
    """
    db = SessionLocal()  # Create new session
    try:
        yield db         # Provide to endpoint
    finally:
        db.close()       # Clean up after endpoint
```

**Connection Pool Explanation**:

```
Connection Pool (pool_size=5, max_overflow=10)
├─ Connection 1: Available
├─ Connection 2: In use by Request A
├─ Connection 3: Available
├─ Connection 4: In use by Request B
└─ Connection 5: Available

If all connections are in use:
└─ Overflow connection is created (up to max_overflow)

pool_pre_ping=True:
├─ Before using a connection, send a ping query
└─ If ping fails, replace connection with new one
```

---

#### **app/models.py** - SQLAlchemy ORM Models

**Responsibilities**:

1. Define database table structure
2. Define relationships between tables
3. Define constraints and indexes

**Key Code**:

```python
from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship
from .database import Base

# Many-to-Many Junction Table
user_roles = Table(
    "user_roles",  # Table name in database
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)

# User Model
class User(Base):
    __tablename__ = "users"

    # Columns
    id = Column(Integer, primary_key=True, index=True)
    # Primary key: unique identifier, auto-incremented
    # index=True: create index on this column for faster queries

    full_name = Column(String(120), nullable=False)
    # String(120): max length 120 characters
    # nullable=False: cannot be NULL

    email = Column(String(255), nullable=False, unique=True, index=True)
    # unique=True: email must be unique across all users
    # index=True: create index for faster lookups

    google_sub = Column(String(255), nullable=True, unique=True, index=True)
    # Google OAuth subject identifier

    avatar_url = Column(String(512), nullable=True)

    is_active = Column(Boolean, nullable=False, default=True)
    # default=True: new users are active by default

    # Relationships (not stored in database, defined in models)
    roles = relationship(
        "Role",
        secondary=user_roles,  # Use junction table
        back_populates="users"  # Bidirectional relationship
    )
    # Allows: user.roles to get list of roles

    owned_projects = relationship("Project", back_populates="owner")
    # One user can own many projects

    assigned_tasks = relationship("Task", back_populates="owner")
    # One user can be assigned many tasks

# Role Model
class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    # Text: longer than String, good for descriptions

    users = relationship("User", secondary=user_roles, back_populates="roles")

# Project Model
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    owner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),  # If user deleted, set to NULL
        nullable=True
    )

    owner = relationship("User", back_populates="owned_projects")
    tasks = relationship(
        "Task",
        back_populates="project",
        cascade="all, delete-orphan"  # If project deleted, delete all tasks
    )

# Task Model
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    due_date = Column(Date, nullable=True)
    status = Column(String(32), nullable=False, default="not-started")

    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),  # Must belong to project
        nullable=False
    )

    owner = relationship("User", back_populates="assigned_tasks")
    project = relationship("Project", back_populates="tasks")

# Constant for task statuses
TASK_STATUSES = ("new", "in-progress", "blocked", "completed", "not-started")
```

**Relationships Explained**:

```
User ↔ Role (Many-to-Many)
├─ One user can have multiple roles
├─ One role can belong to multiple users
└─ Junction table: user_roles (user_id, role_id)

User ↔ Project (One-to-Many)
├─ One user can own multiple projects
├─ One project belongs to one user (owner)

User ↔ Task (One-to-Many)
├─ One user can be assigned multiple tasks
├─ One task belongs to one user (owner)

Project ↔ Task (One-to-Many)
├─ One project can contain multiple tasks
├─ One task belongs to one project
```

---

#### **app/schemas.py** - Pydantic Request/Response Schemas

**Responsibilities**:

1. Validate incoming request data
2. Serialize database models to JSON response
3. Define API contracts (what client sends and receives)

**Key Patterns**:

```python
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import date
from typing import Literal

# Pattern 1: Base Schema (shared fields)
class RoleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    description: str | None = None

# Pattern 2: Create Schema (for POST requests)
class RoleCreate(RoleBase):
    pass  # Inherits name and description from RoleBase

# Pattern 3: Update Schema (for PUT requests, all fields optional)
class RoleUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    description: str | None = None

# Pattern 4: Read Schema (for GET responses)
class RoleRead(RoleBase):
    id: int  # Add ID field for responses
    model_config = ConfigDict(from_attributes=True)  # Enable ORM mode
    # from_attributes=True allows reading from SQLAlchemy models

# User Schemas with Email Validation
class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(
        ...,
        min_length=3,
        max_length=255,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$"  # Simple email regex
    )
    is_active: bool = True

class UserRead(UserBase):
    id: int
    avatar_url: str | None = None
    roles: list[RoleRead] = Field(default_factory=list)  # Nested relationship
    model_config = ConfigDict(from_attributes=True)

# Project with Custom Validator
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=160)
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    owner_id: int | None = None

    @field_validator("end_date")
    @classmethod
    def end_date_cannot_be_before_start_date(cls, end_date: date | None, info):
        start_date = info.data.get("start_date")
        if start_date and end_date and end_date < start_date:
            raise ValueError("end_date cannot be before start_date")
        return end_date

# Task with Type Literal for Status
TaskStatus = Literal["new", "in-progress", "blocked", "completed", "not-started"]

class TaskBase(BaseModel):
    description: str = Field(..., min_length=2)
    due_date: date | None = None
    status: TaskStatus = "not-started"  # Restricted to specific values
    owner_id: int | None = None
    project_id: int

class TaskRead(TaskBase):
    id: int
    owner: UserRead | None = None  # Nested user
    project: ProjectRead | None = None  # Nested project
    model_config = ConfigDict(from_attributes=True)
```

---

#### **app/auth.py** - Authentication and Authorization

**Responsibilities**:

1. Create and verify JWT tokens
2. Extract current user from request
3. Implement role-based access control
4. Handle Google OAuth flow

**Key Functions**:

**JWT Token Creation**:

```python
def create_signed_token(payload: dict, expires_delta: timedelta) -> str:
    """
    Creates a JWT token with custom signature.

    JWT Structure: header.payload.signature

    Header: {"alg": "HS256", "typ": "JWT"}
    Payload: {user data, iat, exp}
    Signature: HMAC-SHA256(header.payload, secret_key)
    """
    now = datetime.now(timezone.utc)
    claims = {
        **payload,
        "iat": int(now.timestamp()),  # Issued at
        "exp": int((now + expires_delta).timestamp()),  # Expiration time
    }

    header = {"alg": "HS256", "typ": "JWT"}
    encoded_header = _base64url_encode(json.dumps(header).encode("utf-8"))
    encoded_payload = _base64url_encode(json.dumps(claims).encode("utf-8"))
    signing_input = f"{encoded_header}.{encoded_payload}"
    signature = _sign(signing_input)

    return f"{signing_input}.{signature}"

def create_access_token(user: models.User) -> str:
    """Creates access token for authenticated user."""
    return create_signed_token(
        {
            "typ": "access",
            "sub": str(user.id),  # Subject (user ID)
            "email": user.email,
            "name": user.full_name,
            "roles": sorted(role.name for role in user.roles),
        },
        timedelta(minutes=settings.access_token_expire_minutes),
    )
```

**JWT Token Verification**:

```python
def decode_signed_token(token: str) -> dict:
    """
    Verifies JWT token signature and expiration.

    Process:
    1. Split token into header, payload, signature
    2. Verify signature using HMAC-SHA256
    3. Check expiration time
    4. Return payload claims
    """
    try:
        encoded_header, encoded_payload, signature = token.split(".", 2)
        signing_input = f"{encoded_header}.{encoded_payload}"

        # Verify signature
        if not hmac.compare_digest(_sign(signing_input), signature):
            raise ValueError("Invalid token signature")

        # Decode payload
        payload = json.loads(_base64url_decode(encoded_payload))
    except (ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    # Check expiration
    expires_at = payload.get("exp")
    if not isinstance(expires_at, int) or expires_at < int(datetime.now(timezone.utc).timestamp()):
        raise HTTPException(status_code=401, detail="Token has expired")

    return payload
```

**Extract Current User**:

```python
def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """
    Dependency that extracts and validates current user from JWT token.

    Process:
    1. Extract Bearer token from Authorization header
    2. Decode and verify JWT token
    3. Extract user ID from token claims
    4. Query database for user
    5. Check if user is active
    6. Return User object

    Raises:
    - 401 Unauthorized: No credentials or invalid token
    - 403 Forbidden: User is inactive
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Decode token
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")

    # Query user with roles eagerly loaded
    user = (
        db.query(models.User)
        .options(selectinload(models.User.roles))
        .filter(models.User.id == int(user_id))
        .first()
        if str(user_id).isdigit()
        else None
    )

    # Check user exists and is active
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User is not active")

    return user
```

**Role-Based Access Control**:

```python
def require_any_role(*allowed_roles: str):
    """
    Dependency factory that requires user to have one of allowed roles.

    Usage:
    @router.post("")
    def create_user(
        current_user: models.User = Depends(require_any_role("admin"))
    ):
        # Only users with "admin" role can access this
    """
    def dependency(current_user: models.User = Depends(get_current_user)) -> models.User:
        if not has_any_role(current_user, allowed_roles):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return dependency

def has_any_role(user: models.User, allowed_roles: Iterable[str]) -> bool:
    """Check if user has any of the allowed roles."""
    allowed = {role.lower() for role in allowed_roles}
    user_roles = {role.name.lower() for role in user.roles}
    return bool(user_roles & allowed)  # Intersection check
```

---

#### **app/services.py** - Shared Business Logic

**Responsibilities**:

1. Provide utility functions for database operations
2. Implement common error handling patterns
3. Seed default data

**Key Functions**:

```python
def get_or_404(db: Session, model, entity_id: int, label: str):
    """
    Retrieve entity by ID or raise 404 Not Found.

    Usage:
    user = get_or_404(db, models.User, user_id, "User")
    """
    entity = db.get(model, entity_id)
    if entity is None:
        raise HTTPException(status_code=404, detail=f"{label} not found")
    return entity

def commit_or_409(db: Session, message: str):
    """
    Commit database changes or raise 409 Conflict.

    Catches IntegrityError (duplicate key, foreign key violation, etc.)
    and converts to HTTP 409 Conflict.
    """
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=message) from exc

def ensure_role_ids_exist(db: Session, role_ids: list[int]):
    """
    Verify all role IDs exist in database.

    Returns list of Role objects if all IDs found.
    Raises 404 if any role is missing.
    """
    roles = db.query(models.Role).filter(models.Role.id.in_(role_ids)).all() if role_ids else []
    found_ids = {role.id for role in roles}
    missing_ids = sorted(set(role_ids) - found_ids)
    if missing_ids:
        raise HTTPException(status_code=404, detail=f"Roles not found: {missing_ids}")
    return roles

def seed_default_roles(db: Session):
    """
    Create default roles if they don't exist.
    Called on application startup.
    """
    DEFAULT_ROLES = (
        ("admin", "Can manage users, roles, projects, and tasks."),
        ("task creator", "Can create and maintain projects and tasks."),
        ("individual read only user", "Can view assigned tasks and mark them complete."),
    )

    existing_names = {role.name for role in db.query(models.Role).all()}
    for name, description in DEFAULT_ROLES:
        if name not in existing_names:
            db.add(models.Role(name=name, description=description))
    commit_or_409(db, "Unable to seed default roles")
```

---

#### **app/routers/auth.py** - Authentication Endpoints

**Endpoints**:

```python
@router.get("/auth/google/login")
def google_login():
    """
    Initiate Google OAuth 2.0 login flow.

    Process:
    1. Generate OAuth state token (for CSRF protection)
    2. Redirect to Google authorization URL
    3. Google prompts user to login
    4. Google redirects back to callback endpoint with auth code
    """

@router.get("/auth/google/callback")
def google_callback(code: str, state: str):
    """
    Google OAuth callback endpoint.

    Process:
    1. Verify OAuth state token
    2. Exchange authorization code for access token
    3. Fetch user profile from Google
    4. Upsert user to database (create if new, update if existing)
    5. Assign roles (admin or read-only)
    6. Create JWT access token
    7. Redirect to frontend with token in URL hash
    """

@router.post("/auth/google/login")
def google_login_direct(payload: schemas.GoogleLoginRequest):
    """
    Direct Google token submission (for mobile/SPA).

    Client sends Google ID token, server verifies and creates session.
    """
```

---

#### **app/routers/users.py** - User Management Endpoints

```python
@router.get("", response_model=list[schemas.UserRead])
def list_users(db: Session, current_user: models.User):
    """List all users."""

@router.post("", response_model=schemas.UserRead, status_code=201)
def create_user(payload: schemas.UserCreate, db: Session, current_user: models.User):
    """Create new user (admin only)."""

@router.get("/{user_id}", response_model=schemas.UserRead)
def get_user(user_id: int, db: Session, current_user: models.User):
    """Get user by ID."""

@router.put("/{user_id}", response_model=schemas.UserRead)
def update_user(user_id: int, payload: schemas.UserUpdate, db: Session, current_user: models.User):
    """Update user (admin only)."""

@router.put("/{user_id}/roles", response_model=schemas.UserRead)
def assign_roles(user_id: int, payload: schemas.UserRoleAssignment, db: Session, current_user: models.User):
    """Assign roles to user (admin only)."""

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session, current_user: models.User):
    """Delete user (admin only)."""
```

---

#### **app/routers/projects.py** - Project Management Endpoints

```python
@router.get("", response_model=list[schemas.ProjectRead])
def list_projects(db: Session, current_user: models.User):
    """List all projects."""

@router.post("", response_model=schemas.ProjectRead, status_code=201)
def create_project(payload: schemas.ProjectCreate, db: Session, current_user: models.User):
    """Create project (admin or task creator)."""

@router.get("/{project_id}", response_model=schemas.ProjectRead)
def get_project(project_id: int, db: Session, current_user: models.User):
    """Get project by ID."""

@router.put("/{project_id}", response_model=schemas.ProjectRead)
def update_project(project_id: int, payload: schemas.ProjectUpdate, db: Session, current_user: models.User):
    """Update project (admin or task creator)."""

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session, current_user: models.User):
    """Delete project (admin or task creator)."""
```

---

#### **app/routers/tasks.py** - Task Management Endpoints

```python
@router.get("/statuses", response_model=list[str])
def list_statuses(current_user: models.User):
    """List all possible task statuses."""

@router.get("", response_model=list[schemas.TaskRead])
def list_tasks(status_filter: str | None, project_id: int | None, owner_id: int | None, db: Session):
    """
    List tasks with optional filtering.

    Query parameters:
    - status: Filter by status (new, in-progress, etc.)
    - project_id: Filter by project
    - owner_id: Filter by assigned user
    """

@router.post("", response_model=schemas.TaskRead, status_code=201)
def create_task(payload: schemas.TaskCreate, db: Session, current_user: models.User):
    """Create task (admin or task creator)."""

@router.get("/{task_id}", response_model=schemas.TaskRead)
def get_task(task_id: int, db: Session, current_user: models.User):
    """Get task by ID."""

@router.put("/{task_id}", response_model=schemas.TaskRead)
def update_task(task_id: int, payload: schemas.TaskUpdate, db: Session, current_user: models.User):
    """Update task (admin or task creator)."""

@router.patch("/{task_id}/assign", response_model=schemas.TaskRead)
def assign_task(task_id: int, payload: schemas.TaskAssign, db: Session, current_user: models.User):
    """Assign task to user (admin or task creator)."""

@router.patch("/{task_id}/complete", response_model=schemas.TaskRead)
def mark_task_complete(task_id: int, db: Session, current_user: models.User):
    """Mark task as completed (assigned user or admin/task creator)."""

@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session, current_user: models.User):
    """Delete task (admin or task creator)."""
```

---

#### **app/routers/roles.py** - Role Management Endpoints

```python
@router.get("", response_model=list[schemas.RoleRead])
def list_roles(db: Session, current_user: models.User):
    """List all roles."""

@router.post("", response_model=schemas.RoleRead, status_code=201)
def create_role(payload: schemas.RoleCreate, db: Session, current_user: models.User):
    """Create role (admin only)."""

@router.get("/{role_id}", response_model=schemas.RoleRead)
def get_role(role_id: int, db: Session, current_user: models.User):
    """Get role by ID."""

@router.put("/{role_id}", response_model=schemas.RoleRead)
def update_role(role_id: int, payload: schemas.RoleUpdate, db: Session, current_user: models.User):
    """Update role (admin only)."""

@router.delete("/{role_id}", status_code=204)
def delete_role(role_id: int, db: Session, current_user: models.User):
    """Delete role (admin only)."""
```

---

## Database Setup and Connection

### MySQL Database Structure

#### **1. Database Creation**

```sql
-- Create database
CREATE DATABASE task_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use database
USE task_tracker;
```

#### **2. Tables Created by SQLAlchemy**

The application automatically creates these tables on startup:

```
Database: task_tracker
├── users
│   ├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
│   ├── full_name (VARCHAR(120), NOT NULL)
│   ├── email (VARCHAR(255), NOT NULL, UNIQUE)
│   ├── google_sub (VARCHAR(255), NULL, UNIQUE)
│   ├── avatar_url (VARCHAR(512), NULL)
│   └── is_active (BOOLEAN, NOT NULL, DEFAULT=1)
│
├── roles
│   ├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
│   ├── name (VARCHAR(80), NOT NULL, UNIQUE)
│   └── description (TEXT, NULL)
│
├── user_roles (Junction table for Many-to-Many)
│   ├── user_id (INT, FOREIGN KEY → users.id)
│   └── role_id (INT, FOREIGN KEY → roles.id)
│
├── projects
│   ├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
│   ├── name (VARCHAR(160), NOT NULL, UNIQUE)
│   ├── description (TEXT, NULL)
│   ├── start_date (DATE, NULL)
│   ├── end_date (DATE, NULL)
│   └── owner_id (INT, FOREIGN KEY → users.id, NULL)
│
└── tasks
    ├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
    ├── description (TEXT, NOT NULL)
    ├── due_date (DATE, NULL)
    ├── status (VARCHAR(32), NOT NULL, DEFAULT='not-started')
    ├── owner_id (INT, FOREIGN KEY → users.id, NULL)
    └── project_id (INT, FOREIGN KEY → projects.id, NOT NULL)
```

#### **3. Index Creation**

SQLAlchemy creates indexes on frequently queried columns:

```sql
-- Indexes created automatically
CREATE INDEX ix_users_id ON users(id);
CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_google_sub ON users(google_sub);

CREATE INDEX ix_roles_id ON roles(id);
CREATE INDEX ix_roles_name ON roles(name);

CREATE INDEX ix_projects_id ON projects(id);
CREATE INDEX ix_projects_name ON projects(name);
CREATE INDEX ix_projects_owner_id ON projects(owner_id);

CREATE INDEX ix_tasks_id ON tasks(id);
CREATE INDEX ix_tasks_project_id ON tasks(project_id);
CREATE INDEX ix_tasks_owner_id ON tasks(owner_id);
CREATE INDEX ix_tasks_status ON tasks(status);
```

### Connection String Explained

```
mysql+pymysql://root:Root%40123@localhost:3306/task_tracker
├── mysql+pymysql:// - Database type + driver
├── root - MySQL username
├── Root%40123 - Password (URL encoded: @ = %40)
├── localhost:3306 - Host and port
└── task_tracker - Database name
```

### Connection Pool Configuration

```python
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,      # Test connection before using
    echo=False,              # Don't log SQL statements (set to True for debugging)
    pool_size=5,             # Number of connections in pool
    max_overflow=10,         # Additional connections if needed
    pool_recycle=3600,       # Recycle connections after 1 hour
)
```

---

## ORM Commands and SQLAlchemy Operations

### Creating Data (INSERT)

#### **Using .add() and .commit()**

```python
from sqlalchemy.orm import Session
from app import models

def create_user(db: Session):
    # Create model instance (not saved yet)
    user = models.User(
        full_name="John Doe",
        email="john@example.com",
        is_active=True
    )

    # Add to session (queued for insert)
    db.add(user)

    # Commit transaction (executes INSERT)
    db.commit()

    # Refresh to get auto-generated ID
    db.refresh(user)

    print(user.id)  # Now has ID from database
    return user

# SQL Generated:
# INSERT INTO users (full_name, email, is_active) VALUES ('John Doe', 'john@example.com', 1)
```

#### **Creating with Relationships**

```python
def create_user_with_roles(db: Session):
    # Fetch existing roles
    roles = db.query(models.Role).filter(models.Role.id.in_([1, 2])).all()

    # Create user
    user = models.User(
        full_name="Jane Doe",
        email="jane@example.com"
    )

    # Assign roles
    user.roles = roles  # Many-to-many relationship

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

# SQL Generated:
# INSERT INTO users (...) VALUES (...)
# INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)
# INSERT INTO user_roles (user_id, role_id) VALUES (1, 2)
```

---

### Reading Data (SELECT)

#### **Basic Query**

```python
# SELECT * FROM users ORDER BY full_name
users = db.query(models.User).order_by(models.User.full_name).all()

# SELECT * FROM users WHERE is_active = 1
active_users = db.query(models.User).filter(models.User.is_active == True).all()

# SELECT * FROM users WHERE email = 'john@example.com'
user = db.query(models.User).filter(models.User.email == "john@example.com").first()

# Get by primary key
user = db.get(models.User, user_id)  # Fastest way
```

#### **Filtering with Conditions**

```python
from sqlalchemy import and_, or_, in_

# Multiple conditions (AND)
users = db.query(models.User).filter(
    and_(
        models.User.is_active == True,
        models.User.full_name.like("%John%")  # LIKE pattern
    )
).all()

# Multiple conditions (OR)
users = db.query(models.User).filter(
    or_(
        models.User.email == "john@example.com",
        models.User.email == "jane@example.com"
    )
).all()

# IN clause
users = db.query(models.User).filter(models.User.id.in_([1, 2, 3])).all()

# NOT IN
users = db.query(models.User).filter(~models.User.id.in_([1, 2, 3])).all()
```

#### **Eager Loading Relationships**

```python
from sqlalchemy.orm import selectinload, joinedload

# selectinload: Execute separate query for relationships
users = db.query(models.User).options(
    selectinload(models.User.roles)
).all()
# SQL:
# SELECT * FROM users
# SELECT * FROM roles WHERE id IN (...)

# joinedload: Use LEFT OUTER JOIN
projects = db.query(models.Project).options(
    joinedload(models.Project.owner)
).all()
# SQL:
# SELECT users.*, projects.* FROM projects
# LEFT OUTER JOIN users ON projects.owner_id = users.id

# Nested eager loading
tasks = db.query(models.Task).options(
    joinedload(models.Task.owner).joinedload(models.User.roles),
    joinedload(models.Task.project).joinedload(models.Project.owner)
).all()
```

#### **Pagination**

```python
# LIMIT and OFFSET
page = 1
page_size = 10
offset = (page - 1) * page_size

users = db.query(models.User).offset(offset).limit(page_size).all()
```

#### **Counting**

```python
# SELECT COUNT(*) FROM users
count = db.query(models.User).count()

# SELECT COUNT(*) FROM users WHERE is_active = 1
active_count = db.query(models.User).filter(models.User.is_active == True).count()
```

---

### Updating Data (UPDATE)

#### **Basic Update**

```python
# Get user
user = db.get(models.User, user_id)

# Modify attributes
user.full_name = "New Name"
user.is_active = False

# Commit changes
db.commit()

# Refresh to sync with database
db.refresh(user)

# SQL Generated:
# UPDATE users SET full_name = 'New Name', is_active = 0 WHERE id = 1
```

#### **Bulk Update Using .setattr()**

```python
# Update multiple attributes from dict
updates = {
    "full_name": "Updated Name",
    "email": "new@example.com"
}

user = db.get(models.User, user_id)
for field, value in updates.items():
    setattr(user, field, value)

db.commit()
```

#### **Update Relationships**

```python
# Update many-to-many relationship
user = db.get(models.User, user_id)
roles = db.query(models.Role).filter(models.Role.id.in_([1, 3])).all()
user.roles = roles  # Replace roles

db.commit()

# SQL:
# DELETE FROM user_roles WHERE user_id = 1
# INSERT INTO user_roles (user_id, role_id) VALUES (1, 1), (1, 3)
```

---

### Deleting Data (DELETE)

#### **Delete Single Record**

```python
# Get record
user = db.get(models.User, user_id)

# Delete
db.delete(user)

# Commit
db.commit()

# SQL Generated:
# DELETE FROM users WHERE id = 1
```

#### **Delete with Foreign Key Cascade**

```python
# Project has tasks with cascade="all, delete-orphan"
project = db.get(models.Project, project_id)
db.delete(project)
db.commit()

# SQL:
# DELETE FROM tasks WHERE project_id = 1
# DELETE FROM projects WHERE id = 1
```

---

### Transaction Management

#### **Manual Commit and Rollback**

```python
try:
    user = models.User(full_name="John", email="john@example.com")
    db.add(user)

    # Commit saves changes
    db.commit()

except Exception as e:
    # Rollback reverts changes
    db.rollback()
    print(f"Error: {e}")
```

#### **Session Configuration**

```python
# From database.py
SessionLocal = sessionmaker(
    autocommit=False,   # Don't auto-commit (manual commit required)
    autoflush=False,    # Don't auto-flush before queries
    bind=engine
)

# With autoflush=False:
# - Must explicitly db.flush() to run INSERT/UPDATE/DELETE
# - Must explicitly db.commit() to commit transaction

# With autoflush=True (default):
# - Automatically flushes before queries
# - Can cause unexpected queries
```

---

## Authentication and Authorization

### JWT Authentication Flow

```
User Request
    ↓
[1] Check Authorization Header
    ├─ Format: "Authorization: Bearer <TOKEN>"
    └─ Extract token value
    ↓
[2] Decode JWT Token
    ├─ Split by dots: header.payload.signature
    ├─ Verify signature with secret key
    └─ Decode payload
    ↓
[3] Validate Claims
    ├─ Check token type = "access"
    ├─ Check expiration time (exp claim)
    └─ Extract user ID from "sub" claim
    ↓
[4] Query User from Database
    ├─ SELECT * FROM users WHERE id = ?
    ├─ Eager load user roles
    └─ Check if user is active
    ↓
[5] Authorization Check (if role required)
    ├─ Get user's role names from user.roles
    ├─ Check intersection with allowed roles
    └─ Raise 403 if no match
    ↓
[6] Execute Endpoint
    └─ current_user object passed to handler
```

### Google OAuth Flow

```
Frontend User Clicks "Login with Google"
    ↓
[1] Frontend redirects to /api/auth/google/login
    ├─ Server generates OAuth state token
    ├─ Includes CSRF protection
    └─ Redirects to Google OAuth authorization URL
    ↓
[2] Google Shows Login & Consent Screen
    └─ User authorizes application
    ↓
[3] Google Redirects to /api/auth/google/callback
    ├─ Includes authorization code
    ├─ Includes state token (for verification)
    └─ Server verifies state token
    ↓
[4] Server Exchanges Code for Token
    ├─ POST to Google token endpoint
    ├─ Send: code, client_id, client_secret
    └─ Receive: access_token, id_token
    ↓
[5] Server Fetches User Profile
    ├─ GET to Google userinfo endpoint
    ├─ Send: access_token
    └─ Receive: user profile (email, name, picture)
    ↓
[6] Upsert User to Database
    ├─ Check if user exists by google_sub
    ├─ If new: Create user with "read only" role
    ├─ If first user: Assign "admin" role
    ├─ If existing: Update profile (email, name, picture)
    └─ Commit changes
    ↓
[7] Create JWT Access Token
    ├─ Payload: {sub, email, name, roles, iat, exp}
    └─ Signed with secret key
    ↓
[8] Redirect to Frontend with Token
    ├─ Fragment (#) URL: frontend_url#access_token=<TOKEN>
    └─ Frontend reads token from URL hash
```

---

## API Endpoints Reference

### Health Check Endpoints

```
GET /health                 200 OK → {"status": "ok"}
GET /api/health             200 OK → {"status": "ok"}
```

### Authentication Endpoints

```
GET /api/auth/google/login                      → Redirects to Google
GET /api/auth/google/callback?code=...&state=...  → Redirects to frontend with token
POST /api/auth/google/login                     → Direct token submission
```

### User Endpoints

```
GET /api/users                          → Get all users
POST /api/users                         → Create user (admin only)
GET /api/users/{user_id}                → Get user by ID
PUT /api/users/{user_id}                → Update user (admin only)
PUT /api/users/{user_id}/roles          → Assign roles (admin only)
DELETE /api/users/{user_id}             → Delete user (admin only)
```

### Role Endpoints

```
GET /api/roles                          → Get all roles
POST /api/roles                         → Create role (admin only)
GET /api/roles/{role_id}                → Get role by ID
PUT /api/roles/{role_id}                → Update role (admin only)
DELETE /api/roles/{role_id}             → Delete role (admin only)
```

### Project Endpoints

```
GET /api/projects                       → Get all projects
POST /api/projects                      → Create project (admin, task creator)
GET /api/projects/{project_id}          → Get project by ID
PUT /api/projects/{project_id}          → Update project (admin, task creator)
DELETE /api/projects/{project_id}       → Delete project (admin, task creator)
```

### Task Endpoints

```
GET /api/tasks/statuses                 → Get all task statuses
GET /api/tasks                          → Get tasks (filter: status, project_id, owner_id)
POST /api/tasks                         → Create task (admin, task creator)
GET /api/tasks/{task_id}                → Get task by ID
PUT /api/tasks/{task_id}                → Update task (admin, task creator)
PATCH /api/tasks/{task_id}/assign       → Assign task (admin, task creator)
PATCH /api/tasks/{task_id}/complete     → Mark task complete (owner, admin, task creator)
DELETE /api/tasks/{task_id}             → Delete task (admin, task creator)
```

---

## Step-by-Step Setup Guide

### Prerequisites

- Python 3.9+
- MySQL 5.7+ or 8.0
- pip (Python package manager)
- Git

### Installation Steps

#### **Step 1: Clone Repository and Navigate**

```bash
cd c:\Users\kunal.prasad\Desktop\capstone_project\backend
```

#### **Step 2: Create Virtual Environment**

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate
```

#### **Step 3: Install Dependencies**

```bash
pip install -r requirements.txt
```

This installs:

- FastAPI (web framework)
- Uvicorn (ASGI server)
- SQLAlchemy (ORM)
- PyMySQL (MySQL driver)
- Pydantic (data validation)
- python-dotenv (environment variables)
- google-auth (OAuth)
- python-jose (JWT)

#### **Step 4: Create .env File**

Create `.env` file in `backend/` directory:

```bash
# Database
MY_SQL_DATABASE_URL=mysql+pymysql://root:Root%40123@localhost:3306/task_tracker

# Frontend
FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_APP_URL=http://localhost:5173

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
GOOGLE_ADMIN_EMAILS=admin@example.com
BOOTSTRAP_FIRST_GOOGLE_USER_AS_ADMIN=true
```

#### **Step 5: Ensure MySQL is Running**

```bash
# On Windows with MySQL installed locally:
# MySQL should auto-start or start via Services

# Test connection:
mysql -u root -p -h localhost
# Enter password: Root@123
# You should see: mysql>
```

#### **Step 6: Start the FastAPI Server**

```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using python -m
python -m uvicorn app.main:app --reload
```

**Output**:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

#### **Step 7: Verify Server is Running**

Open browser and navigate to:

- Health Check: `http://localhost:8000/health`
- API Docs: `http://localhost:8000/docs` (Swagger UI)
- Alternative Docs: `http://localhost:8000/redoc` (ReDoc)

#### **Step 8: Database Initialization**

On first run, the server automatically:

1. Creates all tables if they don't exist
2. Adds any missing columns (for migrations)
3. Seeds default roles:
   - `admin` - Full access
   - `task creator` - Can create projects/tasks
   - `individual read only user` - Can view assigned tasks

### Testing the API

#### **Using Swagger UI** (Recommended)

1. Navigate to `http://localhost:8000/docs`
2. Click "Try it out" on any endpoint
3. Fill in parameters and execute

#### **Using curl**

```bash
# Health check
curl http://localhost:8000/health

# Get all users (requires authentication)
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8000/api/users

# Create user
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "role_ids": [1]
  }'
```

#### **Using Postman**

1. Import API documentation from `http://localhost:8000/openapi.json`
2. Set Authorization header: `Bearer <JWT_TOKEN>`
3. Send requests to test endpoints

---

### Development Workflow

#### **Code Changes Auto-Reload**

With `--reload` flag, the server automatically restarts when files change:

```bash
uvicorn app.main:app --reload
```

#### **View SQL Queries**

For debugging, enable SQL logging:

```python
# In app/database.py
engine = create_engine(settings.database_url, echo=True)  # Set to True
```

Then check console output for SQL queries.

#### **Common Development Tasks**

```bash
# Activate virtual environment
.venv\Scripts\activate

# Install new dependency
pip install package-name
pip freeze > requirements.txt

# Stop server
# Press Ctrl+C in terminal

# Restart server
uvicorn app.main:app --reload
```

---

### Troubleshooting

| Issue                                | Solution                                                |
| ------------------------------------ | ------------------------------------------------------- |
| `No module named 'fastapi'`          | Run `pip install -r requirements.txt`                   |
| `Connection refused to MySQL`        | Ensure MySQL is running: `mysql -u root -p`             |
| `Access denied for user 'root'`      | Check password in .env file (URL encoded special chars) |
| `Table 'task_tracker' doesn't exist` | Create database: `CREATE DATABASE task_tracker;`        |
| `CORS error in browser`              | Check `FRONTEND_ORIGIN` in .env matches frontend URL    |
| `401 Unauthorized`                   | Token expired or invalid. Get new token via login       |
| `403 Forbidden`                      | User doesn't have required role for this endpoint       |
| `Port 8000 already in use`           | Use different port: `--port 8001`                       |

---

## Summary

This backend implements a complete Task Tracker system with:

✅ **Modern Architecture**: Layered pattern with clear separation of concerns
✅ **Security**: JWT authentication, role-based access control, OAuth 2.0
✅ **Database**: MySQL with SQLAlchemy ORM, automatic schema creation
✅ **API**: FastAPI with automatic documentation and validation
✅ **Scalability**: Connection pooling, eager loading, query optimization
✅ **User Management**: Multiple roles, Google SSO, role-based endpoints
✅ **Project Management**: Create, update, delete projects with owners
✅ **Task Management**: Task assignment, status tracking, filtering

The entire flow from HTTP request to database response is carefully designed with:

- Dependency injection for clean code
- Pydantic validation for type safety
- SQLAlchemy ORM for database abstraction
- JWT tokens for stateless authentication
- Role-based decorators for authorization

---

**End of Comprehensive Technical Guide**
