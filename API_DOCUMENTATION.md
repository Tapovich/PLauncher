# 📡 LaunchKit AI - API Documentation

Complete REST API documentation with OpenAPI integration.

## 📊 Overview

**Base URL:** `https://api.launchkit.ai/api/v1`  
**Documentation:** `https://api.launchkit.ai/docs`  
**Alternative Docs:** `https://api.launchkit.ai/redoc`  
**OpenAPI JSON:** `https://api.launchkit.ai/openapi.json`  

**Version:** 1.0.0  
**Authentication:** JWT Bearer Token  

---

## 🔓 **Authentication**

All endpoints except public ones require JWT authentication:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Get Token:**
```bash
POST /api/v1/auth/telegram
{
  "init_data": "query_id=AAH...&user=%7B%22id%22%3A123..."
}

# Returns:
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {...}
}
```

---

## 📚 **OpenAPI Documentation**

### Interactive Swagger UI

**URL:** `http://localhost:8000/docs` (development)  
**URL:** `https://api.launchkit.ai/docs` (production)

**Features:**
- ✅ Try endpoints directly in browser
- ✅ Auto-generated request examples
- ✅ Response schemas
- ✅ Authentication (click "Authorize")
- ✅ Organized by tags (9 domains)

**How to Use:**
1. Open `/docs` in browser
2. Click "Authorize" button
3. Enter: `Bearer your-jwt-token`
4. Click "Authorize"
5. Try any endpoint

### Alternative ReDoc UI

**URL:** `http://localhost:8000/redoc` (development)  
**URL:** `https://api.launchkit.ai/redoc` (production)

**Features:**
- ✅ Three-panel layout
- ✅ Search functionality
- ✅ Print-friendly
- ✅ Mobile-responsive

### OpenAPI JSON

**URL:** `/openapi.json`

**Use Cases:**
- Generate client SDKs
- Import to Postman
- API testing tools
- Documentation tools

**Generate TypeScript Client:**
```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.ts
```

---

## 🏷️ **API Tags (9 Domains)**

| Tag | Endpoints | Description |
|-----|-----------|-------------|
| **Health** | 4 | Status & health checks |
| **Authentication** | 4 | Login, register, JWT |
| **Users** | 3 | User management |
| **Projects** | 7 | Project CRUD |
| **AI** | 6 | Chat, ideas, specs |
| **Freelancers** | 5 | Marketplace search |
| **Applications** | 4 | Project applications |
| **Done-For-You** | 3 | Full-service requests |
| **Exports** | 2 | PDF/Markdown export |

**Total: 38 endpoints**

---

## 📖 **Endpoint Reference**

### Health (4 endpoints)

```
GET  /                Health check
GET  /health          Detailed status
GET  /health/live     Kubernetes liveness
GET  /health/ready    Kubernetes readiness
```

### Authentication (4 endpoints)

```
POST /auth/telegram   Telegram login
GET  /auth/me         Current user
POST /auth/login      Email/password (TODO)
POST /auth/register   Register (TODO)
```

### Users (3 endpoints)

```
GET   /users/me       Get current user
PATCH /users/me       Update profile
GET   /users/{id}     Get user (public)
```

### Projects (7 endpoints)

```
GET    /projects            List user's projects
POST   /projects            Create project
GET    /projects/{id}       Get project
PUT    /projects/{id}       Full update
PATCH  /projects/{id}       Partial update
DELETE /projects/{id}       Delete project
POST   /projects/draft      Create from idea
```

### AI (6 endpoints)

```
POST /ai/chat                 Continue conversation
POST /ai/generate-ideas       Generate startup ideas
POST /ai/generate-spec        Generate tech spec
GET  /ai/spec/{project_id}    Get stored spec
GET  /ai/conversations/{id}   Get conversation
GET  /ai/conversations        List conversations
```

### Freelancers (5 endpoints)

```
GET  /freelancers         Search with filters
GET  /freelancers/top     Top rated
GET  /freelancers/{id}    Get profile
POST /freelancers         Create profile
PUT  /freelancers/{id}    Update profile
```

### Applications (4 endpoints)

```
POST /applications        Apply to project
GET  /applications/{id}   Get application
PUT  /applications/{id}   Update status
GET  /applications        List applications
```

### Done-For-You (3 endpoints)

```
POST /dfy/inquiry         Submit inquiry
GET  /dfy/inquiry/{id}    Get inquiry
GET  /dfy/inquiries       List inquiries
```

### Exports (2 endpoints)

```
GET /exports/projects/{id}/pdf       Export as PDF
GET /exports/projects/{id}/markdown  Export as Markdown
```

---

## 🔐 **Security**

### Rate Limiting

```
100 requests/minute per user
1000 requests/hour per user
```

**Response (429):**
```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded: 100 requests per minute"
}
```

### Error Format

```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "details": null
}
```

**Error Codes:**
- `bad_request` - 400
- `unauthorized` - 401
- `forbidden` - 403
- `not_found` - 404
- `conflict` - 409
- `validation_error` - 422
- `rate_limit_exceeded` - 429
- `internal_server_error` - 500

---

## 📊 **Response Formats**

### Success (200/201)

```json
{
  "id": "uuid",
  "field1": "value",
  "field2": "value",
  "created_at": "2024-12-15T10:00:00Z"
}
```

### List (200)

```json
[
  { "id": "uuid-1", ... },
  { "id": "uuid-2", ... }
]
```

### No Content (204)

No response body (for DELETE operations)

### Error (4xx/5xx)

```json
{
  "error": "not_found",
  "message": "Project not found",
  "details": null
}
```

---

## 🧪 **Testing with cURL**

### Authenticate

```bash
curl -X POST http://localhost:8000/api/v1/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"init_data": "query_id=..."}'

# Save token
TOKEN="eyJ0eXAiOiJKV1Qi..."
```

### Create Project

```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Startup",
    "description": "Revolutionary app",
    "budget_min": 10000,
    "budget_max": 20000
  }'
```

### Search Freelancers

```bash
curl "http://localhost:8000/api/v1/freelancers?role=developer&skills=React,TypeScript"
```

### Generate Ideas

```bash
curl -X POST http://localhost:8000/api/v1/ai/generate-ideas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problems": "Task management",
    "industries": "Productivity",
    "budget_range": "$10K-20K",
    "timeline": "3 months",
    "has_technical_skills": false
  }'
```

---

## 📚 **Complete Documentation**

### Auto-Generated

- **Swagger UI**: `/docs` - Interactive testing
- **ReDoc**: `/redoc` - Pretty documentation
- **OpenAPI JSON**: `/openapi.json` - Machine-readable spec

### Manual Documentation

- **PROJECTS_API.md** - Projects CRUD guide
- **AI_INTEGRATION.md** - AI endpoints guide
- **AUTHENTICATION.md** - Auth system guide
- **SECURITY.md** - Security features
- **FASTAPI_FOUNDATION.md** - Architecture

---

## 🎯 **Quick Links**

- **API Docs**: https://api.launchkit.ai/docs
- **Health Check**: https://api.launchkit.ai/health
- **OpenAPI Spec**: https://api.launchkit.ai/openapi.json
- **Source Code**: See `apps/api/` directory

---

**Complete API documentation with OpenAPI! 📡✨**

