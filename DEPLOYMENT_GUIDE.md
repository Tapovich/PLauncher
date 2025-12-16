# 🚀 LaunchKit AI - Deployment Guide

Complete guide to deploy LaunchKit AI to production.

## 📊 Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Telegram Mini App                                        │
│  ────────────────────────────────────────────────────    │
│  Platform: Vercel                                         │
│  Build: pnpm build (Vite)                                 │
│  URL: https://launchkit.ai                                │
└──────────────────┬───────────────────────────────────────┘
                   │ HTTPS/REST
                   ↓
┌──────────────────────────────────────────────────────────┐
│  FastAPI Backend                                          │
│  ────────────────────────────────────────────────────    │
│  Platform: Railway or Render                              │
│  Runtime: Python 3.11                                     │
│  URL: https://api.launchkit.ai                            │
└──────────────────┬───────────────────────────────────────┘
                   │ PostgreSQL
                   ↓
┌──────────────────────────────────────────────────────────┐
│  Database                                                 │
│  ────────────────────────────────────────────────────    │
│  Platform: Supabase                                       │
│  Type: PostgreSQL 15                                      │
│  Connection: Pooled                                       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Telegram Bot                                             │
│  ────────────────────────────────────────────────────    │
│  Platform: Railway or any VPS                             │
│  Runtime: Python 3.11                                     │
│  Mode: Long polling                                       │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 **1. Database Deployment (Supabase)**

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: launchkit-ai
   - **Database Password**: (strong password)
   - **Region**: Choose closest to users
4. Click "Create Project" (takes ~2 minutes)

### Step 2: Get Connection String

1. Go to **Settings** → **Database**
2. Find **Connection String** → **Connection pooling**
3. Copy the URI (Session mode):
   ```
   postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres
   ```
4. Convert to async format:
   ```
   postgresql+asyncpg://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres
   ```

### Step 3: Run Migrations

```bash
cd apps/api

# Set DATABASE_URL
export DATABASE_URL="postgresql+asyncpg://..."

# Or add to .env
echo "DATABASE_URL=postgresql+asyncpg://..." >> .env

# Activate venv
source venv/bin/activate

# Run migrations
./scripts/migrate.sh upgrade

# Seed data (optional but recommended)
./scripts/migrate.sh seed
```

### Step 4: Verify

```bash
# Test connection
python -c "
from app.db.session import engine
import asyncio

async def test():
    async with engine.begin() as conn:
        result = await conn.execute('SELECT 1')
        print('✓ Connected to Supabase')

asyncio.run(test())
"
```

**Result:** 21 users, 20 freelancers, 3 projects in production DB

---

## 🎨 **2. Mini App Deployment (Vercel)**

### Step 1: Prepare for Deployment

```bash
cd apps/miniapp

# Create .env.production
cat > .env.production << EOF
VITE_API_BASE_URL=https://api.launchkit.ai/api/v1
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=https://...@sentry.io/...
EOF

# Test build
pnpm build
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd apps/miniapp
vercel

# Follow prompts:
# - Project name: launchkit-ai
# - Framework: Vite
# - Build command: pnpm build
# - Output directory: dist
# - Root directory: apps/miniapp
```

**Option B: GitHub Integration**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Root Directory**: apps/miniapp
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
6. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://api.launchkit.ai/api/v1
   VITE_ENVIRONMENT=production
   ```
7. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add custom domain: `launchkit.ai`
3. Follow DNS setup instructions
4. Wait for SSL certificate (~5 minutes)

### Step 4: Configure Telegram Bot

```bash
# Set mini app URL in @BotFather
/setmenubutton
[Select your bot]
URL: https://launchkit.ai
Text: Open LaunchKit AI
```

**Result:** Mini app accessible at `https://launchkit.ai`

---

## ⚡ **3. API Deployment (Railway)**

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Empty Project"
4. Click "Deploy from GitHub repo"
5. Select your repository

### Step 2: Configure Service

1. **Root Directory**: `/apps/api`
2. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **Watch Paths**: `apps/api/**`

### Step 3: Add Environment Variables

In Railway dashboard, add:

