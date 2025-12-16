# 🔑 Credentials Needed to Launch

## ✅ **All Bugs Fixed - Ready for Configuration!**

**Current Status:**
- Frontend: ✅ Builds successfully
- Backend: ✅ Imports successfully
- Bot: ✅ Ready to run

**What's Needed:** Just 3 critical credentials (20 minutes to get)

---

## 🚨 **CRITICAL (Required to Run)**

### 1. **Telegram Bot Token** ⏱️ 5 minutes

**How to Get:**
```
1. Open Telegram
2. Search for @BotFather
3. Send: /newbot
4. Follow prompts:
   - Bot name: LaunchKit AI
   - Username: launchkit_bot (or similar)
5. Copy the token (looks like: 123456789:ABCdefGHI...)
```

**Where to Add:**
```bash
# apps/api/.env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# apps/bot/.env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**What It Enables:**
- User authentication (Telegram login)
- Bot commands (/start, /help)
- Admin notifications
- User confirmations

---

### 2. **Database URL** ⏱️ 10 minutes

**Option A: Supabase (Recommended - Free Tier)**

```
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - Name: launchkit-ai
   - Database Password: (generate strong password)
   - Region: (choose closest to your users)
4. Wait 2 minutes for setup
5. Go to Settings → Database
6. Copy "Connection string" (Session mode)
7. Convert: postgresql://... → postgresql+asyncpg://...
```

**Example:**
```
From: postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
To:   postgresql+asyncpg://postgres:pass@db.xxx.supabase.co:5432/postgres
```

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL
brew install postgresql@15  # macOS
sudo apt install postgresql  # Linux

# Create database
createdb launchkit

# Use connection string
postgresql+asyncpg://user:password@localhost:5432/launchkit
```

**Where to Add:**
```bash
# apps/api/.env
DATABASE_URL=postgresql+asyncpg://postgres:pass@db.xxx.supabase.co:5432/postgres
```

**What It Enables:**
- User accounts
- Project storage
- AI conversation history
- Freelancer profiles
- All database features

---

### 3. **JWT Secret Key** ⏱️ 30 seconds

**How to Generate:**
```bash
openssl rand -base64 32
```

**Example Output:**
```
vK8H3x9mP2nR7qT5wY1zA4bC6dE8fG0hJ2kL4mN6oP8q
```

**Where to Add:**
```bash
# apps/api/.env
SECRET_KEY=vK8H3x9mP2nR7qT5wY1zA4bC6dE8fG0hJ2kL4mN6oP8q
```

**What It Enables:**
- JWT token generation
- Secure authentication
- Protected endpoints

---

## ⭐ **IMPORTANT (For Full Features)**

### 4. **Anthropic API Key** ⏱️ 5 minutes

**How to Get:**
```
1. Go to https://console.anthropic.com
2. Sign up (free $5 credit initially)
3. Go to API Keys
4. Create key
5. Copy (looks like: sk-ant-api03-...)
```

**Where to Add:**
```bash
# apps/api/.env
ANTHROPIC_API_KEY=sk-ant-api03-xxx...
```

**What It Enables:**
- AI Chat (idea discovery)
- Idea Generation (3-5 startup ideas)
- Tech Spec Creation (14-section document)

**Cost:** ~$100-150/month for 1,000 active users

**Without This:**
- App runs but AI features return 501 errors
- Can still test marketplace, DFY, auth

---

### 5. **Admin Chat ID** ⏱️ 5 minutes

**How to Get:**
```
1. Create Telegram channel or group
2. Add your bot as admin
3. Add @userinfobot to channel
4. Forward any message to @userinfobot
5. It will show the chat_id: -1001234567890
```

**Where to Add:**
```bash
# apps/api/.env
ADMIN_CHAT_ID=-1001234567890

# apps/bot/.env
ADMIN_CHAT_ID=-1001234567890
```

**What It Enables:**
- DFY inquiry notifications
- Admin alerts
- Team coordination

**Without This:**
- DFY forms submit but no notifications
- Check database directly for inquiries

