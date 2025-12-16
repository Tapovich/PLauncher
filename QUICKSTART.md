# 🚀 LaunchKit AI - Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
# Install pnpm if you haven't already
npm install -g pnpm@8.15.0

# Install all Node.js dependencies
pnpm install
```

## Step 2: Setup Python Virtual Environments

### API

```bash
cd apps/api
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..
```

### Bot

```bash
cd apps/bot
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..
```

## Step 3: Configure Environment Variables

### API (`apps/api/.env`)

```bash
cp apps/api/env.example apps/api/.env
```

Minimum required variables:
```env
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/launchkit
SECRET_KEY=your-secret-key-here
```

### Bot (`apps/bot/.env`)

```bash
cp apps/bot/env.example apps/bot/.env
```

Add your bot token:
```env
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
```

### Mini App (Optional)

```bash
cp apps/miniapp/env.example apps/miniapp/.env.local
```

## Step 4: Start Development

### Option A: Run Everything (Recommended)

```bash
# From root directory
pnpm dev
```

This starts:
- ✅ Mini App at http://localhost:3000
- ✅ API at http://localhost:8000 (manual start needed)
- ✅ Bot (manual start needed)

### Option B: Run Individually

**Terminal 1 - Mini App:**
```bash
cd apps/miniapp
pnpm dev
```

**Terminal 2 - API:**
```bash
cd apps/api
source venv/bin/activate
python main.py
```

**Terminal 3 - Bot (Optional):**
```bash
cd apps/bot
source venv/bin/activate
python main.py
```

## Step 5: Verify Everything Works

1. **Mini App**: Open http://localhost:3000
   - You should see the LaunchKit AI interface
   - Check that the design system components load

2. **API**: Open http://localhost:8000/docs
   - You should see the interactive API documentation
   - Test the health check endpoint

3. **Bot**: Send `/start` to your bot on Telegram
   - You should receive a welcome message

## 🎉 You're Ready!

Your development environment is now fully set up. Here's what you can do:

### Next Steps

1. **Explore the Mini App**
   - Check out the design system demo
   - Test Telegram theme integration
   - Try the responsive layout

2. **Test the API**
   - Visit http://localhost:8000/docs
   - Explore the endpoints
   - Test authentication (when implemented)

3. **Develop Features**
   - Start with the AI idea generation
   - Build out the project management
   - Create the team marketplace

### Useful Commands

```bash
# Build for production
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format

# Clean everything
pnpm clean
```

### Common Issues

**Issue: pnpm not found**
```bash
npm install -g pnpm@8.15.0
```

**Issue: Python version mismatch**
```bash
# Make sure you have Python 3.11+
python3.11 --version
```

**Issue: Database connection failed**
- Check your DATABASE_URL in `apps/api/.env`
- Ensure PostgreSQL is running
- Or use Supabase for managed database

**Issue: Telegram bot not responding**
- Verify bot token in `apps/bot/.env`
- Check that the bot is not blocked
- Ensure the bot is started

## 📚 Documentation

- **Root README**: `README.md` - Complete project overview
- **Mini App**: `apps/miniapp/README.md`
- **API**: `apps/api/README.md`
- **Bot**: `apps/bot/README.md`
- **Shared Types**: `packages/shared/README.md`

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review the technical specification (Technical-Stuff.pdf)
- Open an issue on GitHub
- Contact the team

---

**Happy coding! 🚀**

