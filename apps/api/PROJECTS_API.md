# 📁 Projects API - Complete CRUD Guide

Complete project management endpoints with ownership checks and validation.

## 📊 Overview

Projects represent user's startup ideas with technical specifications, budget, and timeline.

**Endpoints:**
- `GET /api/v1/projects` - List user's projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/{id}` - Get project details
- `PUT /api/v1/projects/{id}` - Full update
- `PATCH /api/v1/projects/{id}` - Partial update
- `DELETE /api/v1/projects/{id}` - Delete project
- `POST /api/v1/projects/draft` - Create from idea

**All endpoints require JWT authentication and enforce ownership checks.**

---

## 📡 API Endpoints

### GET /api/v1/projects

List all projects for current user.

**Query Parameters:**
- `status` (optional): Filter by status
  - Values: `ideation`, `planning`, `hiring`, `development`, `launched`
- `skip` (optional): Pagination offset (default: 0)
- `limit` (optional): Pagination limit (default: 100, max: 100)

**Request:**
```bash
curl http://localhost:8000/api/v1/projects?status=planning&limit=10 \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "user-uuid",
    "title": "AI Task Manager",
    "description": "Smart task prioritization...",
    "status": "planning",
    "budget_min": 12000,
    "budget_max": 18000,
    "timeline_weeks": 12,
    "created_at": "2024-12-15T10:00:00Z"
  }
]
```

**Features:**
- ✅ Automatic filtering by current user
- ✅ Optional status filter
- ✅ Pagination support
- ✅ Ordered by created_at DESC

---

### POST /api/v1/projects

Create a new project.

**Request Body:**
```json
{
  "title": "My Startup Project",
  "description": "A revolutionary app for...",
  "budget_min": 10000,
  "budget_max": 20000,
  "timeline_weeks": 12
}
```

**Response:** `201 Created`
```json
{
  "id": "new-project-uuid",
  "user_id": "current-user-uuid",
  "title": "My Startup Project",
  "description": "A revolutionary app for...",
  "status": "ideation",
  "budget_min": 10000,
  "budget_max": 20000,
  "timeline_weeks": 12,
  "created_at": "2024-12-15T10:30:00Z"
}
```

**Validation:**
- ✅ `title` required (1-255 characters)
- ✅ `title` trimmed automatically
- ✅ `description` trimmed if provided
- ✅ `budget_min` must be positive
- ✅ `budget_max` must be >= budget_min
- ✅ Default status: "ideation"

**Errors:**
- `400 Bad Request` - Title empty or too long
- `401 Unauthorized` - No/invalid token
- `422 Validation Error` - Invalid field types

---

### GET /api/v1/projects/{id}

Get project details by ID.

**Request:**
```bash
curl http://localhost:8000/api/v1/projects/{uuid} \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "title": "AI Task Manager",
  "description": "...",
  "status": "planning",
  "budget_min": 12000,
  "budget_max": 18000,
  "timeline_weeks": 12,
  "created_at": "2024-12-15T10:00:00Z"
}
```

**Ownership Check:**
- ✅ Verifies `project.user_id == current_user.id`
- ✅ Returns 403 if user doesn't own project

**Errors:**
- `404 Not Found` - Project doesn't exist
- `403 Forbidden` - Not project owner
- `401 Unauthorized` - No/invalid token

---

### PUT /api/v1/projects/{id}

Full update of project (all fields).

**Request:**
```bash
curl -X PUT http://localhost:8000/api/v1/projects/{uuid} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "status": "planning",
    "budget_min": 15000,
    "budget_max": 25000,
    "timeline_weeks": 16
  }'
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "title": "Updated Title",
  "description": "Updated description",
  "status": "planning",
  "budget_min": 15000,
  "budget_max": 25000,
  "timeline_weeks": 16,
  "created_at": "2024-12-15T10:00:00Z"
}
```

**Features:**
- ✅ Updates all provided fields
- ✅ Ownership check before update
- ✅ Field validation
- ✅ Trimming whitespace

---

### PATCH /api/v1/projects/{id}