```env
# Application
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
RELOAD=false

# Database (from Supabase)
DATABASE_URL=postgresql+asyncpg://postgres...

# JWT
SECRET_KEY=your-strong-32-char-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000

# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-...

# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
ADMIN_CHAT_ID=-1001234567890

# CORS
CORS_ORIGINS=https://launchkit.ai,https://t.me

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Sentry (optional)
SENTRY_DSN=https://...@sentry.io/...
```

### Step 4: Deploy

1. Push to GitHub main branch
2. Railway auto-deploys
3. Wait for build (~3-5 minutes)
4. Get deployment URL: `https://launchkit-ai.up.railway.app`

### Step 5: Configure Custom Domain

1. In Railway, go to **Settings** → **Domains**
2. Add custom domain: `api.launchkit.ai`
3. Add CNAME record in your DNS:
   ```
   api.launchkit.ai → launchkit-ai.up.railway.app
   ```
4. Wait for SSL (~5 minutes)

### Step 6: Update Mini App

Update Vercel environment:
```env
VITE_API_BASE_URL=https://api.launchkit.ai/api/v1
```

Redeploy mini app.

**Result:** API accessible at `https://api.launchkit.ai`

---

## 🤖 **4. Bot Deployment (Railway)**

### Option A: Railway (Recommended)

1. Create new service in Railway project
2. Same GitHub repo
3. Configure:
   - **Root Directory**: `/apps/bot`
   - **Start Command**: `python main.py`
   - **Watch Paths**: `apps/bot/**`

4. Add Environment Variables:
   ```env
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
   WEBAPP_URL=https://launchkit.ai
   ADMIN_CHAT_ID=-1001234567890
   API_BASE_URL=https://api.launchkit.ai/api/v1
   ENVIRONMENT=production
   ```

5. Deploy

### Option B: VPS

```bash
# SSH to server
ssh user@your-server.com

# Clone repo
git clone https://github.com/your-org/launchkit-ai.git
cd launchkit-ai/apps/bot

# Setup Python
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with production values

# Test
python main.py

# Setup systemd service
sudo nano /etc/systemd/system/launchkit-bot.service
```

**systemd service file:**
```ini
[Unit]
Description=LaunchKit AI Telegram Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/launchkit-ai/apps/bot
ExecStart=/home/ubuntu/launchkit-ai/apps/bot/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl enable launchkit-bot
sudo systemctl start launchkit-bot
sudo systemctl status launchkit-bot
```

**Result:** Bot running 24/7 with auto-restart

---

## 🔐 **5. Security Configuration**

### SSL/TLS Certificates

**Vercel & Railway:**
- ✅ Auto-provision Let's Encrypt certificates
- ✅ Auto-renewal
- ✅ Force HTTPS

**Custom Domain:**
```bash
# Verify HTTPS
curl -I https://launchkit.ai
# Should return: HTTP/2 200

# Check certificate
openssl s_client -connect launchkit.ai:443 -servername launchkit.ai
```

### Environment Secrets

**Never commit:**
```gitignore
.env
.env.local
.env.production
*.key
*.pem
```

**Use platform secret managers:**
- Vercel: Environment Variables (encrypted)
- Railway: Variables (encrypted)
- Supabase: Vault (for API keys)

### Generate Strong Secrets

```bash
# SECRET_KEY (32+ characters)
openssl rand -base64 32

# DATABASE_PASSWORD
openssl rand -base64 24

# WEBHOOK_SECRET (if needed)
openssl rand -hex 32
```

---

## 🌐 **6. DNS Configuration**

### Domain Setup

**Required DNS Records:**

```dns
# Root domain
launchkit.ai          A      76.76.21.21  (Vercel)
launchkit.ai          AAAA   2606:4700::1 (Vercel)

# API subdomain
api.launchkit.ai      CNAME  launchkit-ai.up.railway.app

# WWW redirect
www.launchkit.ai      CNAME  launchkit.ai
```

**Verification:**
```bash
# Check DNS propagation
dig launchkit.ai
dig api.launchkit.ai

# Or use
https://dnschecker.org
```

---

## 🔄 **7. Post-Deployment**

### Run Migrations (Production)

