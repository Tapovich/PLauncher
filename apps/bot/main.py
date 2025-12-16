"""
LaunchKit AI - Telegram Bot
Handles bot commands, mini app deep-links, and admin notifications
"""

import asyncio
import logging
import re
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.enums import ParseMode
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize bot and dispatcher
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://launchkit.ai")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "")  # Can be chat_id or @channel_username

if not TELEGRAM_BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN not set in environment")

bot = Bot(token=TELEGRAM_BOT_TOKEN)
dp = Dispatcher()


def escape_markdown_v2(text: str) -> str:
    """
    Escape special characters for MarkdownV2
    
    MarkdownV2 requires escaping: _ * [ ] ( ) ~ ` > # + - = | { } . !
    """
    special_chars = r'_*[]()~`>#+-=|{}.!'
    return ''.join(f'\\{char}' if char in special_chars else char for char in text)


def safe_markdown(text: str, mode: str = "Markdown") -> str:
    """
    Safe Markdown formatting
    
    Args:
        text: Text to format
        mode: "Markdown" or "MarkdownV2"
    
    Returns:
        Safely formatted text
    """
    if mode == "MarkdownV2":
        return escape_markdown_v2(text)
    return text  # Regular Markdown is less strict


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """Handle /start command with mini app deep-link"""
    
    # Extract deep-link parameters if present
    args = message.text.split()[1:] if len(message.text.split()) > 1 else []
    deep_link = f"?startapp={args[0]}" if args else ""
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🚀 Open LaunchKit AI",
                    web_app=WebAppInfo(url=f"{WEBAPP_URL}{deep_link}")
                )
            ],
            [
                InlineKeyboardButton(
                    text="📖 How It Works",
                    callback_data="how_it_works"
                )
            ],
            [
                InlineKeyboardButton(
                    text="👥 Browse Team",
                    callback_data="browse_team"
                )
            ]
        ]
    )
    
    welcome_text = (
        "👋 *Welcome to LaunchKit AI\\!*\n\n"
        "From Idea to Launch in 14 Days with AI\n\n"
        "*What I can help you with:*\n"
        "💡 Generate startup ideas with AI\n"
        "📋 Create detailed technical specifications\n"
        "👥 Find and hire talented team members\n"
        "🚀 Full\\-service launch support\n\n"
        "Tap the button below to get started\\!"
    )
    
    await message.answer(
        welcome_text,
        reply_markup=keyboard,
        parse_mode=ParseMode.MARKDOWN_V2
    )


@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    """Handle /help command"""
    
    help_text = (
        "*LaunchKit AI Commands:*\n\n"
        "/start \\- Start the bot and open LaunchKit AI\n"
        "/help \\- Show this help message\n"
        "/about \\- About LaunchKit AI\n"
        "/status \\- Check your projects status\n\n"
        "*Features:*\n"
        "• AI\\-powered startup idea generation\n"
        "• Automated tech spec creation\n"
        "• Team marketplace\n"
        "• Done\\-for\\-you launch service\n\n"
        "Questions? Contact @launchkit\\_support"
    )
    
    await message.answer(help_text, parse_mode=ParseMode.MARKDOWN_V2)


@dp.message(Command("about"))
async def cmd_about(message: types.Message):
    """Handle /about command"""
    
    about_text = (
        "*About LaunchKit AI*\n\n"
        "LaunchKit AI is a platform that helps entrepreneurs turn their ideas "
        "into reality in just 14 days\\.\n\n"
        "We use advanced AI \\(Claude 3\\.5 Sonnet\\) to:\n"
        "• Generate unique startup ideas\n"
        "• Create detailed technical specifications\n"
        "• Match you with the perfect team\n"
        "• Guide you from concept to launch\n\n"
        "🌐 Website: launchkit\\.ai\n"
        "📧 Email: hello@launchkit\\.ai\n"
        "💬 Support: @launchkit\\_support"
    )
    
    await message.answer(about_text, parse_mode=ParseMode.MARKDOWN_V2)


@dp.message(Command("status"))
async def cmd_status(message: types.Message):
    """Handle /status command"""
    
    # TODO: Fetch user's projects from API
    status_text = (
        "*Your Projects:*\n\n"
        "🔄 In progress \\- fetching from API\\.\\.\\.\n\n"
        "_This feature is coming soon\\!_\n\n"
        "Open the mini app to view all your projects\\."
    )
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🚀 Open LaunchKit AI",
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            ]
        ]
    )
    
    await message.answer(
        status_text,
        reply_markup=keyboard,
        parse_mode=ParseMode.MARKDOWN_V2
    )


