"""
Authentication endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

from app.core.security import create_access_token, create_refresh_token
from app.core.telegram import verify_telegram_init_data, parse_telegram_user
from app.core.exceptions import UnauthorizedException
from app.api.dependencies import get_user_service, get_current_user
from app.services.user import UserService
from app.models.user import User

router = APIRouter()


# Request/Response Models
class TelegramAuthRequest(BaseModel):
    """Telegram authentication request"""
    init_data: str


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes


class UserProfileResponse(BaseModel):
    """User profile response"""
    id: UUID
    telegram_id: Optional[int]
    email: Optional[EmailStr]
    full_name: str
    plan: str
    created_at: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Complete auth response with token and user"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800
    user: UserProfileResponse


@router.post("/telegram", response_model=AuthResponse, summary="Telegram authentication")
async def telegram_auth(
    request: TelegramAuthRequest,
    user_service: UserService = Depends(get_user_service),
):
    """
    Authenticate via Telegram WebApp
    
    Verifies initData from Telegram WebApp, creates or updates user,
    and returns JWT access token.
    
    **Flow:**
    1. Verify initData hash using bot token
    2. Parse user data from initData
    3. Upsert user by telegram_id
    4. Generate JWT tokens
    5. Return tokens + user profile
    """
    # Verify Telegram initData
    try:
        verified_data = verify_telegram_init_data(request.init_data)
    except UnauthorizedException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
    
    # Parse user data
    user_data = parse_telegram_user(verified_data)
    telegram_id = user_data.get("telegram_id")
    
    if not telegram_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing telegram_id in initData",
        )
    
    # Upsert user by telegram_id
    user = await user_service.get_user_by_telegram_id(telegram_id)
    
    if user:
        # Update user info
        user = await user_service.update_user(
            user.id,
            full_name=user_data.get("full_name") or user.full_name,
        )
    else:
        # Create new user
        user = await user_service.create_user(
            telegram_id=telegram_id,
            full_name=user_data.get("full_name") or "Telegram User",
            plan="free",
        )
    
    # Generate JWT tokens
    token_data = {
        "sub": str(user.id),
        "telegram_id": telegram_id,
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Return response
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=1800,
        user=UserProfileResponse.model_validate(user),
    )


@router.get("/me", response_model=UserProfileResponse, summary="Get current user")
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user profile
    
    **Requires:** Valid JWT access token in Authorization header
    """
    return UserProfileResponse.model_validate(current_user)


@router.post("/refresh", response_model=TokenResponse, summary="Refresh access token")
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    user_service: UserService = Depends(get_user_service),
):
    """
    Refresh access token using refresh token
    
    **TODO:** Implement refresh token validation and rotation
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Refresh token not implemented yet",
    )


# Email/password auth (optional, for future)
class LoginRequest(BaseModel):
    """Email/password login request"""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str
    full_name: str


@router.post("/login", response_model=AuthResponse, summary="Email/password login")
async def login(
    request: LoginRequest,
    user_service: UserService = Depends(get_user_service),
):
    """
    Login with email and password
    
    **TODO:** Implement email/password authentication
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Email authentication not implemented yet",
    )


@router.post("/register", response_model=AuthResponse, summary="Register new user")
async def register(
    request: RegisterRequest,
    user_service: UserService = Depends(get_user_service),
):
    """
    Register new user with email and password
    
    **TODO:** Implement user registration
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Registration not implemented yet",
    )

