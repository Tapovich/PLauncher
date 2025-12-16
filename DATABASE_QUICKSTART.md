# 🗄️ Database Quick Start

Get your database up and running in 2 minutes!

## Option 1: Local PostgreSQL

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Create database
createdb launchkit

# Or with psql
psql postgres
CREATE DATABASE launchkit;
\q
```

### 3. Update .env

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/launchkit
```

### 4. Run Migrations

```bash
cd apps/api
source venv/bin/activate
./scripts/migrate.sh fresh
```

---

## Option 2: Supabase (Recommended)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name and password
4. Wait for project to initialize (~2 minutes)

### 2. Get Connection String

1. Go to **Settings** → **Database**
2. Find **Connection String** section
3. Copy the **Connection pooling** URI (Async mode)
4. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 3. Update .env

Replace `[YOUR-PASSWORD]` with your project password:

```env
DATABASE_URL=postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 4. Run Migrations

```bash
cd apps/api
source venv/bin/activate
./scripts/migrate.sh fresh
```

---

## ✅ Verify Setup

```bash
# Check current version
./scripts/migrate.sh current

# Expected output:
# 20241215_0001 (head)
```

Query the database:
```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
```

Expected: 21 users (1 demo + 20 freelancers)

---

## 🌱 Demo Data

The seed includes:

### Demo User
- **Email**: demo@launchkit.ai
- **Telegram ID**: 123456789
- **Plan**: pro

### 20 Freelancers
- Developers, Designers, PMs, QA, DevOps
- Rates: $25-$150/hour
- Skills arrays for search
- Ratings: 3.5-5.0

### 3 Projects
- AI Task Manager
- Social Fitness App
- Local Marketplace

---

## 🔧 Common Issues

### Connection Refused
```bash
# Check if PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

### Authentication Failed
- Check username/password in DATABASE_URL
- For Supabase, verify password is correct

### Migration Errors
```bash
# Reset and try again
./scripts/migrate.sh reset
./scripts/migrate.sh fresh
```

---

## 📚 Next Steps

1. ✅ Database is ready!
2. Start the API: `python main.py`
3. Visit: http://localhost:8000/docs
4. Test endpoints with demo user

---

**Need more details?** See [apps/api/DATABASE.md](apps/api/DATABASE.md)

