#!/bin/bash

# Database migration helper script

set -e

echo "🗄️  LaunchKit AI - Database Migration"
echo "====================================="

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Virtual environment not activated!"
    echo "Run: source venv/bin/activate"
    exit 1
fi

# Check command
case "$1" in
    "init")
        echo "📝 Initializing Alembic..."
        # Already initialized, just info
        echo "✅ Alembic is already initialized"
        echo "Migration files are in: alembic/versions/"
        ;;
    
    "migrate")
        echo "📝 Creating new migration..."
        MESSAGE="${2:-Auto-generated migration}"
        alembic revision --autogenerate -m "$MESSAGE"
        echo "✅ Migration created"
        ;;
    
    "upgrade")
        echo "⬆️  Applying migrations..."
        alembic upgrade head
        echo "✅ Database upgraded to latest version"
        ;;
    
    "downgrade")
        STEPS="${2:-1}"
        echo "⬇️  Downgrading $STEPS step(s)..."
        alembic downgrade -$STEPS
        echo "✅ Database downgraded"
        ;;
    
    "current")
        echo "📊 Current database version:"
        alembic current
        ;;
    
    "history")
        echo "📜 Migration history:"
        alembic history
        ;;
    
    "reset")
        echo "⚠️  WARNING: This will drop all tables and recreate them!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🗑️  Dropping all tables..."
            alembic downgrade base
            echo "⬆️  Recreating tables..."
            alembic upgrade head
            echo "✅ Database reset complete"
        else
            echo "❌ Reset cancelled"
        fi
        ;;
    
    "seed")
        echo "🌱 Seeding database with demo data..."
        python -m scripts.seed_database
        ;;
    
    "fresh")
        echo "🔄 Fresh database setup..."
        echo "⬆️  Running migrations..."
        alembic upgrade head
        echo "🌱 Seeding data..."
        python -m scripts.seed_database
        echo "✅ Fresh database ready!"
        ;;
    
    *)
        echo "Usage: ./scripts/migrate.sh [command]"
        echo ""
        echo "Commands:"
        echo "  init      - Show Alembic status"
        echo "  migrate   - Create new migration (auto-detect changes)"
        echo "  upgrade   - Apply all pending migrations"
        echo "  downgrade - Revert last migration"
        echo "  current   - Show current database version"
        echo "  history   - Show migration history"
        echo "  reset     - Drop and recreate all tables"
        echo "  seed      - Populate database with demo data"
        echo "  fresh     - Upgrade + seed (fresh setup)"
        echo ""
        echo "Examples:"
        echo "  ./scripts/migrate.sh upgrade"
        echo "  ./scripts/migrate.sh migrate 'Add user table'"
        echo "  ./scripts/migrate.sh fresh"
        exit 1
        ;;
esac

