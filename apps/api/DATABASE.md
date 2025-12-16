# 🗄️ LaunchKit AI - Database Documentation

Complete guide to the database schema, migrations, and seed data.

## 📊 Database Schema

### Tables Overview

```
users
├── projects (1:N)
├── freelancers (1:1)
└── ai_conversations (1:N)

projects
├── applications (1:N)
└── ai_conversations (1:N)

freelancers
└── applications (1:N)
```

---

## 📋 Table Schemas

### **users**
Stores all user accounts (entrepreneurs and freelancers).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, INDEX | User email (optional) |
| `telegram_id` | BIGINT | UNIQUE, INDEX | Telegram user ID |
| `full_name` | VARCHAR(255) | NOT NULL | User's full name |
| `plan` | VARCHAR(50) | DEFAULT 'free' | Subscription plan |
| `password_hash` | VARCHAR(255) | NULL | Hashed password for email auth |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_telegram_id` on `telegram_id`

---

### **projects**
User's startup projects and ideas.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique project identifier |
| `user_id` | UUID | FK → users, INDEX | Project owner |
| `title` | VARCHAR(255) | NOT NULL | Project title |
| `description` | TEXT | NULL | Project description |
| `status` | VARCHAR(50) | DEFAULT 'ideation' | Project status |
| `ai_generated_spec` | JSONB | NULL | AI-generated tech spec |
| `budget_min` | INTEGER | NULL | Minimum budget (USD) |
| `budget_max` | INTEGER | NULL | Maximum budget (USD) |
| `timeline_weeks` | INTEGER | NULL | Estimated timeline |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Status Values:** `ideation`, `planning`, `hiring`, `development`, `launched`

**Indexes:**
- `idx_projects_user_id` on `user_id`
- `idx_projects_status` on `status`
- `idx_projects_user_status` on `(user_id, status)`

---

### **ai_conversations**
Chat history with Claude AI.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique conversation ID |
| `user_id` | UUID | FK → users, INDEX | Conversation owner |
| `project_id` | UUID | FK → projects, INDEX | Associated project (optional) |
| `messages` | JSONB | NOT NULL | Array of messages |
| `context` | JSONB | NULL | Conversation context/metadata |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Messages Format:**
```json
[
  {
    "role": "user|assistant|system",
    "content": "Message content",
    "timestamp": "2024-12-15T10:00:00Z"
  }
]
```

**Indexes:**
- `idx_ai_conversations_user_id` on `user_id`
- `idx_ai_conversations_project_id` on `project_id`

---

### **freelancers**
Freelancer profiles (1:1 with users).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique freelancer ID |
| `user_id` | UUID | FK → users, UNIQUE | Associated user |
| `role` | VARCHAR(100) | NOT NULL, INDEX | Role/profession |
| `skills` | TEXT[] | NOT NULL, GIN INDEX | Array of skills |
| `hourly_rate_usd` | INTEGER | NOT NULL, INDEX | Hourly rate in USD |
| `availability` | VARCHAR(50) | NOT NULL, INDEX | Availability status |
| `portfolio_url` | VARCHAR(500) | NULL | Portfolio website |
| `bio` | TEXT | NOT NULL | Professional bio |
| `rating` | DECIMAL(3,2) | DEFAULT 0.00, INDEX | Average rating (0-5) |
| `projects_completed` | INTEGER | DEFAULT 0 | Number of completed projects |
| `verified` | BOOLEAN | DEFAULT false, INDEX | Verification status |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Role Values:** `developer`, `designer`, `pm`, `qa`, `devops`, `marketing`, `other`

**Availability Values:** `full-time`, `part-time`, `contract`

**Indexes:**
- `idx_freelancers_role` on `role`
- `idx_freelancers_skills` (GIN) on `skills` - for fast array search
- `idx_freelancers_hourly_rate` on `hourly_rate_usd`
- `idx_freelancers_availability` on `availability`
- `idx_freelancers_verified` on `verified`
- `idx_freelancers_rating` on `rating`

---

### **applications**
Freelancer applications to projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique application ID |
| `project_id` | UUID | FK → projects, INDEX | Target project |
| `freelancer_id` | UUID | FK → freelancers, INDEX | Applicant |
| `status` | VARCHAR(50) | DEFAULT 'pending', INDEX | Application status |
| `cover_letter` | TEXT | NULL | Cover letter |
| `proposed_rate` | JSONB | NULL | Rate proposal |
| `details` | JSONB | NULL | Additional details |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Status Values:** `pending`, `accepted`, `rejected`, `withdrawn`

**Proposed Rate Format:**
```json
{
  "amount": 5000,
  "currency": "USD",
  "type": "hourly|fixed"
}
```

**Indexes:**
- `idx_applications_project_id` on `project_id`
- `idx_applications_freelancer_id` on `freelancer_id`
- `idx_applications_status` on `status`
- `idx_applications_project_status` on `(project_id, status)`

---

## 🚀 Migration Commands

### Setup

```bash
# Activate virtual environment
cd apps/api
source venv/bin/activate

# Make migration script executable (if not already)
chmod +x scripts/migrate.sh
```

### Common Commands

```bash
# Apply all migrations
./scripts/migrate.sh upgrade

