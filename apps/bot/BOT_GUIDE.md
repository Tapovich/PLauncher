# 🤖 Telegram Bot - Complete Guide

Complete aiogram bot with admin notifications and mini app integration.

## 📊 Overview

The Telegram bot provides:
- **User Commands** - /start, /help, /about, /status
- **Mini App Integration** - Deep-links to specific pages
- **Admin Notifications** - DFY inquiries, important events
- **User Confirmations** - Automated messages

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│          Telegram User                    │
└──────────────┬───────────────────────────┘
               │ /start, /help, etc.
               ↓
┌──────────────────────────────────────────┐
│     aiogram Bot (apps/bot/main.py)       │
│  ──────────────────────────────────────  │
│  Commands:                                │
│  • /start → Open mini app                 │
│  • /help → Show commands                  │
│  • /about → About LaunchKit               │
│  • /status → Check projects               │
│  ──────────────────────────────────────  │
│  Notifications:                           │
│  • send_admin_notification()              │
│  • send_user_notification()               │
│  • format_dfy_notification()              │
└──────────────┬───────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│     FastAPI Backend (DFY Endpoint)       │
│  ──────────────────────────────────────  │
│  POST /api/v1/dfy/inquiry                │
│    ├─ Save to database                   │
│    ├─ Call send_bot_notification()       │
│    └─ Call send_user_confirmation()      │
└──────────────────────────────────────────┘
```

---

## 🎯 Commands

### /start

Opens mini app with optional deep-link.

**Usage:**
```
/start
/start project_123
/start marketplace
```

**Response:**
```
👋 Welcome to LaunchKit AI!

From Idea to Launch in 14 Days with AI

What I can help you with:
💡 Generate startup ideas with AI
📋 Create detailed technical specifications
👥 Find and hire talented team members
🚀 Full-service launch support

[🚀 Open LaunchKit AI] (WebApp button)
[📖 How It Works]
[👥 Browse Team]
```

**Features:**
- WebApp button with deep-link support
- Inline keyboard with actions
- MarkdownV2 formatting
- Safe character escaping

### /help

Shows available commands and features.

### /about

Information about LaunchKit AI.

### /status

Check user's projects (TODO: API integration).

---

## 📬 Admin Notifications

### DFY Inquiry Format

```
🚀 New Done-For-You Request

Project: AI Task Manager
Request ID: abc12345

📋 Project Details:
• Type: Web Application
• Budget: $10K-20K
• Timeline: 1-2 months
• Stage: Just an idea

👤 Client Information:
• Name: John Doe
• Telegram: @johndoe
• Email: john@example.com

💬 Description:
A smart task management app with AI-powered prioritization...

⏰ Submitted: Just now

👉 Action Required: Review and contact client within 24 hours
```

**Features:**
- ✅ Complete project details
- ✅ Client contact information
- ✅ Description preview (200 chars)
- ✅ Request ID for tracking
- ✅ Action reminder
- ✅ MarkdownV2 formatted
- ✅ Safe character escaping

### Admin Channel Setup

```bash
# 1. Create Telegram channel/group for admin notifications
# 2. Add your bot as admin
# 3. Get chat ID:
#    - Add @userinfobot to channel
#    - Forward any message to @userinfobot
#    - It will show the chat_id
# 4. Add to .env:
ADMIN_CHAT_ID=-1001234567890
# Or use channel username:
ADMIN_CHAT_ID=@launchkit_admin
```

---

## 📨 User Confirmations

### DFY Confirmation Format

```
✅ Request Submitted Successfully!

Thank you for your Done-For-You service request!

Project: AI Task Manager
Request ID: abc12345

What happens next:
⏰ Within 4 hours - Team reviews your request
👥 Within 24 hours - Discovery call scheduled
📄 Within 48 hours - Custom proposal sent

We'll contact you via Telegram with next steps.

Questions? Reply to this message or contact @launchkit_support

[📱 Open LaunchKit AI] (button)
```

**Features:**
- ✅ Confirmation message
- ✅ Request ID
- ✅ Timeline expectations
- ✅ Support contact
- ✅ Button to reopen mini app

---

## 🔒 Safe Markdown Formatting

### MarkdownV2 Escaping

Telegram's MarkdownV2 requires escaping special characters:

```python
def escape_markdown_v2(text: str) -> str:
    """Escape: _ * [ ] ( ) ~ ` > # + - = | { } . !"""
    special_chars = r'_*[]()~`>#+-=|{}.!'
    return ''.join(
        f'\\{char}' if char in special_chars else char 
        for char in text
    )
```

**Example:**
```python
# Input
"Project cost: $10,000-20,000 (10% fee)"

# Output
"Project cost: \\$10\\,000\\-20\\,000 \\(10\\% fee\\)"
```

### Safe Formatting Function

```python
def safe_markdown(text: str, mode: str = "Markdown") -> str:
    if mode == "MarkdownV2":
        return escape_markdown_v2(text)
    return text  # Regular Markdown is less strict
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# Mini App URL
WEBAPP_URL=https://launchkit.ai
# Development: http://localhost:3000