Partial update of project (only specified fields).

**Request:**
```bash
curl -X PATCH http://localhost:8000/api/v1/projects/{uuid} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "development"
  }'
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "title": "Original Title",
  "description": "Original description",
  "status": "development",  // ← Updated
  "budget_min": 12000,
  "budget_max": 18000,
  "timeline_weeks": 12,
  "created_at": "2024-12-15T10:00:00Z"
}
```

**Use Cases:**
- Update status: `{ "status": "launched" }`
- Update budget: `{ "budget_min": 20000, "budget_max": 30000 }`
- Update timeline: `{ "timeline_weeks": 20 }`
- Update title: `{ "title": "New Name" }`

**Features:**
- ✅ Only updates specified fields
- ✅ Other fields unchanged
- ✅ Ownership check
- ✅ Validation on updated fields

---

### DELETE /api/v1/projects/{id}

Delete project permanently.

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/v1/projects/{uuid} \
  -H "Authorization: Bearer {token}"
```

**Response:** `204 No Content`

**Features:**
- ✅ Ownership check before deletion
- ✅ CASCADE delete (conversations, applications)
- ✅ Permanent deletion (cannot be undone)

**Errors:**
- `404 Not Found` - Project doesn't exist
- `403 Forbidden` - Not project owner
- `401 Unauthorized` - No/invalid token

**Related Data Deleted:**
- All AI conversations linked to project
- All applications linked to project
- All project metadata

---

### POST /api/v1/projects/draft

Create draft project from AI-generated idea.

**Request:**
```json
{
  "idea": {
    "id": "1",
    "title": "AI Task Manager",
    "one_liner": "...",
    "problem_statement": "...",
    "solution_overview": "...",
    "target_market": "...",
    "revenue_model": "...",
    "mvp_features": ["...", "..."],
    "estimated_cost": 15000,
    "timeline_months": 3
  },
  "conversation_id": "uuid-or-null"
}
```

**Response:**
```json
{
  "id": "new-project-uuid",
  "user_id": "current-user-uuid",
  "title": "AI Task Manager",
  "description": "Smart task prioritization...",
  "status": "ideation",
  "budget_min": 12000,  // -20%
  "budget_max": 18000,  // +20%
  "timeline_weeks": 12,  // 3 months × 4
  "created_at": "2024-12-15T10:00:00Z"
}
```

**Features:**
- ✅ Auto-calculate budget range (±20%)
- ✅ Convert timeline months → weeks
- ✅ Store full idea in `ai_generated_spec` JSONB
- ✅ Link to conversation
- ✅ Set status: "ideation"

---

## 🔒 Ownership & Security

### Ownership Checks

All endpoints (except LIST) verify ownership:

```python
# In service layer
async def get_project(self, project_id: UUID, user_id: UUID) -> Project:
    project = await self.repo.get(project_id)
    
    # Verify ownership
    if project.user_id != user_id:
        raise ForbiddenException("You don't have access to this project")
    
    return project
```

**Enforced on:**
- ✅ GET /projects/{id}
- ✅ PUT /projects/{id}
- ✅ PATCH /projects/{id}
- ✅ DELETE /projects/{id}

**Not Required on:**
- LIST /projects (auto-filtered by user_id)
- POST /projects (creates for current user)
- POST /projects/draft (creates for current user)

### Authorization Flow

```
1. Request with JWT token
   ↓
2. Extract token from Authorization header
   ↓
3. Decode JWT → get user_id
   ↓
4. Fetch user from database
   ↓
5. Pass user to endpoint
   ↓
6. Service verifies project.user_id == current_user.id
   ↓ If match
7. Allow operation
   ↓ If mismatch
