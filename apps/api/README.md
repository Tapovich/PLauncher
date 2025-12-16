# LaunchKit AI - FastAPI Backend

FastAPI backend for LaunchKit AI platform.

## Setup

1. Create virtual environment:
```bash
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy env.example to .env and configure:
```bash
cp env.example .env
```

4. Setup database:
```bash
# Apply migrations
./scripts/migrate.sh upgrade

# Seed with demo data (optional)
./scripts/migrate.sh seed

# Or do both at once
./scripts/migrate.sh fresh
```

5. Run the server:
```bash
python main.py
```

API will be available at: http://localhost:8000

API Documentation: http://localhost:8000/docs

## Database

See [DATABASE.md](DATABASE.md) for complete database documentation.

### Quick Commands

```bash
# Apply migrations
./scripts/migrate.sh upgrade

# Create new migration
./scripts/migrate.sh migrate "Description"

# Seed demo data
./scripts/migrate.sh seed

# Fresh setup (migrate + seed)
./scripts/migrate.sh fresh
```

## Project Structure

```
apps/api/
├── main.py              # Application entry point
├── alembic.ini          # Alembic configuration
├── app/
│   ├── api/
│   │   └── v1/         # API version 1 endpoints
│   ├── core/           # Core configuration
│   ├── models/         # SQLAlchemy models
│   ├── db/             # Database session
│   ├── schemas/        # Pydantic schemas
│   └── services/       # Business logic
├── alembic/
│   ├── versions/       # Migration files
│   └── env.py          # Alembic environment
├── scripts/
│   ├── migrate.sh      # Migration helper
│   └── seed_database.py # Seed script
└── requirements.txt
```