```bash
# From local machine with production DATABASE_URL
export DATABASE_URL="postgresql+asyncpg://..."

cd apps/api
source venv/bin/activate
./scripts/migrate.sh upgrade
./scripts/migrate.sh seed
```

### Verify Deployment

**Mini App:**
```bash
curl https://launchkit.ai
# Should return: HTML with React app

# Check WebApp
open https://t.me/your_bot
# Click "Open LaunchKit AI"
```

**API:**
```bash
curl https://api.launchkit.ai/health
# Should return: {"status": "healthy"}

# Check docs
open https://api.launchkit.ai/docs
```

**Bot:**
```bash
# Send /start to your bot
# Should receive welcome message
```

### Health Checks

Set up monitoring:

**Vercel:**
- Built-in monitoring
- View in dashboard

**Railway:**
- Built-in logs
- Can add external monitoring

**Uptime Monitoring:**
```bash
# Use services like:
# - Better Uptime (free)
# - UptimeRobot
# - Pingdom

# Check endpoints:
GET https://launchkit.ai/
GET https://api.launchkit.ai/health
```

---

## 📊 **8. Monitoring Setup**

### Sentry

**Backend:**
1. Create project: sentry.io
2. Select "Python" + "FastAPI"
3. Copy DSN
4. Add to Railway environment:
   ```env
   SENTRY_DSN=https://...@sentry.io/...
   ```
5. Redeploy

**Frontend:**
1. Create project: sentry.io
2. Select "React"
3. Copy DSN
4. Add to Vercel environment:
   ```env
   VITE_SENTRY_DSN=https://...@sentry.io/...
   ```
5. Redeploy

### Logging

**Railway:**
- View logs in dashboard
- Can forward to external service

**Vercel:**
- View logs in dashboard
- Real-time log streaming

**Supabase:**
- Database logs available
- Query performance monitoring

---

## 🔧 **9. Configuration Checklist**

### Vercel (Mini App)

```env
✓ VITE_API_BASE_URL=https://api.launchkit.ai/api/v1
✓ VITE_ENVIRONMENT=production
□ VITE_SENTRY_DSN (optional)
```

### Railway (API)

```env
✓ ENVIRONMENT=production
✓ DATABASE_URL (from Supabase)
✓ SECRET_KEY (generate strong key)
✓ ANTHROPIC_API_KEY
✓ TELEGRAM_BOT_TOKEN
✓ ADMIN_CHAT_ID
✓ CORS_ORIGINS=https://launchkit.ai,https://t.me
✓ LOG_FORMAT=json
□ SENTRY_DSN (optional)
□ STRIPE_SECRET_KEY (optional)
```

### Railway (Bot)

```env
✓ TELEGRAM_BOT_TOKEN
✓ WEBAPP_URL=https://launchkit.ai
✓ ADMIN_CHAT_ID
✓ API_BASE_URL=https://api.launchkit.ai/api/v1
✓ ENVIRONMENT=production
```

---

## 🚦 **10. Pre-Launch Checklist**

### Code

- [x] All tests passing
- [x] No console.log() in production
- [x] Error handling everywhere
- [x] Loading states implemented
- [ ] API client integrated (TODO)

### Configuration

- [ ] Strong SECRET_KEY generated
- [ ] All environment variables set
- [ ] CORS origins configured
- [ ] HTTPS enforced
- [ ] Rate limits configured

### Database

- [ ] Migrations run on production
- [ ] Indexes created
- [ ] Seed data loaded (optional)
- [ ] Backups configured (Supabase auto-backups)

### Security

- [ ] Secrets not in code
- [ ] .env in .gitignore
- [ ] HSTS header enabled
- [ ] Security headers configured
- [ ] Rate limiting active

### Monitoring

- [ ] Sentry configured
- [ ] Health checks working
- [ ] Logs streaming
- [ ] Alerts configured

---

## 🐛 **11. Troubleshooting**

### Common Issues

**1. Database Connection Failed**

```bash
# Test connection string
psql "postgresql://postgres..."

# Check:
- Password correct?
- IP whitelisted in Supabase?
- Connection pooling mode used?
```

**2. CORS Errors**