# Create new migration (auto-detect changes)
./scripts/migrate.sh migrate "Description of changes"

# Show current database version
./scripts/migrate.sh current

# Show migration history
./scripts/migrate.sh history

# Rollback last migration
./scripts/migrate.sh downgrade

# Reset database (WARNING: destroys all data!)
./scripts/migrate.sh reset
```

### Fresh Setup (Migrations + Seed Data)

```bash
# Complete fresh setup
./scripts/migrate.sh fresh
```

This will:
1. Apply all migrations
2. Seed database with demo data

---

## 🌱 Seed Data

The seed script creates:

### **1 Demo User**
- Email: `demo@launchkit.ai`
- Telegram ID: `123456789`
- Plan: `pro`

### **20 Freelancers**
Diverse roles:
- 8 Developers (Python, React, Go, Java, PHP, Ruby, C#, Swift)
- 4 Designers (UI/UX specialists)
- 3 PMs (Product Managers)
- 3 QA Engineers
- 2 DevOps Engineers

Each with:
- Realistic skills arrays
- Random hourly rates ($25-$150)
- Different availability statuses
- Ratings (3.5-5.0)
- Varied project completion counts
- 60% verified

### **3 Demo Projects**
1. **AI-Powered Task Manager**
   - Status: Random (ideation/planning/hiring)
   - Budget: $5K-$50K
   - Timeline: 8-16 weeks

2. **Social Fitness App**
   - Status: Random
   - Budget: $5K-$50K
   - Timeline: 8-16 weeks

3. **Local Service Marketplace**
   - Status: Random
   - Budget: $5K-$50K
   - Timeline: 8-16 weeks

### **1 AI Conversation**
Sample conversation showing idea generation flow.

---

## 📝 Manual Seeding

```bash
# Seed database
python -m scripts.seed_database
```

Or using the migration script:
```bash
./scripts/migrate.sh seed
```

---

## 🔍 Search Optimization

### GIN Index for Skills Array

The `freelancers.skills` column uses a **GIN (Generalized Inverted Index)** for fast array searches:

```sql
-- Find freelancers with specific skills
SELECT * FROM freelancers 
WHERE skills @> ARRAY['React', 'TypeScript'];

-- Find freelancers with any of these skills
SELECT * FROM freelancers 
WHERE skills && ARRAY['Python', 'Go', 'Java'];
```

### Composite Indexes

For common query patterns:
- `idx_projects_user_status` - Fast project filtering by user and status
- `idx_applications_project_status` - Fast application filtering

---

## 🔒 Foreign Key Relationships

All relationships use `CASCADE DELETE`:

```
DELETE user → deletes all projects, freelancer profile, conversations
DELETE project → deletes all applications, conversations
DELETE freelancer → deletes all applications
```

---

## 🧪 Testing Queries

### Find Top Rated Freelancers

```sql
SELECT 
  u.full_name,
  f.role,
  f.skills,
  f.hourly_rate_usd,
  f.rating,
  f.projects_completed
FROM freelancers f
JOIN users u ON f.user_id = u.id
WHERE f.verified = true
ORDER BY f.rating DESC, f.projects_completed DESC
LIMIT 10;
```

### Get User's Projects with Counts

```sql
SELECT 
  p.*,
  COUNT(a.id) as application_count
FROM projects p
LEFT JOIN applications a ON p.id = a.project_id
WHERE p.user_id = 'user-uuid-here'
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### Search Freelancers by Skills

```sql
SELECT 
  u.full_name,
  f.role,
  f.skills,
  f.hourly_rate_usd,
  f.rating
FROM freelancers f
JOIN users u ON f.user_id = u.id
WHERE 
  f.skills && ARRAY['React', 'TypeScript', 'Node.js']
  AND f.hourly_rate_usd BETWEEN 50 AND 100
  AND f.verified = true
ORDER BY f.rating DESC;
```

---

## 🐘 PostgreSQL / Supabase Setup

### Local PostgreSQL

```bash
# Create database
createdb launchkit

# Update .env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/launchkit
```

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Update `.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

4. Run migrations:
```bash
./scripts/migrate.sh upgrade
```

---

## 📊 Database Statistics

After seeding:
- **Total Users**: 21 (1 demo + 20 freelancers)
- **Total Projects**: 3
- **Total Freelancers**: 20
- **Total AI Conversations**: 1
- **Total Applications**: 0 (ready for creation)

---

## 🔧 Troubleshooting

### Connection Issues

```bash
# Test connection
python -c "from app.db.session import engine; print('Connection OK')"
```

### Migration Conflicts

```bash
# Show current version
./scripts/migrate.sh current

# Show history
./scripts/migrate.sh history

# Rollback if needed
./scripts/migrate.sh downgrade
```

### Reset Everything

```bash
# Nuclear option - start fresh
./scripts/migrate.sh reset
./scripts/migrate.sh fresh
```

---

## 📚 Resources

- [SQLAlchemy Docs](https://docs.sqlalchemy.org)
- [Alembic Docs](https://alembic.sqlalchemy.org)
- [PostgreSQL Array Functions](https://www.postgresql.org/docs/current/functions-array.html)
- [Supabase Docs](https://supabase.com/docs)

---

**Database Version**: 20241215_0001 (Initial Schema)

