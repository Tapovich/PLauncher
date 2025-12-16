# 📊 LaunchKit AI - Database Diagram

Visual representation of the database schema.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USERS                                      │
│ ─────────────────────────────────────────────────────────────────── │
│ • id (UUID, PK)                                                      │
│ • email (VARCHAR, UNIQUE, INDEX)                                     │
│ • telegram_id (BIGINT, UNIQUE, INDEX)                                │
│ • full_name (VARCHAR)                                                │
│ • plan (VARCHAR) [free, pro, enterprise]                             │
│ • password_hash (VARCHAR)                                            │
│ • created_at, updated_at (TIMESTAMP)                                 │
└───────────────┬──────────────────────┬──────────────────────────────┘
                │                      │
                │ 1:N                  │ 1:1
                │                      │
                ▼                      ▼
┌───────────────────────────┐   ┌──────────────────────────────────┐
│       PROJECTS            │   │         FREELANCERS              │
│ ────────────────────────  │   │ ──────────────────────────────── │
│ • id (UUID, PK)           │   │ • id (UUID, PK)                  │
│ • user_id (UUID, FK)  ────┼───┤ • user_id (UUID, FK, UNIQUE)     │
│ • title (VARCHAR)         │   │ • role (VARCHAR, INDEX)          │
│ • description (TEXT)      │   │ • skills (TEXT[], GIN INDEX) ⭐  │
│ • status (VARCHAR, INDEX) │   │ • hourly_rate_usd (INT, INDEX)   │
│   [ideation, planning,    │   │ • availability (VARCHAR, INDEX)  │
│    hiring, development,   │   │ • portfolio_url (VARCHAR)        │
│    launched]              │   │ • bio (TEXT)                     │
│ • ai_generated_spec       │   │ • rating (DECIMAL, INDEX)        │
│   (JSONB)                 │   │ • projects_completed (INT)       │
│ • budget_min (INT)        │   │ • verified (BOOLEAN, INDEX)      │
│ • budget_max (INT)        │   │ • created_at, updated_at         │
│ • timeline_weeks (INT)    │   └────────────┬─────────────────────┘
│ • created_at, updated_at  │                │
└───────┬───────────────────┘                │
        │ 1:N                                │ 1:N
        │                                    │
        ▼                                    │
┌─────────────────────────┐                 │
│   AI_CONVERSATIONS      │                 │
│ ──────────────────────  │                 │
│ • id (UUID, PK)         │                 │
│ • user_id (UUID, FK) ◄──┼─────────────────┘
│ • project_id (UUID, FK) │                 
│ • messages (JSONB[])    │    ┌────────────▼─────────────────┐
│   [{role, content,      │    │       APPLICATIONS            │
│     timestamp}]         │    │ ──────────────────────────    │
│ • context (JSONB)       │    │ • id (UUID, PK)               │
│ • created_at, updated_at│◄───┤ • project_id (UUID, FK, IDX)  │
└─────────────────────────┘    │ • freelancer_id (UUID, FK,    │
                               │   INDEX)                      │
                               │ • status (VARCHAR, INDEX)     │
                               │   [pending, accepted,         │
                               │    rejected, withdrawn]       │
                               │ • cover_letter (TEXT)         │
                               │ • proposed_rate (JSONB)       │
                               │   {amount, currency, type}    │
                               │ • details (JSONB)             │
                               │ • created_at, updated_at      │
                               └───────────────────────────────┘
```

---

## Relationships

### **1:N (One-to-Many)**

```
USER ──┐
       ├──► PROJECTS      (A user can have multiple projects)
       ├──► AI_CONVERSATIONS (A user can have multiple conversations)
       └──► (via FREELANCER) APPLICATIONS
       
PROJECT ──┐
          ├──► AI_CONVERSATIONS (A project can have multiple conversations)
          └──► APPLICATIONS (A project can receive multiple applications)
          
