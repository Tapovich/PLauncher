"""
Freelancer repository
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.freelancer import Freelancer
from app.models.user import User
from app.repositories.base import BaseRepository


class FreelancerRepository(BaseRepository[Freelancer]):
    """Freelancer repository with custom queries"""

    def __init__(self, db: AsyncSession):
        super().__init__(Freelancer, db)

    async def search(
        self,
        role: Optional[str] = None,
        skills: Optional[List[str]] = None,
        min_rate: Optional[int] = None,
        max_rate: Optional[int] = None,
        availability: Optional[str] = None,
        verified_only: bool = False,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Freelancer]:
        """Search freelancers with filters"""
        query = select(Freelancer).join(User)

        # Build filters
        filters = []

        if role:
            filters.append(Freelancer.role == role)

        if skills:
            # Use PostgreSQL array overlap operator
            filters.append(Freelancer.skills.overlap(skills))

        if min_rate is not None:
            filters.append(Freelancer.hourly_rate_usd >= min_rate)

        if max_rate is not None:
            filters.append(Freelancer.hourly_rate_usd <= max_rate)

        if availability:
            filters.append(Freelancer.availability == availability)

        if verified_only:
            filters.append(Freelancer.verified == True)

        if filters:
            query = query.where(and_(*filters))

        # Order by rating and projects completed
        query = (
            query.order_by(Freelancer.rating.desc(), Freelancer.projects_completed.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_user_id(self, user_id: UUID) -> Optional[Freelancer]:
        """Get freelancer profile by user ID"""
        result = await self.db.execute(
            select(Freelancer).where(Freelancer.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_top_rated(self, limit: int = 10) -> List[Freelancer]:
        """Get top rated freelancers"""
        result = await self.db.execute(
            select(Freelancer)
            .where(Freelancer.verified == True)
            .order_by(Freelancer.rating.desc(), Freelancer.projects_completed.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

