# 🚨 Fix Mixed Content Error

## Problem
The deployed Vercel app (HTTPS) is trying to connect to localhost (HTTP), which is:
1. **Blocked by browsers** - HTTPS can't make HTTP requests
2. **Impossible** - Localhost only exists on YOUR computer, not on Vercel's servers

---

## ✅ Solution 1: Test Locally (Immediate)

**Use the local frontend with local backend:**

```bash
# Terminal 1: Backend
cd apps/api
python3.11 main.py

# Terminal 2: Frontend  
cd apps/miniapp
pnpm dev
```

**Then open:** http://localhost:5173

✅ This works because both are HTTP and on the same machine

---

## ✅ Solution 2: Deploy Backend (Production)

### Quick Deploy with Render

1. **Create account at [render.com](https://render.com)**

2. **Create `render.yaml` in `apps/api`:**
```yaml
services:
  - type: web
    name: launchkit-api
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: ANTHROPIC_API_KEY
        value: your_anthropic_api_key_here
      - key: ANTHROPIC_MODEL
        value: claude-3-haiku-20240307
      - key: TELEGRAM_BOT_TOKEN
        value: 8289161302:AAEgbE94hvjtFUUAKoDA2K2VOidRoeNz4Z0
      - key: SECRET_KEY
        value: W7wwlHUCxWqxaZDWyd9+fHC/FVLSo4Dh7hN4vbR9Z5Y=
      - key: DATABASE_URL
        value: # Your Supabase URL
      - key: CORS_ORIGINS
        value: "https://miniapp-vert-rho.vercel.app,https://t.me"
```

3. **Deploy:**
   - Connect GitHub repo to Render
   - It will auto-deploy from `render.yaml`

4. **Update frontend `.env.local`:**
```env
VITE_API_BASE_URL=https://your-api.onrender.com/api/v1
```

5. **Rebuild and redeploy to Vercel:**
```bash
cd apps/miniapp
pnpm build
vercel --prod
```

---

## ✅ Solution 3: Quick Fix with ngrok (Testing)

**Expose your local API to the internet:**

```bash
# Install ngrok
brew install ngrok

# Expose local API
ngrok http 8000

# You'll get: https://abc123.ngrok.io
```

**Update `.env.local`:**
```env
VITE_API_BASE_URL=https://abc123.ngrok.io/api/v1
```

**Rebuild and deploy:**
```bash
pnpm build
vercel --prod
```

---

## 📋 Current Status

| Component | URL | Status | Issue |
|-----------|-----|--------|-------|
| Frontend (Vercel) | https://miniapp-vert-rho.vercel.app | ✅ Deployed | Using wrong API URL |
| Backend API | http://localhost:8000 | ✅ Local only | Not accessible from Vercel |
| Error | Mixed Content | 🚨 Blocked | HTTPS → HTTP not allowed |

---

## 🎯 Recommended Action

**For immediate testing:**
```bash
# Just use local development
cd apps/miniapp
pnpm dev

# Open http://localhost:5173
```

**For production:**
1. Deploy backend to Render (free tier available)
2. Update frontend with Render URL
3. Redeploy to Vercel

---

The error is because Vercel (HTTPS) can't reach localhost (HTTP). Choose one of the solutions above!
