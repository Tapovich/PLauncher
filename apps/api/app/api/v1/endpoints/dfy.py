"""
Done-For-You service endpoints
"""

from fastapi import APIRouter, Depends, BackgroundTasks, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os

from app.api.dependencies import get_database, get_current_user
from app.models.user import User
from app.models.dfy_inquiry import DFYInquiry
from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)
router = APIRouter()


# Request/Response Models
class DFYInquiryCreate(BaseModel):
    """Create DFY inquiry"""
    project_name: str
    project_description: str
    project_type: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    stage: Optional[str] = None
    additional_info: Optional[str] = None


class DFYInquiryResponse(BaseModel):
    """DFY inquiry response"""
    id: UUID
    user_id: UUID
    project_name: str
    project_description: str
    project_type: Optional[str]
    budget: Optional[str]
    timeline: Optional[str]
    stage: Optional[str]
    additional_info: Optional[str]
    status: str
    contact_info: Optional[Dict[str, Any]]
    created_at: str

    class Config:
        from_attributes = True


async def send_bot_notification(inquiry: DFYInquiry, user: User):
    """
    Send notification to Telegram bot/admin
    
    Calls the bot's webhook endpoint to trigger notifications
    """
    logger.info(f"DFY Inquiry notification: {inquiry.id} from {user.full_name}")
    
    try:
        import httpx
        
        # Prepare inquiry data for bot
        inquiry_data = {
            "id": str(inquiry.id),
            "project_name": inquiry.project_name,
            "project_description": inquiry.project_description,
            "project_type": inquiry.project_type,
            "budget": inquiry.budget,
            "timeline": inquiry.timeline,
            "stage": inquiry.stage,
            "additional_info": inquiry.additional_info,
            "status": inquiry.status,
            "contact_info": inquiry.contact_info or {},
            "created_at": inquiry.created_at.isoformat(),
        }
        
        # Option 1: Call bot directly via HTTP (if bot has webhook endpoint)
        # TODO: Implement webhook in bot
        # async with httpx.AsyncClient() as client:
        #     await client.post(
        #         f"{settings.BOT_WEBHOOK_URL}/dfy-notification",
        #         json=inquiry_data,
        #         timeout=5.0
        #     )
        
        # Option 2: Use Telegram Bot API directly (current implementation)
        if settings.TELEGRAM_BOT_TOKEN:
            from aiogram import Bot
            from aiogram.enums import ParseMode
            
            bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
            
            try:
                # Format admin message
                message = format_admin_dfy_message(inquiry_data)
                
                # Send to admin
                admin_chat_id = os.getenv("ADMIN_CHAT_ID", "")
                if admin_chat_id:
                    await bot.send_message(
                        chat_id=admin_chat_id,
                        text=message,
                        parse_mode=ParseMode.MARKDOWN_V2
                    )
                    logger.info(f"Admin notification sent for inquiry {inquiry.id}")
            finally:
                await bot.session.close()
        
    except Exception as e:
        logger.error(f"Failed to send bot notification: {e}", exc_info=True)


async def send_user_confirmation(inquiry: DFYInquiry, user: User):
    """
    Send confirmation to user via Telegram
    """
    logger.info(f"Sending confirmation to user {user.id}")
    
    try:
        if user.telegram_id and settings.TELEGRAM_BOT_TOKEN:
            from aiogram import Bot
            from aiogram.enums import ParseMode
            from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
            
            bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
            
            try:
                # Format user message
                inquiry_data = {
                    "id": str(inquiry.id),
                    "project_name": inquiry.project_name,
                }
                message = format_user_dfy_confirmation(inquiry_data)
                
                # Add button to open mini app
                keyboard = InlineKeyboardMarkup(
                    inline_keyboard=[
                        [
                            InlineKeyboardButton(
                                text="📱 Open LaunchKit AI",
                                web_app=WebAppInfo(url=os.getenv("WEBAPP_URL", "https://launchkit.ai"))
                            )
                        ]
                    ]
                )
                
                # Send to user
                await bot.send_message(
                    chat_id=user.telegram_id,
                    text=message,
                    parse_mode=ParseMode.MARKDOWN_V2,
                    reply_markup=keyboard
                )
                logger.info(f"User confirmation sent to {user.telegram_id}")
            finally:
                await bot.session.close()
    
    except Exception as e:
        logger.error(f"Failed to send user confirmation: {e}", exc_info=True)


def escape_markdown_v2(text: str) -> str:
    """Escape special characters for MarkdownV2"""
    special_chars = r'_*[]()~`>#+-=|{}.!'
    return ''.join(f'\\{char}' if char in special_chars else char for char in str(text))