---

## 📋 **Complete .env Files**

### **apps/api/.env** (Minimal Working Config)

```env
# Application
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000

# ✅ YOU PROVIDE:
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
SECRET_KEY=YOUR_GENERATED_32_CHAR_KEY
TELEGRAM_BOT_TOKEN=123456789:YOUR_BOT_TOKEN

# Optional but recommended:
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY
ADMIN_CHAT_ID=-1001234567890

# Auto-configured:
CORS_ORIGINS=http://localhost:3000,https://t.me
LOG_LEVEL=INFO
LOG_FORMAT=text
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000
```

### **apps/bot/.env** (Minimal Working Config)

```env
# ✅ YOU PROVIDE:
TELEGRAM_BOT_TOKEN=123456789:YOUR_BOT_TOKEN

# Auto-configured:
WEBAPP_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000/api/v1
ENVIRONMENT=development

# Optional:
ADMIN_CHAT_ID=-1001234567890
```

### **apps/miniapp/.env.local** (Minimal Working Config)

```env
# Auto-configured:
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development

# Optional:
VITE_TONCONNECT_MANIFEST_URL=https://launchkit.ai/tonconnect-manifest.json
VITE_SENTRY_DSN=
```

---

## ⚡ **Quick Setup Script**

Save this as `setup.sh` and run it:

```bash
#!/bin/bash

echo "🚀 LaunchKit AI - Quick Setup"
echo "=============================="
echo ""

# Check if credentials provided
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "Usage: ./setup.sh <DATABASE_URL> <BOT_TOKEN> <SECRET_KEY>"
    echo ""
    echo "Example:"
    echo "  ./setup.sh 'postgresql+asyncpg://...' '123456:ABC...' 'your-secret-key'"
    echo ""
    echo "Get credentials:"
    echo "  1. DATABASE_URL: https://supabase.com (10 min)"
    echo "  2. BOT_TOKEN: @BotFather on Telegram (5 min)"
    echo "  3. SECRET_KEY: openssl rand -base64 32 (30 sec)"
    exit 1
fi

DATABASE_URL=$1
BOT_TOKEN=$2
SECRET_KEY=$3

echo "📝 Creating configuration files..."

# API .env
cat > apps/api/.env << EOF
ENVIRONMENT=development
DATABASE_URL=${DATABASE_URL}
SECRET_KEY=${SECRET_KEY}
TELEGRAM_BOT_TOKEN=${BOT_TOKEN}
CORS_ORIGINS=http://localhost:3000,https://t.me
LOG_LEVEL=INFO
LOG_FORMAT=text
RATE_LIMIT_PER_MINUTE=100
EOF

# Bot .env
cat > apps/bot/.env << EOF
TELEGRAM_BOT_TOKEN=${BOT_TOKEN}
WEBAPP_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000/api/v1
ENVIRONMENT=development
EOF

# Miniapp .env.local
cat > apps/miniapp/.env.local << EOF
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development
EOF

echo "✅ Configuration files created"
echo ""
echo "🗄️  Running database migrations..."
cd apps/api && ./scripts/migrate.sh fresh
cd ../..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Start services:"
echo "  Terminal 1: cd apps/miniapp && pnpm dev"
echo "  Terminal 2: cd apps/api && python3.11 main.py"
echo "  Terminal 3: cd apps/bot && python3.11 main.py"
```

---

## 🎯 **What I Need From You**

**To run locally TODAY:**

1. **Supabase Database**
   - Go to https://supabase.com
   - Create project
   - Send me the connection string

2. **Telegram Bot**
   - Open @BotFather
   - Create bot
   - Send me the token

3. **Generate Secret**
   - Run: `openssl rand -base64 32`
   - Send me the output

**Optional (can add later):**

4. Anthropic API key (for AI features)
5. Admin chat ID (for notifications)
6. Stripe keys (for card payments)

---

**With just 3 credentials (20 minutes), we can have LaunchKit AI running! 🚀**

