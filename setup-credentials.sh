#!/bin/bash

# LaunchKit AI - Credentials Setup Script
# Auto-generates .env files with provided credentials

echo "🚀 LaunchKit AI - Setting up credentials..."
echo ""

# Supabase Database Password
read -p "Enter your Supabase database password: " DB_PASSWORD

# Create API .env
cat > apps/api/.env << 'EOF'
# LaunchKit AI - API Configuration

# Application
APP_NAME=LaunchKit AI API
APP_VERSION=1.0.0
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
RELOAD=true

# JWT Secret
SECRET_KEY=W7wwlHUCxWqxaZDWyd9+fHC/FVLSo4Dh7hN4vbR9Z5Y=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Telegram
TELEGRAM_BOT_TOKEN=8289161302:AAEgbE94hvjtFUUAKoDA2K2VOidRoeNz4Z0
ADMIN_CHAT_ID=-5009682632

# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
ANTHROPIC_MAX_TOKENS=4096

# CORS
CORS_ORIGINS=http://localhost:3000,https://t.me

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=text

# TON Payments
TON_RECEIVER_ADDRESS=UQCHOragYiPXUz6FBqdvQmGrOx0910Kow5VBoCUxeoWizydX
EOF

# Add database URL with password
echo "DATABASE_URL=postgresql+asyncpg://postgres.tseqfbnrgbkvkxswgnaw:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres" >> apps/api/.env

# Create Bot .env
cat > apps/bot/.env << 'EOF'
# LaunchKit AI - Bot Configuration

TELEGRAM_BOT_TOKEN=8289161302:AAEgbE94hvjtFUUAKoDA2K2VOidRoeNz4Z0
WEBAPP_URL=https://launchkit.ai
ADMIN_CHAT_ID=-5009682632
API_BASE_URL=http://localhost:8000/api/v1
ENVIRONMENT=development
EOF

# Create Mini App .env
cat > apps/miniapp/.env.local << 'EOF'
# LaunchKit AI - Mini App Configuration

VITE_API_BASE_URL=https://api.launchkit.ai/api/v1
VITE_ENVIRONMENT=production
VITE_TONCONNECT_MANIFEST_URL=https://launchkit.ai/tonconnect-manifest.json
EOF

echo ""
echo "✅ Configuration files created!"
echo ""
echo "📁 Files created:"
echo "  - apps/api/.env"
echo "  - apps/bot/.env"
echo "  - apps/miniapp/.env.local"
echo ""
echo "🚀 Ready to start services!"
echo ""
echo "Terminal 1: cd apps/miniapp && pnpm dev"
echo "Terminal 2: cd apps/api && python3.11 main.py"
echo "Terminal 3: cd apps/bot && python3.11 main.py"
echo ""
echo "🎉 LaunchKit AI is ready to run!"
echo ""
echo "📋 Production Deployment Checklist:"
echo "  1. Deploy Supabase database (see DEPLOYMENT_GUIDE.md)"
echo "  2. Deploy FastAPI backend to Railway/Render"
echo "  3. Deploy React mini-app to Vercel"
echo "  4. Set up Telegram bot webhook (or run on VPS)"
echo "  5. Configure domain DNS (launchkit.ai → Vercel, api.launchkit.ai → Railway)"
echo "  6. Test TON Connect, Telegram Stars, and Stripe payments"
echo ""
echo "🔗 Production URLs:"
echo "  Mini App: https://launchkit.ai"
echo "  API: https://api.launchkit.ai"
echo "  Bot: @plauncher_robot"

