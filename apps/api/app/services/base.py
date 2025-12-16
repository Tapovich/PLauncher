"""
Base service class
"""

from sqlalchemy.ext.asyncio import AsyncSession


class BaseService:
    """Base service with common functionality"""

    def __init__(self, db: AsyncSession):
        self.db = db

