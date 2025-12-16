# 📊 LaunchKit AI - Entity Relationship Diagram

Complete database schema with relationships and indexes.

## 🗂️ Database Schema (6 Tables)

```
┌──────────────────────────────────────────────────────────────────┐
│                            USERS                                  │
│ ──────────────────────────────────────────────────────────────── │
│ PK  id                    UUID                                    │
│ UK  email                 VARCHAR(255)      [INDEX]               │
│ UK  telegram_id           BIGINT            [INDEX]               │
│     full_name             VARCHAR(255)                            │
│     plan                  VARCHAR(50)       DEFAULT 'free'        │
│     password_hash         VARCHAR(255)      NULLABLE              │
│     created_at            TIMESTAMP                               │
│     updated_at            TIMESTAMP                               │
└────────────┬────────────────────────┬────────────────────────────┘
             │ 1:N                    │ 1:1
             │                        │
    ┌────────▼──────────┐    ┌───────▼──────────────┐
    │                   │    │                       │
┌───▼───────────────────────────────────────────────────────────┐
│                         PROJECTS                               │
│ ────────────────────────────────────────────────────────────── │
│ PK  id                    UUID                                  │
│ FK  user_id               UUID → users.id      [INDEX]          │
│     title                 VARCHAR(255)                           │
│     description           TEXT                                   │
│     status                VARCHAR(50)          [INDEX]           │
│                           DEFAULT 'ideation'                     │
│     ai_generated_spec     JSONB                                  │
│     budget_min            INTEGER                                │
│     budget_max            INTEGER                                │
│     timeline_weeks        INTEGER                                │
│     created_at            TIMESTAMP                              │
│     updated_at            TIMESTAMP                              │
│                                                                   │
│ Composite Index: (user_id, status)                              │
└────────────┬────────────────────────────────────────────────────┘
             │ 1:N
             │
    ┌────────▼──────────┐
    │                   │
┌───▼───────────────────────────────────────────────────────────┐
│                    AI_CONVERSATIONS                            │
│ ────────────────────────────────────────────────────────────── │
│ PK  id                    UUID                                  │
│ FK  user_id               UUID → users.id      [INDEX]          │
│ FK  project_id            UUID → projects.id   [INDEX] NULLABLE │
│     messages              JSONB                DEFAULT []        │
│     context               JSONB                NULLABLE          │
│     created_at            TIMESTAMP                              │
│     updated_at            TIMESTAMP                              │
└───────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────┐
│                         FREELANCERS                               │
│ ──────────────────────────────────────────────────────────────── │
│ PK  id                    UUID                                    │
│ FK  user_id               UUID → users.id      [INDEX] UNIQUE    │
│     role                  VARCHAR(100)         [INDEX]            │
│     skills                TEXT[]               [GIN INDEX] ⭐     │
│     hourly_rate_usd       INTEGER              [INDEX]            │
│     availability          VARCHAR(50)          [INDEX]            │
│     portfolio_url         VARCHAR(500)         NULLABLE           │
│     bio                   TEXT                                    │
│     rating                DECIMAL(3,2)         [INDEX] DEFAULT 0  │
│     projects_completed    INTEGER              DEFAULT 0          │
│     verified              BOOLEAN              [INDEX] DEFAULT F  │
│     created_at            TIMESTAMP                               │
│     updated_at            TIMESTAMP                               │
└────────────┬─────────────────────────────────────────────────────┘
             │ 1:N
             │
    ┌────────▼──────────┐
    │                   │
┌───▼───────────────────────────────────────────────────────────┐
│                      APPLICATIONS                              │
│ ────────────────────────────────────────────────────────────── │
│ PK  id                    UUID                                  │
│ FK  project_id            UUID → projects.id   [INDEX]          │
│ FK  freelancer_id         UUID → freelancers.id [INDEX]         │
│     status                VARCHAR(50)          [INDEX]           │
│                           DEFAULT 'pending'                      │
│     cover_letter          TEXT                 NULLABLE          │
│     proposed_rate         JSONB                NULLABLE          │
│     details               JSONB                NULLABLE          │
│     created_at            TIMESTAMP                              │
│     updated_at            TIMESTAMP                              │
│                                                                   │
│ Composite Index: (project_id, status)                           │
└───────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────┐
│                       DFY_INQUIRIES                               │
│ ──────────────────────────────────────────────────────────────── │
│ PK  id                    UUID                                    │
│ FK  user_id               UUID → users.id      [INDEX]            │
│     project_name          VARCHAR(255)                            │
│     project_description   TEXT                                    │
│     project_type          VARCHAR(100)         NULLABLE           │
│     budget                VARCHAR(50)          NULLABLE           │
│     timeline              VARCHAR(50)          NULLABLE           │
│     stage                 VARCHAR(50)          NULLABLE           │
│     additional_info       TEXT                 NULLABLE           │
│     status                VARCHAR(50)          [INDEX] DEFAULT 'pending' │
│     contact_info          JSONB                NULLABLE           │
│     created_at            TIMESTAMP            [INDEX]            │
│     updated_at            TIMESTAMP                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔗 **Relationships**

### One-to-Many (1:N)

```sql
users (1) ──────> projects (N)
  A user can have multiple projects

