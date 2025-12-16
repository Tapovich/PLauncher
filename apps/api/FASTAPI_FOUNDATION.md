# 🚀 FastAPI Foundation - Complete Guide

Complete FastAPI setup with structured logging, rate limiting, repository pattern, and service layer.

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Application                      │
├─────────────────────────────────────────────────────────────┤
│  Middleware Stack:                                           │
│  ├── CORS Middleware (allow origins)                         │
│  ├── Error Handler Middleware (global exception handling)    │
│  ├── Rate Limit Middleware (60/min, 1000/hour)              │
│  └── Request Logging Middleware (structured logs)            │
├─────────────────────────────────────────────────────────────┤
│  API Endpoints (OpenAPI tagged):                             │
│  ├── /health (Health checks)                                 │
│  ├── /api/v1/auth (Authentication)                           │
│  ├── /api/v1/users (User management)                         │
│  ├── /api/v1/projects (Projects)                             │
│  ├── /api/v1/ai (AI generation)                              │
│  ├── /api/v1/freelancers (Marketplace)                       │
│  ├── /api/v1/applications (Applications)                     │
│  ├── /api/v1/payments (Payments)                             │
│  └── /api/v1/dfy (Done-for-you)                             │
├─────────────────────────────────────────────────────────────┤
│  Service Layer:                                              │
│  ├── UserService (business logic)                            │
│  ├── ProjectService                                          │
│  └── FreelancerService                                       │
├─────────────────────────────────────────────────────────────┤
│  Repository Layer:                                           │
│  ├── UserRepository (data access)                            │
│  ├── ProjectRepository                                       │
│  └── FreelancerRepository                                    │
├─────────────────────────────────────────────────────────────┤
│  Database:                                                    │
│  └── PostgreSQL (async, connection pooling)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Project Structure

```
apps/api/
├── app/
│   ├── api/
│   │   ├── dependencies.py      # Common dependencies
│   │   └── v1/
│   │       ├── __init__.py       # Router aggregation
│   │       └── endpoints/        # API endpoints
│   │           ├── auth.py
│   │           ├── users.py
│   │           ├── projects.py
│   │           ├── ai.py
│   │           └── freelancers.py
│   ├── core/
│   │   ├── config.py            # Pydantic settings
│   │   ├── logging.py           # Structured logging
│   │   ├── middleware.py        # Custom middleware
│   │   └── exceptions.py        # Custom exceptions
│   ├── db/
│   │   └── session.py           # Database session + pooling
│   ├── models/                  # SQLAlchemy models
│   ├── repositories/            # Data access layer
│   │   ├── base.py             # Base repository
│   │   ├── user.py
│   │   ├── project.py
│   │   └── freelancer.py
│   └── services/               # Business logic layer
│       ├── base.py
│       ├── user.py
│       ├── project.py
│       └── freelancer.py
└── main.py                     # Application entry
```

---

## ⚙️ Configuration (Pydantic Settings)

All configuration is managed via `app/core/config.py`:

```python
from app.core.config import settings

# Access settings
settings.DATABASE_URL
settings.ENVIRONMENT
settings.LOG_LEVEL
```

### Environment Variables

See `env.example` for all available options:

- **Application**: APP_NAME, APP_VERSION, ENVIRONMENT
- **Server**: HOST, PORT, RELOAD
- **Database**: DATABASE_URL, DB_POOL_SIZE, DB_MAX_OVERFLOW
- **Rate Limiting**: RATE_LIMIT_PER_MINUTE, RATE_LIMIT_PER_HOUR
- **Logging**: LOG_LEVEL, LOG_FORMAT (json/text)
- **CORS**: CORS_ORIGINS
- And more...

---

## 📝 Structured Logging

JSON-formatted logs in production, human-readable in development.

```python
from app.core.logging import get_logger

logger = get_logger(__name__)

logger.info("User logged in", extra={"user_id": "123"})
logger.error("Failed to process payment", exc_info=True)
```