@dp.callback_query(F.data == "help")
async def process_help_callback(callback_query: types.CallbackQuery):
    """Handle help callback"""
    await bot.answer_callback_query(callback_query.id)
    if callback_query.message:
        await cmd_help(callback_query.message)


@dp.callback_query(F.data == "how_it_works")
async def process_how_it_works_callback(callback_query: types.CallbackQuery):
    """Handle how it works callback"""
    await bot.answer_callback_query(callback_query.id)
    
    text = (
        "*How LaunchKit AI Works:*\n\n"
        "*Step 1:* Chat with AI\n"
        "Answer a few questions about your idea\n\n"
        "*Step 2:* Get Ideas\n"
        "Receive 3\\-5 personalized startup ideas\n\n"
        "*Step 3:* Tech Spec\n"
        "Generate detailed technical specification\n\n"
        "*Step 4:* Build Team\n"
        "Find and hire developers\\, designers\\, PMs\n\n"
        "*Step 5:* Launch\\!*\n"
        "Your product goes live in 14 days"
    )
    
    if callback_query.message:
        await callback_query.message.answer(text, parse_mode=ParseMode.MARKDOWN_V2)


@dp.callback_query(F.data == "browse_team")
async def process_browse_team_callback(callback_query: types.CallbackQuery):
    """Handle browse team callback"""
    await bot.answer_callback_query(callback_query.id)
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🚀 Open Marketplace",
                    web_app=WebAppInfo(url=f"{WEBAPP_URL}/marketplace")
                )
            ]
        ]
    )
    
    text = (
        "*Team Marketplace*\n\n"
        "Browse 20\\+ verified freelancers:\n"
        "👨‍💻 Developers\n"
        "🎨 Designers\n"
        "📊 Product Managers\n"
        "🧪 QA Engineers\n"
        "⚙️ DevOps Engineers\n\n"
        "All freelancers are verified with real portfolios and reviews\\."
    )
    
    if callback_query.message:
        await callback_query.message.answer(
            text,
            reply_markup=keyboard,
            parse_mode=ParseMode.MARKDOWN_V2
        )


# ============================================
# ADMIN NOTIFICATION FUNCTIONS
# ============================================

async def send_admin_notification(message: str, parse_mode: str = "MarkdownV2"):
    """
    Send notification to admin chat/channel
    
    Args:
        message: Formatted message to send
        parse_mode: "Markdown", "MarkdownV2", or "HTML"
    
    Returns:
        True if sent successfully, False otherwise
    """
    if not ADMIN_CHAT_ID:
        logger.warning("ADMIN_CHAT_ID not configured, skipping notification")
        return False
    
    try:
        await bot.send_message(
            chat_id=ADMIN_CHAT_ID,
            text=message,
            parse_mode=parse_mode
        )
        logger.info(f"Admin notification sent to {ADMIN_CHAT_ID}")
        return True
    except Exception as e:
        logger.error(f"Failed to send admin notification: {e}")
        return False


async def send_user_notification(
    user_telegram_id: int,
    message: str,
    parse_mode: str = "MarkdownV2",
    reply_markup=None
):
    """
    Send notification to specific user
    
    Args:
        user_telegram_id: Telegram user ID
        message: Formatted message to send
        parse_mode: "Markdown", "MarkdownV2", or "HTML"
        reply_markup: Optional keyboard markup
    
    Returns:
        True if sent successfully, False otherwise
    """
    try:
        await bot.send_message(
            chat_id=user_telegram_id,
            text=message,
            parse_mode=parse_mode,
            reply_markup=reply_markup
        )
        logger.info(f"User notification sent to {user_telegram_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to send user notification to {user_telegram_id}: {e}")
        return False