users (1) ──────> ai_conversations (N)
  A user can have multiple AI conversations

projects (1) ───> ai_conversations (N)
  A project can have multiple conversations

projects (1) ───> applications (N)
  A project can receive multiple applications

freelancers (1) ─> applications (N)
  A freelancer can submit multiple applications

users (1) ──────> dfy_inquiries (N)
  A user can submit multiple DFY requests
```

### One-to-One (1:1)

```sql
users (1) ◄────► freelancers (1)
  A user can have one freelancer profile
```

---

## 🔍 **Indexes Summary**

### Total Indexes: 27

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| **users** | email | B-tree | Login lookup |
| **users** | telegram_id | B-tree | Telegram auth |
| **projects** | user_id | B-tree | User's projects |
| **projects** | status | B-tree | Filter by status |
| **projects** | (user_id, status) | B-tree | Combined filter |
| **ai_conversations** | user_id | B-tree | User's chats |
| **ai_conversations** | project_id | B-tree | Project chats |
| **freelancers** | user_id | B-tree | Profile lookup |
| **freelancers** | role | B-tree | Role filter |
| **freelancers** | **skills** | **GIN** | **Array search ⭐** |
| **freelancers** | hourly_rate_usd | B-tree | Rate filter |
| **freelancers** | availability | B-tree | Availability filter |
| **freelancers** | verified | B-tree | Verified filter |
| **freelancers** | rating | B-tree | Sort by rating |
| **applications** | project_id | B-tree | Project apps |
| **applications** | freelancer_id | B-tree | Freelancer apps |
| **applications** | status | B-tree | Status filter |
| **applications** | (project_id, status) | B-tree | Combined filter |
| **dfy_inquiries** | user_id | B-tree | User's inquiries |
| **dfy_inquiries** | status | B-tree | Status filter |
| **dfy_inquiries** | created_at | B-tree | Sort by date |

---

## 🎯 **Key Queries**

### Search Freelancers (Uses 4 Indexes)

```sql
SELECT f.*, u.full_name
FROM freelancers f
JOIN users u ON f.user_id = u.id
WHERE f.role = 'developer'                    -- idx_freelancers_role
  AND f.skills && ARRAY['React', 'TypeScript'] -- idx_freelancers_skills (GIN) ⭐
  AND f.hourly_rate_usd BETWEEN 50 AND 100    -- idx_freelancers_hourly_rate
  AND f.verified = true                        -- idx_freelancers_verified
ORDER BY f.rating DESC,                        -- idx_freelancers_rating
         f.projects_completed DESC;
```

### Get User's Projects by Status (Uses Composite Index)

```sql
SELECT * FROM projects
WHERE user_id = $1          -- idx_projects_user_status (composite)
  AND status = 'planning'   -- idx_projects_user_status (composite)
ORDER BY created_at DESC;
```

### List Applications for Project (Uses Composite Index)

```sql
SELECT a.*, f.*, u.full_name
FROM applications a
JOIN freelancers f ON a.freelancer_id = f.id
JOIN users u ON f.user_id = u.id
WHERE a.project_id = $1            -- idx_applications_project_status
  AND a.status = 'pending'         -- idx_applications_project_status
ORDER BY a.created_at DESC;
```

---

## 📊 **Data Statistics (After Seed)**

| Table | Records | Purpose |
|-------|---------|---------|
| users | 21 | 1 demo + 20 freelancers |
| projects | 3 | Demo projects |
| ai_conversations | 1 | Sample conversation |
| freelancers | 20 | Marketplace |
| applications | 0 | Ready for creation |
| dfy_inquiries | 0 | Ready for submissions |

---

## 🔗 **CASCADE Deletions**

### DELETE user

```sql
DELETE FROM users WHERE id = 'user-uuid';

-- Also deletes (CASCADE):
DELETE FROM projects WHERE user_id = 'user-uuid';
  └─> DELETE FROM ai_conversations WHERE project_id IN (...)
  └─> DELETE FROM applications WHERE project_id IN (...)

DELETE FROM freelancers WHERE user_id = 'user-uuid';
  └─> DELETE FROM applications WHERE freelancer_id = '...';

DELETE FROM ai_conversations WHERE user_id = 'user-uuid';
DELETE FROM dfy_inquiries WHERE user_id = 'user-uuid';
```

### DELETE project

```sql
DELETE FROM projects WHERE id = 'project-uuid';

-- Also deletes:
DELETE FROM ai_conversations WHERE project_id = 'project-uuid';
DELETE FROM applications WHERE project_id = 'project-uuid';
```

---

## 📚 **Schema Documentation**

**Complete details:**
- DATABASE.md - Full schema documentation (900+ lines)
- DATABASE_DIAGRAM.md - Visual diagrams (400+ lines)
- schema.sql - Raw SQL (200 lines)

**Quick reference:**
- 6 tables
- 27 indexes (including 1 GIN)
- UUID primary keys
- JSONB for flexible data
- Proper foreign keys with CASCADE

---

**ERD generated from production schema! 📊✨**