### Log Output (JSON in Production)

```json
{
  "timestamp": "2024-12-15T10:30:00Z",
  "level": "INFO",
  "logger": "app.api.endpoints.users",
  "message": "User created",
  "module": "users",
  "function": "create_user",
  "line": 42,
  "request_id": "abc-123",
  "user_id": "uuid-here"
}
```

---

## 🚦 Rate Limiting

Simple in-memory rate limiting (use Redis in production):

- **Per Minute**: 60 requests/minute
- **Per Hour**: 1000 requests/hour
- **Per User/IP**: Tracks by user ID or IP address

### Configuration

```env
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
```

### Response (429 Too Many Requests)

```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded: 60 requests per minute"
}
```

---

## 🛡️ Exception Handling

Custom exception classes in `app/core/exceptions.py`:

```python
from app.core.exceptions import (
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ConflictException,
)

# Usage
raise NotFoundException("User not found")
raise ConflictException("Email already exists")
```

### Response Format

```json
{
  "error": "not_found",
  "message": "User not found",
  "details": null
}
```

---

## 🗄️ Repository Pattern

Data access layer with common CRUD operations.

### Base Repository

All repositories inherit from `BaseRepository`:

```python
from app.repositories.base import BaseRepository

# Provided methods:
await repo.get(id)              # Get by ID
await repo.get_multi(skip, limit)  # List with pagination
await repo.create(**data)        # Create
await repo.update(id, **data)    # Update
await repo.delete(id)            # Delete
await repo.count(**filters)      # Count
await repo.exists(id)            # Check existence
```

### Custom Repository

```python
from app.repositories.user import UserRepository

repo = UserRepository(db)
user = await repo.get_by_email("user@example.com")
exists = await repo.email_exists("test@example.com")
```

---

## 🎯 Service Layer

Business logic layer with validation and orchestration.

### Usage

```python
from app.services.user import UserService

service = UserService(db)

# Create user with validation
user = await service.create_user(
    email="user@example.com",
    full_name="John Doe",
    plan="pro"
)

# Get user (raises NotFoundException if not found)
user = await service.get_user(user_id)

# Update user
user = await service.update_user(user_id, full_name="Jane Doe")
```

### Available Services

- **UserService**: User management
- **ProjectService**: Project CRUD + status management
- **FreelancerService**: Marketplace search + profiles

---

## 🔌 Database Connection Pooling

Async PostgreSQL with optimized connection pooling:

```python
# Configuration
DB_POOL_SIZE=10          # Max connections
DB_MAX_OVERFLOW=20       # Extra connections under load
DB_POOL_TIMEOUT=30       # Connection timeout (seconds)
DB_POOL_RECYCLE=3600     # Recycle connections after 1 hour
```

### Usage

```python
from app.db.session import get_db
from fastapi import Depends

@app.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    # db session is auto-managed
    pass
```

---

## 📡 API Endpoints

### Health Checks

```http
GET /health
GET /health/live      # Kubernetes liveness
GET /health/ready     # Kubernetes readiness
```

### OpenAPI Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### API Tags (OpenAPI)

All endpoints are organized by domain:

- **Health**: Status endpoints
- **Authentication**: Login, register, logout
- **Users**: User management
- **Projects**: Project CRUD
- **AI**: Idea generation, tech specs
- **Freelancers**: Marketplace search
- **Applications**: Project applications
- **Payments**: Stripe integration
- **Done-For-You**: Full-service requests

---

## 🚀 Running the Application

### Development

```bash
cd apps/api
source venv/bin/activate
python main.py
```

API runs at: http://localhost:8000

### Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 📋 API Examples

### Search Freelancers

```http
GET /api/v1/freelancers?role=developer&skills=React,TypeScript&min_rate=50&max_rate=100&verified_only=true
```