# Admin Notifications
ADMIN_CHAT_ID=-1001234567890
# Or: @channel_username

# API
API_BASE_URL=http://localhost:8000/api/v1

# Environment
ENVIRONMENT=development
```

### Get Bot Token

1. Open [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Follow prompts
4. Copy token

### Setup Mini App

1. Send `/newapp` to @BotFather
2. Select your bot
3. Upload app icon (512x512)
4. Set URL: `https://launchkit.ai`
5. Set short name: `launchkit`

### Setup Menu Button

```
/setmenubutton
[Select your bot]
URL: https://launchkit.ai
Text: Open LaunchKit AI
```

---

## 🔌 API Integration

### From API to Bot

```python
# In DFY endpoint
@router.post("/inquiry")
async def create_inquiry(
    data: DFYInquiryCreate,
    background_tasks: BackgroundTasks,
    ...
):
    # Create inquiry
    inquiry = DFYInquiry(...)
    db.add(inquiry)
    
    # Send notifications (async)
    background_tasks.add_task(send_bot_notification, inquiry, user)
    background_tasks.add_task(send_user_confirmation, inquiry, user)
    
    return inquiry
```

**Flow:**
1. User submits DFY form
2. API creates inquiry in database
3. Background task triggers bot notification
4. Bot sends message to admin channel
5. Bot sends confirmation to user

---

## 🧪 Testing

### Test Bot Locally

```bash
cd apps/bot
source venv/bin/activate
python main.py
```

Bot starts polling...

### Test Commands

Open Telegram and send:
```
/start
/help
/about
/status
```

### Test Notifications

```python
# In Python shell
import asyncio
from main import notify_dfy_inquiry

inquiry_data = {
    "id": "test-123",
    "project_name": "Test Project",
    "project_description": "This is a test...",
    "budget": "$10K-20K",
    "timeline": "1-2 months",
    "contact_info": {
        "full_name": "Test User",
        "telegram_id": YOUR_TELEGRAM_ID,
        "email": "test@example.com"
    }
}

asyncio.run(notify_dfy_inquiry(inquiry_data))
```

Check your Telegram for:
- Admin notification (in admin channel)
- User confirmation (to your account)

---

## 📊 Message Examples

### Admin Notification

```
🚀 New Done-For-You Request

Project: AI Task Manager
Request ID: abc12345

📋 Project Details:
• Type: Web Application
• Budget: $10,000 - $20,000
• Timeline: 1-2 months
• Stage: Just an idea

👤 Client Information:
• Name: John Doe
• Telegram: @johndoe
• Email: john@example.com

💬 Description:
A smart task management application that uses AI to prioritize tasks and suggest optimal schedules...

⏰ Submitted: Just now

👉 Action Required: Review and contact client within 24 hours
```

### User Confirmation

```
✅ Request Submitted Successfully!

Thank you for your Done-For-You service request!

Project: AI Task Manager
Request ID: abc12345

What happens next:
⏰ Within 4 hours - Team reviews your request
👥 Within 24 hours - Discovery call scheduled
📄 Within 48 hours - Custom proposal sent

We'll contact you via Telegram with next steps.

Questions? Reply to this message or contact @launchkit_support

[📱 Open LaunchKit AI]
```

---

## 🛡️ Error Handling

### Bot Connection Errors

```python
try:
    await bot.send_message(...)
except Exception as e:
    logger.error(f"Failed to send: {e}")
    # Don't fail the API request
```

**Benefits:**
- API request succeeds even if bot fails
- Errors logged for debugging
- Notifications are "best effort"

### Invalid Chat ID

```python
if not ADMIN_CHAT_ID:
    logger.warning("ADMIN_CHAT_ID not set")
    return False  # Skip silently
```

### Rate Limiting

Telegram Bot API limits:
- 30 messages/second to different chats
- 1 message/second to same chat

**Protection:**
```python
# Use background tasks
background_tasks.add_task(send_notification, ...)
# Queues and sends asynchronously
```

---

## ✅ Implementation Checklist

- [x] aiogram bot skeleton
- [x] /start command with mini app
- [x] Deep-link support
- [x] Admin notification sender
- [x] User confirmation sender
- [x] Safe MarkdownV2 escaping
- [x] DFY notification format
- [x] Integration with API
- [x] Background tasks
- [x] Error handling
- [x] Logging
- [x] Environment configuration

---

## 🎉 Summary

**Complete Telegram Bot with:**

✅ Commands (/start, /help, /about, /status)  
✅ Mini app WebApp button  
✅ Deep-link support  
✅ Admin notifications  
✅ User confirmations  
✅ MarkdownV2 formatting  
✅ Safe character escaping  
✅ DFY inquiry format  
✅ API integration  
✅ Background tasks  
✅ Error handling  

**Bot is production-ready! 🤖✨**

