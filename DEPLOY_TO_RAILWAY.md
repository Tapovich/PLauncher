# 🚀 Deploy LaunchKit AI to Railway

## Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- This repository pushed to GitHub

---

## 📋 Step 1: Push to GitHub

### Create GitHub Repository

1. **Go to GitHub:** [github.com/new](https://github.com/new)
2. **Create repository:**
   - Name: `launchkit-ai`
   - Description: "LaunchKit AI - Telegram Mini-App with Claude AI"
   - Set to Public or Private
   - Do NOT initialize with README (we have one)

3. **Push your code:**
```bash
cd /Users/alyakarte/Desktop/PLauncher

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/launchkit-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🚂 Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard (Recommended)

1. **Go to Railway:** [railway.app](https://railway.app)
2. **Click:** "Start a New Project"
3. **Select:** "Deploy from GitHub repo"
4. **Choose:** Your `launchkit-ai` repository
5. **Railway will auto-detect the configuration**

### Option B: Deploy via CLI

```bash
# Install Railway CLI
brew install railwayapp/railway/railway

# Login
railway login

# Deploy
cd /Users/alyakarte/Desktop/PLauncher
railway link
railway up
```

---

## ⚙️ Step 3: Configure Environment Variables

### In Railway Dashboard:

1. **Go to your project**
2. **Click:** "Variables"
3. **Add these variables:**

```env
# Core Settings
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=${{PORT}}

# Database (Your Supabase URL)
DATABASE_URL=postgresql+asyncpg://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# Security
SECRET_KEY=W7wwlHUCxWqxaZDWyd9+fHC/FVLSo4Dh7hN4vbR9Z5Y=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Anthropic Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-haiku-20240307

# Telegram Bot
TELEGRAM_BOT_TOKEN=8289161302:AAEgbE94hvjtFUUAKoDA2K2VOidRoeNz4Z0
ADMIN_CHAT_ID=-5009682632

# CORS (Add your Vercel URL)
CORS_ORIGINS=https://miniapp-cqovqojle-tapovich01-1556s-projects.vercel.app,https://t.me,https://web.telegram.org

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

---

## 🔗 Step 4: Get Your API URL

After deployment:
1. **Railway provides URL:** `https://your-app.up.railway.app`
2. **Your API endpoints:** `https://your-app.up.railway.app/api/v1`

---

## 📱 Step 5: Update Frontend

### Update Vercel Mini-App:

1. **Edit** `apps/miniapp/.env.local`:
```env
VITE_API_BASE_URL=https://your-app.up.railway.app/api/v1
```

2. **Rebuild and deploy:**
```bash
cd apps/miniapp
pnpm build
vercel --prod
```

---

## ✅ Step 6: Verify Deployment

### Test API:
```bash
# Check API status
curl https://your-app.up.railway.app/

# Test auth endpoint
curl -X POST https://your-app.up.railway.app/api/v1/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"init_data":"test"}'
```

### Test Mini-App:
1. Open your Vercel app
2. Try AI Chat feature
3. Should connect to Railway API

---

## 🔄 Auto-Deploy Setup

Railway automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Railway auto-deploys!
```

---

## 📊 Monitoring

### Railway Dashboard shows:
- Deployment logs
- Resource usage
- Request metrics
- Error tracking

### View logs:
```bash
railway logs
```

---

## 🆘 Troubleshooting

### If deployment fails:

1. **Check logs:**
```bash
railway logs --tail 100
```

2. **Common issues:**
   - Missing environment variables
   - Port binding (use `${PORT}`)
   - Python version (needs 3.11)

3. **Restart service:**
```bash
railway restart
```

---

## 🎯 Final Configuration

### Complete Setup:
- [ ] GitHub repository created
- [ ] Railway project deployed
- [ ] Environment variables configured
- [ ] API URL obtained
- [ ] Frontend updated with API URL
- [ ] Vercel redeployed
- [ ] Telegram bot configured

---

## 🚀 Your URLs:

After deployment, you'll have:
- **API:** `https://your-app.up.railway.app`
- **Docs:** `https://your-app.up.railway.app/docs`
- **Mini-App:** `https://miniapp-cqovqojle-tapovich01-1556s-projects.vercel.app`

---

## 📝 Notes

- Railway provides **free tier** with 500 hours/month
- Auto-sleeps after 10 min of inactivity (free tier)
- Upgrade for always-on deployment
- SSL/HTTPS included automatically

---

**Ready to deploy! 🎉**