```bash
# Check CORS_ORIGINS
# Must include:
CORS_ORIGINS=https://launchkit.ai,https://t.me

# Not:
CORS_ORIGINS=http://localhost:3000  # ❌ Development URL
```

**3. Bot Not Responding**

```bash
# Check logs
railway logs --service bot

# Verify:
- Bot token correct?
- Bot started successfully?
- No errors in logs?

# Test webhook
curl https://api.telegram.org/bot{TOKEN}/getMe
```

**4. 500 Errors**

```bash
# Check Sentry
# Check Railway logs
railway logs --service api

# Common causes:
- Missing environment variable
- Database connection issue
- Unhandled exception
```

**5. Build Failures**

```bash
# Vercel build failed
# Check logs in dashboard

# Common fixes:
- Check pnpm-lock.yaml committed
- Verify all dependencies in package.json
- Check TypeScript errors

# Railway build failed
# Check requirements.txt
# Verify Python version
```

---

## 📈 **12. Scaling**

### When to Scale

**Metrics to watch:**
- Response time > 2s
- Error rate > 1%
- Database connections > 80%
- CPU > 80%
- Memory > 80%

### Scaling Options

**Database (Supabase):**
```
Free tier → Pro tier ($25/mo)
- More connections
- Better performance
- Automated backups
```

**API (Railway):**
```
Starter ($5) → Developer ($20) → Team ($50)
- More CPU/RAM
- Horizontal scaling
- Custom domains
```

**Bot:**
- Usually doesn't need scaling
- Can run webhook mode (faster)

---

## 💰 **13. Cost Breakdown**

| Service | Tier | Cost/Month | Notes |
|---------|------|------------|-------|
| **Vercel** | Pro | $20 | Mini app hosting |
| **Railway** | Starter × 2 | $10 | API + Bot |
| **Supabase** | Pro | $25 | Database |
| **Claude API** | Pay-as-go | $50-150 | Depends on usage |
| **Sentry** | Team | $26 | Error tracking |
| **Domain** | - | $2 | launchkit.ai |
| **Total** | - | **$133-213** | Monthly |

**First 3 months:** ~$400-650

**With 1,000 users:**
- Claude API: ~$120/month
- Other costs: Fixed
- **Total: ~$190/month**

---

## 🎯 **14. Launch Day Checklist**

### T-1 Day (Before Launch)

- [ ] Full end-to-end test
- [ ] Invite 5-10 beta testers
- [ ] Monitor for 24 hours
- [ ] Fix any critical bugs
- [ ] Prepare announcement

### T-0 Day (Launch)

- [ ] Final deployment
- [ ] Verify all services running
- [ ] Post announcement
- [ ] Monitor Sentry
- [ ] Watch logs
- [ ] Respond to feedback

### T+1 Day (Post-Launch)

- [ ] Review metrics
- [ ] Check error rates
- [ ] Review user feedback
- [ ] Plan next iteration

---

## 📚 **15. Maintenance**

### Daily

- Check Sentry for new errors
- Monitor uptime
- Review user feedback

### Weekly

- Review performance metrics
- Check database size
- Update dependencies (security)
- Backup database (auto on Supabase)

### Monthly

- Review costs
- Analyze usage patterns
- Plan new features
- Rotate secrets (if needed)

---

## 🎉 **Deployment Complete!**

**After following this guide, you'll have:**

✅ Mini app on Vercel (https://launchkit.ai)  
✅ API on Railway (https://api.launchkit.ai)  
✅ Database on Supabase (with migrations)  
✅ Bot running (Railway or VPS)  
✅ HTTPS everywhere  
✅ Monitoring with Sentry  
✅ Health checks configured  

**LaunchKit AI is LIVE! 🚀✨**

---

## 🆘 **Support**

**Issues during deployment?**

1. Check logs (Railway/Vercel dashboard)
2. Review Sentry errors
3. Consult documentation:
   - QUICKSTART.md
   - DATABASE_QUICKSTART.md
   - SECURITY.md
4. Contact support

**Platform-specific help:**
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)
- Supabase: [supabase.com/docs](https://supabase.com/docs)

---

**Ready to deploy! 🚀**