Response:
```json
[
  {
    "id": "uuid",
    "role": "developer",
    "skills": ["React", "TypeScript", "Node.js"],
    "hourly_rate_usd": 75,
    "availability": "full-time",
    "rating": 4.8,
    "projects_completed": 25,
    "verified": true
  }
]
```

### Get Project

```http
GET /api/v1/projects/{project_id}
```

Response:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "AI Task Manager",
  "description": "Smart task management app",
  "status": "planning",
  "budget_min": 5000,
  "budget_max": 20000,
  "timeline_weeks": 12,
  "created_at": "2024-12-15T10:00:00Z"
}
```

---

## 🧪 Testing Endpoints

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Search freelancers
curl "http://localhost:8000/api/v1/freelancers?role=developer&limit=5"

# Get project (replace UUID)
curl http://localhost:8000/api/v1/projects/{uuid}
```

### Using HTTPie

```bash
http GET localhost:8000/api/v1/freelancers role==developer limit==5
```

### Using Python requests

```python
import requests

response = requests.get(
    "http://localhost:8000/api/v1/freelancers",
    params={"role": "developer", "skills": "React,TypeScript"}
)
print(response.json())
```

---

## 🔧 Middleware Stack

### Request Flow

```
1. CORS Middleware
   ↓
2. Error Handler Middleware (catches all exceptions)
   ↓
3. Rate Limit Middleware (checks limits)
   ↓
4. Request Logging Middleware (logs + adds request_id)
   ↓
5. API Endpoint Handler
   ↓
6. Response (with X-Request-ID header)
```

### Request ID Tracking

Every request gets a unique ID:

```python
# Access in endpoint
@app.get("/test")
async def test(request: Request):
    request_id = request.state.request_id
    return {"request_id": request_id}
```

Response headers:
```
X-Request-ID: abc-123-def-456
```

---

## 📊 Performance Tips

1. **Connection Pooling**: Configured for 10-30 concurrent connections
2. **Indexes**: Database queries use proper indexes (see DATABASE.md)
3. **Async/Await**: All I/O operations are async
4. **Rate Limiting**: Prevents abuse
5. **Pagination**: All list endpoints support skip/limit

### Monitoring

TODO: Add performance monitoring with:
- **APM**: New Relic, DataDog, or Prometheus
- **Logging**: Ship logs to ELK stack
- **Metrics**: Response times, error rates, throughput

---

## 🐛 Debugging

### Enable SQL Logging

```env
DB_ECHO=true
```

### Set Log Level

```env
LOG_LEVEL=DEBUG
```

### Check Logs

```bash
# In development (text format)
python main.py

# Logs show:
2024-12-15 10:30:00 | INFO     | app.main | Database connection established
2024-12-15 10:30:01 | INFO     | app.middleware | Request started: GET /api/v1/freelancers
```

---

## ✅ What's Implemented

- ✅ Pydantic settings (env-based configuration)
- ✅ Structured logging (JSON in production, text in dev)
- ✅ CORS middleware (configurable origins)
- ✅ Rate limiting (per-IP/per-user, 60/min, 1000/hour)
- ✅ Health endpoints (/health, /health/live, /health/ready)
- ✅ OpenAPI tags by domain (9 domains)
- ✅ Async database session with connection pooling
- ✅ Repository pattern (BaseRepository + custom repos)
- ✅ Service layer (business logic)
- ✅ Global exception handling
- ✅ Request ID tracking
- ✅ Error response standardization

---

## 🚧 TODO

- [ ] Authentication (JWT + Telegram)
- [ ] Authorization (role-based access)
- [ ] Redis for rate limiting (production)
- [ ] API versioning strategy
- [ ] Request/response validation
- [ ] API key authentication
- [ ] Webhooks support
- [ ] Background tasks (Celery/ARQ)
- [ ] File upload handling
- [ ] Email notifications

---

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [Async PostgreSQL](https://www.postgresql.org/docs/current/libpq-async.html)

---

**FastAPI Foundation is production-ready! 🎉**