8. Return 403 Forbidden
```

---

## ✅ Validation Rules

### Title
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 255 characters
- **Trimmed**: Yes (automatic)
- **Error**: 400 Bad Request

### Description
- **Required**: No
- **Max Length**: Unlimited (TEXT field)
- **Trimmed**: Yes (automatic)

### Status
- **Valid Values:**
  - `ideation` - Initial stage
  - `planning` - Tech spec created
  - `hiring` - Looking for team
  - `development` - In progress
  - `launched` - Live product
- **Default**: `ideation`

### Budget
- **Min**: 0 (implicit)
- **budget_max** must be >= **budget_min**

### Timeline
- **Unit**: Weeks
- **Min**: 1 week (implicit)
- **Typical**: 8-24 weeks

---

## 📊 Project Lifecycle

```
ideation
  ↓ Tech spec generated
planning
  ↓ Team assembled
hiring
  ↓ Development starts
development
  ↓ Product ready
launched
```

**Status Transitions:**
- `POST /projects` → status: "ideation"
- `POST /projects/draft` → status: "ideation"
- `POST /ai/generate-spec` → status: "planning"
- `PATCH /projects/{id}` → status: (any)

---

## 🧪 Testing Examples

### 1. Create Project

```bash
TOKEN="your-jwt-token"

curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Startup",
    "description": "Revolutionary app",
    "budget_min": 10000,
    "budget_max": 20000,
    "timeline_weeks": 12
  }'
```

### 2. List Projects

```bash
# All projects
curl http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl "http://localhost:8000/api/v1/projects?status=planning" \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl "http://localhost:8000/api/v1/projects?skip=0&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get Single Project

```bash
PROJECT_ID="uuid-here"

curl http://localhost:8000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Update Project (Partial)

```bash
# Update just the status
curl -X PATCH http://localhost:8000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "development"
  }'

# Update multiple fields
curl -X PATCH http://localhost:8000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "budget_max": 25000
  }'
```

### 5. Update Project (Full)

```bash
curl -X PUT http://localhost:8000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Completely New Title",
    "description": "New description",
    "status": "planning",
    "budget_min": 15000,
    "budget_max": 30000,
    "timeline_weeks": 16
  }'
```

### 6. Delete Project

```bash
curl -X DELETE http://localhost:8000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Create Draft from Idea

```bash
curl -X POST http://localhost:8000/api/v1/projects/draft \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idea": {
      "id": "1",
      "title": "AI Task Manager",
      "one_liner": "Smart prioritization",
      "estimated_cost": 15000,
      "timeline_months": 3
    },
    "conversation_id": "conv-uuid"
  }'
```

---

## 🔒 Security Features

### 1. **Ownership Enforcement**

Every endpoint checks ownership:

```python
# Automatic in service layer
project = await service.get_project(project_id, current_user.id)

# Raises ForbiddenException if user doesn't own project
```

**Example Error:**
```json
{
  "error": "forbidden",
  "message": "You don't have access to this project",
  "details": null
}
```

### 2. **Authentication Required**

All endpoints require valid JWT token:

```python
current_user: User = Depends(get_current_user)
```

**Example Error:**
```json
{
  "error": "unauthorized",
  "message": "Invalid authentication credentials",
  "details": null
}
```

### 3. **Input Validation**

Pydantic models validate all inputs:

```python
class ProjectCreate(BaseModel):
    title: str  # Required
    description: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    timeline_weeks: Optional[int] = None
```

**Example Error:**
```json
{
  "error": "validation_error",
  "message": "Request validation failed",
  "details": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 📊 Project Status Flow

### Status Workflow

```
ideation (draft)
  ↓ Generate tech spec
planning (spec ready)
  ↓ Post job / browse marketplace
hiring (looking for team)
  ↓ Accept applications
development (building)
  ↓ Launch product
launched (live)
```

### Updating Status

```bash
# Move to next stage
PATCH /api/v1/projects/{id}
{
  "status": "hiring"
}
```

### Status Filters

```bash
# Get all projects in hiring stage
GET /api/v1/projects?status=hiring