FREELANCER ──► APPLICATIONS (A freelancer can submit multiple applications)
```

### **1:1 (One-to-One)**

```
USER ◄──► FREELANCER  (A user can have one freelancer profile)
```

---

## Key Indexes

### **Performance Optimized:**

| Table | Index Type | Columns | Purpose |
|-------|------------|---------|---------|
| users | B-tree | email | Fast login lookup |
| users | B-tree | telegram_id | Telegram auth |
| projects | B-tree | user_id | User's projects |
| projects | B-tree | status | Filter by status |
| projects | B-tree (composite) | (user_id, status) | Combined filter |
| freelancers | **GIN** | **skills** | **Array search ⭐** |
| freelancers | B-tree | role | Filter by role |
| freelancers | B-tree | hourly_rate_usd | Price range |
| freelancers | B-tree | rating | Sort by rating |
| freelancers | B-tree | verified | Filter verified |
| applications | B-tree | project_id | Project applications |
| applications | B-tree | freelancer_id | Freelancer history |
| applications | B-tree (composite) | (project_id, status) | Active applications |

---

## Data Flow Examples

### **1. User Creates Project**
```
┌──────┐
│ USER │
└──┬───┘
   │ creates
   ▼
┌─────────┐
│ PROJECT │──────► Triggers AI conversation
└─────────┘
```

### **2. Freelancer Applies**
```
┌────────────┐         ┌─────────────┐
│ FREELANCER │─applies─►│ APPLICATION │◄──links──┐
└────────────┘         └─────────────┘          │
                                        ┌─────────┴───┐
                                        │   PROJECT   │
                                        └─────────────┘
```

### **3. AI Conversation**
```
┌──────┐
│ USER │──starts──┐
└──────┘          │
                  ▼
         ┌─────────────────┐
         │ AI_CONVERSATION │──linked to──┐
         └─────────────────┘             │
                                ┌────────▼──┐
                                │  PROJECT  │
                                └───────────┘
```

---

## Search Patterns

### **Find Freelancers by Skills (GIN Index)**
```sql
-- Find freelancers with ALL these skills
SELECT * FROM freelancers 
WHERE skills @> ARRAY['React', 'TypeScript', 'Node.js'];

-- Find freelancers with ANY of these skills  
SELECT * FROM freelancers 
WHERE skills && ARRAY['Python', 'Go', 'Rust'];
```

### **Marketplace Search (Multi-index)**
```sql
SELECT f.*, u.full_name
FROM freelancers f
JOIN users u ON f.user_id = u.id
WHERE f.role = 'developer'              -- Uses idx_freelancers_role
  AND f.skills && ARRAY['React']        -- Uses idx_freelancers_skills (GIN)
  AND f.hourly_rate_usd BETWEEN 50 AND 100  -- Uses idx_freelancers_hourly_rate
  AND f.verified = true                 -- Uses idx_freelancers_verified
ORDER BY f.rating DESC;                 -- Uses idx_freelancers_rating
```

### **User Dashboard (Composite Index)**
```sql
SELECT p.*, COUNT(a.id) as applications
FROM projects p
LEFT JOIN applications a ON p.id = a.project_id
WHERE p.user_id = $1                    -- Uses idx_projects_user_status
  AND p.status IN ('hiring', 'development')
GROUP BY p.id
ORDER BY p.updated_at DESC;
```

---

## Storage Estimates

### **Per Record:**
- User: ~500 bytes
- Project: ~1-2 KB (with JSONB spec)
- Freelancer: ~800 bytes
- Application: ~500 bytes
- AI Conversation: ~2-10 KB (varies by message count)

### **For 1,000 Users:**
- Users: ~500 KB
- Projects (3 avg): ~6 MB
- Freelancers (20%): ~160 KB
- Applications (5 avg per project): ~7.5 MB
- Conversations (2 avg): ~20 MB

**Total: ~35 MB for 1,000 users**

### **Scaling:**
- 10K users: ~350 MB
- 100K users: ~3.5 GB
- 1M users: ~35 GB

**Indexes add ~30% overhead**

---

## Performance Tips

1. **Use composite indexes** for common filter combinations
2. **GIN index on skills** is crucial for marketplace search
3. **Pagination** required for large result sets
4. **Limit JSON size** in ai_generated_spec (< 100 KB)
5. **Archive old conversations** after 90 days
6. **Monitor query performance** with EXPLAIN ANALYZE

---

## Security

1. **CASCADE DELETE** ensures orphaned records are cleaned up
2. **UUID PKs** prevent ID enumeration attacks
3. **Index on telegram_id** for fast, secure Telegram auth
4. **password_hash** uses bcrypt (via passlib)
5. **Rate limiting** on search queries prevents abuse

---

**Schema Version**: 20241215_0001 (Initial)

