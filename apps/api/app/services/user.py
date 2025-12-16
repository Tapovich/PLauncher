"""
User service
"""

from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.user import UserRepository
from app.services.base import BaseService
from app.core.exceptions import NotFoundException, ConflictException


class UserService(BaseService):
    """User service with business logic"""

    def __init__(self, db: AsyncSession):
        super().__init__(db)
        self.repo = UserRepository(db)

    async def get_user(self, user_id: UUID) -> User:
        """Get user by ID"""
        user = await self.repo.get(user_id)
        if not user:
            raise NotFoundException(f"User with ID {user_id} not found")
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return await self.repo.get_by_email(email)

    async def get_user_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        """Get user by Telegram ID"""
        return await self.repo.get_by_telegram_id(telegram_id)

    async def create_user(
        self,
        email: Optional[str] = None,
        telegram_id: Optional[int] = None,
        full_name: str = "",
        password_hash: Optional[str] = None,
        plan: str = "free",
    ) -> User:
        """Create new user"""
        # Validate uniqueness
        if email and await self.repo.email_exists(email):
            raise ConflictException(f"User with email {email} already exists")

        if telegram_id and await self.repo.telegram_id_exists(telegram_id):
            raise ConflictException(
                f"User with Telegram ID {telegram_id} already exists"
            )

        return await self.repo.create(
            email=email,
            telegram_id=telegram_id,
            full_name=full_name,
            password_hash=password_hash,
            plan=plan,
        )

    async def update_user(self, user_id: UUID, **data) -> User:
        """Update user"""
        user = await self.repo.update(user_id, **data)
        if not user:
            raise NotFoundException(f"User with ID {user_id} not found")
        return user

    async def delete_user(self, user_id: UUID) -> bool:
        """Delete user"""
        success = await self.repo.delete(user_id)
        if not success:
            raise NotFoundException(f"User with ID {user_id} not found")
        return success

