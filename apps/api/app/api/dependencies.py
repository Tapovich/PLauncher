"""
Common dependencies for API endpoints
"""

from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.db.session import get_db
from app.services.user import UserService
from app.services.project import ProjectService
from app.services.freelancer import FreelancerService
from app.services.ai_service import AIService
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.models.user import User

# Security scheme for OpenAPI
security = HTTPBearer()


# Database dependency
async def get_database() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    async for session in get_db():
        yield session


# Service dependencies
def get_user_service(db: AsyncSession = Depends(get_database)) -> UserService:
    """Get user service"""
    return UserService(db)


def get_project_service(db: AsyncSession = Depends(get_database)) -> ProjectService:
    """Get project service"""
    return ProjectService(db)


def get_freelancer_service(
    db: AsyncSession = Depends(get_database),
) -> FreelancerService:
    """Get freelancer service"""
    return FreelancerService(db)


def get_ai_service(db: AsyncSession = Depends(get_database)) -> AIService:
    """Get AI service"""
    return AIService(db)


# Authentication dependencies
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_service: UserService = Depends(get_user_service),
) -> User:
    """
    Get current authenticated user from JWT token
    
    Usage:
        @app.get("/protected")
        async def protected_route(user: User = Depends(get_current_user)):
            return {"user_id": user.id}
    
    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    try:
        # Decode JWT token
        token = credentials.credentials
        payload = decode_token(token)
        
        # Get user ID from token
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            raise UnauthorizedException("Invalid token: missing user ID")
        
        user_id = UUID(user_id_str)
        
        # Get user from database
        user = await user_service.get_user(user_id)
        if not user:
            raise UnauthorizedException("User not found")
        
        return user
        
    except UnauthorizedException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    user_service: UserService = Depends(get_user_service),
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise None
    
    Useful for endpoints that work for both authenticated and anonymous users
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = decode_token(token)
        user_id_str = payload.get("sub")
        
        if user_id_str:
            user_id = UUID(user_id_str)
            return await user_service.get_user(user_id)
    except Exception:
        pass
    
    return None
