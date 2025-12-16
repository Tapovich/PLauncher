"""
Project repository
"""

from typing import List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    """Project repository with custom queries"""

    def __init__(self, db: AsyncSession):
        super().__init__(Project, db)

    async def get_by_user(
        self, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """Get all projects for a user"""
        result = await self.db.execute(
            select(Project)
            .where(Project.user_id == user_id)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_status(
        self, status: str, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """Get projects by status"""
        result = await self.db.execute(
            select(Project)
            .where(Project.status == status)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_user_projects_by_status(
        self, user_id: UUID, status: str
    ) -> List[Project]:
        """Get user's projects by status"""
        result = await self.db.execute(
            select(Project)
            .where(Project.user_id == user_id, Project.status == status)
            .order_by(Project.created_at.desc())
        )
        return list(result.scalars().all())

