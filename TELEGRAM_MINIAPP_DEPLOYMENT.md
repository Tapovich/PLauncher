# 🚀 LaunchKit AI - Telegram Mini-App Deployment Guide

## Overview

This guide will help you deploy LaunchKit AI as a Telegram Mini-App that users can access directly through your Telegram bot.

## 📋 Prerequisites

- ✅ Telegram bot created via [@BotFather](https://t.me/botfather)
- ✅ All payment integrations configured (Stripe, TON Connect, Telegram Stars)
- ✅ Vercel account for hosting
- ✅ Domain name (optional but recommended)

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Mini-App to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Authenticate with Vercel**:
   ```bash
   vercel login
   ```
   Follow the browser authentication flow.

3. **Deploy the mini-app**:
   ```bash
   cd apps/miniapp
   vercel --prod
   ```

4. **Note the deployment URL** (it will look like: `https://launchkit-ai.vercel.app`)

### Step 2: Update Configuration Files

1. **Update Bot Configuration** (`apps/bot/.env`):
   ```bash
   WEBAPP_URL=https://your-deployment-url.vercel.app
   ```

2. **Update Mini-App Environment** (`apps/miniapp/.env.local`):
   ```bash
   VITE_API_BASE_URL=https://your-api-domain.com/api/v1
   VITE_TONCONNECT_MANIFEST_URL=https://your-deployment-url.vercel.app/tonconnect-manifest.json
   ```

3. **Update TON Connect Manifest** (`apps/miniapp/public/tonconnect-manifest.json`):
   ```json
   {
     "url": "https://your-deployment-url.vercel.app",
     "name": "LaunchKit AI",
     "iconUrl": "https://your-deployment-url.vercel.app/icon-512x512.png",
     "termsOfUseUrl": "https://your-deployment-url.vercel.app/terms",
     "privacyPolicyUrl": "https://your-deployment-url.vercel.app/privacy"
   }
   ```

### Step 3: Configure Telegram BotFather

1. **Go to [@BotFather](https://t.me/botfather)** on Telegram

2. **Select your bot**:
   ```
   /mybots
   → Select @plauncher_robot
   ```

3. **Set up the web app button**:
   ```
   /setmenubutton
   → Choose your bot
   → Web App
   → https://your-deployment-url.vercel.app
   → LaunchKit AI
   ```

### Step 4: Configure Custom Domain (Optional)

1. **Add custom domain in Vercel**:
   ```bash
   vercel domains add launchkit.ai
   ```

2. **Update DNS records** as instructed by Vercel

3. **Update all configuration files** to use the custom domain instead of Vercel URL

### Step 5: Test the Mini-App

1. **Message your bot**: Send a message to `@plauncher_robot`

2. **Click the menu button** at the bottom of the chat (looks like a grid or web icon)

3. **Select "LaunchKit AI"** to open the mini-app

4. **Test all features**:
   - AI chat conversations
   - Idea generation
   - Payment flows (Stripe, TON, Stars)
   - Tech spec generation

## 🔧 Troubleshooting

### Mini-App Not Loading

**Check:**
- Vercel deployment is successful
- Web app URL in BotFather matches Vercel URL
- No CORS issues (check browser console)

**Fix:**
```bash
# Redeploy to Vercel
cd apps/miniapp
vercel --prod --force
```

### Payments Not Working

**Check:**
- Environment variables are set correctly
- API endpoints are responding
- Payment provider keys are valid

**Test payments:**
```bash
# Test API endpoints
curl https://your-api-domain.com/api/v1/payments/intents
```

### Telegram Authentication Issues

**Check:**
- Telegram bot token is correct
- Mini-app URL is properly configured in BotFather
- Telegram WebApp SDK is loading

## 📱 User Experience

Once deployed, users will:

1. **Find your bot**: Search for `@plauncher_robot` on Telegram
2. **Start conversation**: Send any message to the bot
3. **Open mini-app**: Click the menu button → "LaunchKit AI"
4. **Use the platform**: Full AI-powered startup ideation experience

## 🔗 Production URLs Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Telegram Mini-App User Journey                             │
├─────────────────────────────────────────────────────────────┤
│  1. User messages @plauncher_robot                         │
│  2. Clicks menu button → "LaunchKit AI"                    │
│  3. Mini-app opens: https://launchkit.ai                   │
│  4. API calls: https://api.launchkit.ai/api/v1             │
│  5. Database: Supabase (pooled connection)                 │
│  6. Payments: Stripe, TON Connect, Telegram Stars          │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Success Checklist

- [ ] Mini-app deployed to Vercel
- [ ] BotFather configured with web app URL
- [ ] All environment variables updated
- [ ] Domain configured (optional)
- [ ] Payments tested in production
- [ ] AI chat working with Claude
- [ ] Users can access via Telegram

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify BotFather configuration
3. Test API endpoints manually
4. Check browser console for errors
5. Ensure all environment variables are set

---

**🎉 Your LaunchKit AI Telegram Mini-App is now live!**

Users can now discover, ideate, and launch startups directly through Telegram! 🚀
