"""
User management endpoints
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

from app.api.dependencies import get_user_service, get_current_user
from app.services.user import UserService
from app.models.user import User

router = APIRouter()


class UserResponse(BaseModel):
    """User response model"""

    id: UUID
    email: Optional[EmailStr]
    telegram_id: Optional[int]
    full_name: str
    plan: str
    created_at: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """User update model"""

    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


@router.get("/me", response_model=UserResponse, summary="Get current user")
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user profile
    
    **Requires:** JWT access token
    """
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse, summary="Update current user")
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """
    Update current user profile
    
    **Requires:** JWT access token
    """
    user = await user_service.update_user(
        current_user.id,
        **data.model_dump(exclude_unset=True)
    )
    return UserResponse.model_validate(user)


@router.get("/{user_id}", response_model=UserResponse, summary="Get user by ID")
async def get_user(
    user_id: UUID,
    user_service: UserService = Depends(get_user_service),
):
    """Get user by ID (public profile)"""
    user = await user_service.get_user(user_id)
    return UserResponse.model_validate(user)