def format_admin_dfy_message(inquiry_data: dict) -> str:
    """Format DFY inquiry for admin notification"""
    inquiry_id = inquiry_data.get("id", "")[:8]
    project_name = escape_markdown_v2(inquiry_data.get("project_name", ""))
    description = escape_markdown_v2(inquiry_data.get("project_description", "")[:200])
    project_type = escape_markdown_v2(inquiry_data.get("project_type", "Not specified"))
    budget = escape_markdown_v2(inquiry_data.get("budget", "Not specified"))
    timeline = escape_markdown_v2(inquiry_data.get("timeline", "Not specified"))
    stage = escape_markdown_v2(inquiry_data.get("stage", "Not specified"))
    
    contact_info = inquiry_data.get("contact_info", {})
    user_name = escape_markdown_v2(contact_info.get("full_name", "Unknown"))
    telegram_id = contact_info.get("telegram_id", "")
    username_raw = contact_info.get("username", "")
    username_escaped = escape_markdown_v2(username_raw) if username_raw else ""
    email = escape_markdown_v2(contact_info.get("email", "Not provided"))
    
    # Format telegram contact
    telegram_contact = f"@{username_escaped}" if username_raw else f"ID: `{telegram_id}`"
    
    # Format description with ellipsis
    desc_ellipsis = "\\.\\.\\." if len(inquiry_data.get("project_description", "")) > 200 else ""
    
    return f"""🚀 *New Done\\-For\\-You Request*

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


def format_user_dfy_confirmation(inquiry_data: dict) -> str:
    """Format confirmation message for user"""
    inquiry_id = inquiry_data.get("id", "")[:8]
    project_name = escape_markdown_v2(inquiry_data.get("project_name", ""))
    
    return f"""✅ *Request Submitted Successfully\\!*

Thank you for your Done\\-For\\-You service request\\!

*Project:* {project_name}
*Request ID:* `{inquiry_id}`

*What happens next:*
⏰ *Within 4 hours* \\- Team reviews your request
👥 *Within 24 hours* \\- Discovery call scheduled
📄 *Within 48 hours* \\- Custom proposal sent

We'll contact you via Telegram with next steps\\.

Questions? Reply to this message or contact @launchkit\\_support"""


@router.post(
    "/inquiry",
    response_model=DFYInquiryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit DFY inquiry",
)
async def create_dfy_inquiry(
    data: DFYInquiryCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """
    Submit Done-For-You service inquiry
    
    **Required Fields:**
    - `project_name`: Name of the project (min 3 chars)
    - `project_description`: Detailed description (min 50 chars)
    
    **Optional Fields:**
    - `project_type`: Type of project (web, mobile, ai, etc.)
    - `budget`: Budget range ($3K-5K, $5K-10K, etc.)
    - `timeline`: Desired timeline (ASAP, 1-2 months, etc.)
    - `stage`: Current stage (idea, planning, etc.)
    - `additional_info`: Any other details
    
    **Process:**
    1. Validates inquiry data
    2. Stores in database
    3. Sends notification to admin team
    4. Sends confirmation to user
    
    **Requires:** JWT access token
    
    **Response:** Created inquiry with status='pending'
    """
    # Validation
    if len(data.project_name.strip()) < 3:
        from app.core.exceptions import BadRequestException
        raise BadRequestException("Project name must be at least 3 characters")
    
    if len(data.project_description.strip()) < 50:
        from app.core.exceptions import BadRequestException
        raise BadRequestException("Project description must be at least 50 characters")
    
    # Extract contact info from user
    contact_info = {
        "telegram_id": current_user.telegram_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
    }
    
    # Create inquiry
    inquiry = DFYInquiry(
        user_id=current_user.id,
        project_name=data.project_name.strip(),
        project_description=data.project_description.strip(),
        project_type=data.project_type,
        budget=data.budget,
        timeline=data.timeline,
        stage=data.stage,
        additional_info=data.additional_info,
        status="pending",
        contact_info=contact_info,
    )
    
    db.add(inquiry)
    await db.flush()
    await db.refresh(inquiry)
    
    logger.info(f"DFY inquiry created: {inquiry.id} by user {current_user.id}")
    
    # Send notifications in background
    background_tasks.add_task(send_bot_notification, inquiry, current_user)
    background_tasks.add_task(send_user_confirmation, inquiry, current_user)
    
    return DFYInquiryResponse.model_validate(inquiry)


@router.get(
    "/inquiry/{inquiry_id}",
    response_model=DFYInquiryResponse,
    summary="Get DFY inquiry",
)
async def get_dfy_inquiry(
    inquiry_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """
    Get DFY inquiry by ID
    
    **Requires:** JWT access token
    
    **Ownership:** Can only view your own inquiries
    """
    result = await db.execute(
        select(DFYInquiry).where(DFYInquiry.id == inquiry_id)
    )
    inquiry = result.scalar_one_or_none()
    
    if not inquiry:
        from app.core.exceptions import NotFoundException
        raise NotFoundException(f"Inquiry {inquiry_id} not found")
    
    # Verify ownership
    if inquiry.user_id != current_user.id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("You don't have access to this inquiry")
    
    return DFYInquiryResponse.model_validate(inquiry)


@router.get(
    "/inquiries",
    response_model=list[DFYInquiryResponse],
    summary="List user inquiries",
)
async def list_user_inquiries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """
    List all DFY inquiries for current user
    
    **Requires:** JWT access token
    
    **Returns:** All inquiries ordered by created_at DESC
    """
    result = await db.execute(
        select(DFYInquiry)
        .where(DFYInquiry.user_id == current_user.id)
        .order_by(DFYInquiry.created_at.desc())
    )
    inquiries = result.scalars().all()
    
    return [DFYInquiryResponse.model_validate(inq) for inq in inquiries]