def format_dfy_notification(inquiry_data: dict) -> str:
    """
    Format DFY inquiry for admin notification
    
    Args:
        inquiry_data: Dictionary with inquiry details
        
    Returns:
        Formatted message in MarkdownV2
    """
    # Extract data
    inquiry_id = inquiry_data.get("id", "")[:8]  # First 8 chars
    project_name = escape_markdown_v2(inquiry_data.get("project_name", "Untitled"))
    description = escape_markdown_v2(inquiry_data.get("project_description", "")[:200])
    project_type = escape_markdown_v2(inquiry_data.get("project_type", "Not specified"))
    budget = escape_markdown_v2(inquiry_data.get("budget", "Not specified"))
    timeline = escape_markdown_v2(inquiry_data.get("timeline", "Not specified"))
    stage = escape_markdown_v2(inquiry_data.get("stage", "Not specified"))
    
    # User info
    contact_info = inquiry_data.get("contact_info", {})
    user_name = escape_markdown_v2(contact_info.get("full_name", "Unknown"))
    telegram_id = contact_info.get("telegram_id", "")
    username_raw = contact_info.get("username", "")
    username_escaped = escape_markdown_v2(username_raw) if username_raw else ""
    email = escape_markdown_v2(contact_info.get("email", "Not provided"))
    
    # Format telegram contact (move escaping outside f-string)
    telegram_contact = f"@{username_escaped}" if username_raw else f"ID: `{telegram_id}`"
    
    # Format description with ellipsis
    desc_ellipsis = "\\.\\.\\." if len(inquiry_data.get('project_description', '')) > 200 else ""
    
    # Build message
    message = f"""🚀 *New Done\\-For\\-You Request*

*Project:* {project_name}
*Request ID:* `{inquiry_id}`

📋 *Project Details:*
• *Type:* {project_type}
• *Budget:* {budget}
• *Timeline:* {timeline}
• *Stage:* {stage}

👤 *Client Information:*
• *Name:* {user_name}
• *Telegram:* {telegram_contact}
• *Email:* {email}

💬 *Description:*
{description}{desc_ellipsis}

⏰ *Submitted:* Just now

👉 *Action Required:* Review and contact client within 24 hours"""
    
    return message


def format_user_confirmation(inquiry_data: dict) -> str:
    """
    Format confirmation message for user
    
    Args:
        inquiry_data: Dictionary with inquiry details
        
    Returns:
        Formatted message in MarkdownV2
    """
    inquiry_id = inquiry_data.get("id", "")[:8]
    project_name = escape_markdown_v2(inquiry_data.get("project_name", ""))
    
    message = f"""✅ *Request Submitted Successfully\\!*

Thank you for your Done\\-For\\-You service request\\!

*Project:* {project_name}
*Request ID:* `{inquiry_id}`

*What happens next:*
⏰ *Within 4 hours* \\- Team reviews your request
👥 *Within 24 hours* \\- Discovery call scheduled
📄 *Within 48 hours* \\- Custom proposal sent

We'll contact you via Telegram with next steps\\.

Questions? Reply to this message or contact @launchkit\\_support"""
    
    return message


async def notify_dfy_inquiry(inquiry_data: dict):
    """
    Send DFY inquiry notifications
    
    Sends to both admin and user
    
    Args:
        inquiry_data: Complete inquiry data including contact_info
    """
    # Send to admin
    admin_message = format_dfy_notification(inquiry_data)
    await send_admin_notification(admin_message, parse_mode="MarkdownV2")
    
    # Send confirmation to user
    contact_info = inquiry_data.get("contact_info", {})
    telegram_id = contact_info.get("telegram_id")
    
    if telegram_id:
        user_message = format_user_confirmation(inquiry_data)
        
        # Add button to open mini app
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="📱 Open LaunchKit AI",
                        web_app=WebAppInfo(url=WEBAPP_URL)
                    )
                ]
            ]
        )
        
        await send_user_notification(
            telegram_id,
            user_message,
            parse_mode="MarkdownV2",
            reply_markup=keyboard
        )


# ============================================
# WEBHOOK HANDLER (for API integration)
# ============================================

async def handle_dfy_webhook(data: dict):
    """
    Handle DFY inquiry webhook from API
    
    This function is called by the API when a new inquiry is created
    
    Args:
        data: Inquiry data from API
    """
    logger.info(f"Handling DFY webhook: {data.get('id', 'unknown')}")
    await notify_dfy_inquiry(data)


async def main():
    """Main bot function"""
    logger.info("🤖 LaunchKit AI Bot starting...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"WebApp URL: {WEBAPP_URL}")
    
    if ADMIN_CHAT_ID:
        logger.info(f"Admin notifications enabled: {ADMIN_CHAT_ID}")
    else:
        logger.warning("ADMIN_CHAT_ID not set - admin notifications disabled")
    
    try:
        # Start polling
        logger.info("Bot polling started...")
        await dp.start_polling(bot)
    except Exception as e:
        logger.error(f"Bot error: {e}")
    finally:
        await bot.session.close()
        logger.info("Bot stopped")


if __name__ == "__main__":
    asyncio.run(main())