# Get all active development projects
GET /api/v1/projects?status=development
```

---

## 💾 Data Storage

### Project Table

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ideation',
    ai_generated_spec JSONB,  -- Full idea + spec data
    budget_min INTEGER,
    budget_max INTEGER,
    timeline_weeks INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### JSONB Spec Structure

```json
{
  "idea": {
    "title": "AI Task Manager",
    "problem_statement": "...",
    "solution_overview": "...",
    "mvp_features": ["...", "..."]
  },
  "spec_markdown": "# 1. Executive Summary\n\n...",
  "sections": [
    { "title": "Executive Summary", "content": "...", "order": 0 }
  ],
  "version": "1.0",
  "generated_at": "2024-12-15T10:30:00Z",
  "conversation_id": "uuid"
}
```

---

## 🔍 Query Examples

### Get User's Active Projects

```bash
GET /api/v1/projects?status=development&status=hiring
```

### Get Recent Projects

```bash
GET /api/v1/projects?limit=5
# Returns 5 most recent (ordered by created_at DESC)
```

### Pagination

```bash
# First page
GET /api/v1/projects?skip=0&limit=10

# Second page
GET /api/v1/projects?skip=10&limit=10

# Third page
GET /api/v1/projects?skip=20&limit=10
```

---

## 🎯 Use Cases

### 1. **Dashboard View**

```bash
# Get all user's projects
GET /api/v1/projects

# Display cards with:
# - Title
# - Status badge
# - Budget
# - Timeline
# - Created date
```

### 2. **Status Board**

```bash
# Ideation column
GET /api/v1/projects?status=ideation

# Planning column
GET /api/v1/projects?status=planning

# Hiring column
GET /api/v1/projects?status=hiring

# Development column
GET /api/v1/projects?status=development
```

### 3. **Project Detail Page**

```bash
# Get full project data
GET /api/v1/projects/{id}

# Get tech spec
GET /api/v1/ai/spec/{id}

# Get applications
GET /api/v1/applications?project_id={id}
```

### 4. **Edit Project**

```bash
# Update fields
PATCH /api/v1/projects/{id}
{
  "title": "Updated Title",
  "budget_max": 25000
}
```

### 5. **Delete Project**

```bash
# Confirm dialog, then:
DELETE /api/v1/projects/{id}
```

---

## 🛡️ Error Handling

### Common Errors

| Status | Error | When | Solution |
|--------|-------|------|----------|
| 400 | Bad Request | Empty title | Provide valid title |
| 401 | Unauthorized | No/invalid token | Authenticate first |
| 403 | Forbidden | Not project owner | Access only your projects |
| 404 | Not Found | Project doesn't exist | Check project ID |
| 422 | Validation Error | Invalid field types | Fix request body |

### Error Response Format

```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "details": null  // or additional info
}
```

---

## ✅ Implementation Checklist

- [x] GET /api/v1/projects (list with filters)
- [x] POST /api/v1/projects (create with validation)
- [x] GET /api/v1/projects/{id} (get with ownership)
- [x] PUT /api/v1/projects/{id} (full update)
- [x] PATCH /api/v1/projects/{id} (partial update)
- [x] DELETE /api/v1/projects/{id} (delete with ownership)
- [x] POST /api/v1/projects/draft (create from idea)
- [x] Ownership checks on all endpoints
- [x] Input validation (title, budget, timeline)
- [x] Status filtering
- [x] Pagination support
- [x] Comprehensive error handling
- [x] OpenAPI documentation

---

## 📚 Related Endpoints

### Get Tech Spec

```bash
GET /api/v1/ai/spec/{project_id}
```

### Export Tech Spec

```bash
# As PDF
GET /api/exports/projects/{project_id}/pdf

# As Markdown
GET /api/exports/projects/{project_id}/markdown
```

### Get Applications

```bash
GET /api/v1/applications?project_id={id}
```

---

## 🎉 Summary

**Complete Projects CRUD with:**

✅ 7 endpoints (LIST, CREATE, GET, PUT, PATCH, DELETE, DRAFT)  
✅ Ownership checks on all operations  
✅ Input validation (title, budget, timeline)  
✅ Status filtering  
✅ Pagination support  
✅ CASCADE delete (related data)  
✅ JSONB spec storage  
✅ Comprehensive error handling  
✅ OpenAPI documentation  

**Projects API is production-ready! 📁**

