"""
Freelancer service
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.freelancer import Freelancer
from app.repositories.freelancer import FreelancerRepository
from app.services.base import BaseService
from app.core.exceptions import NotFoundException


class FreelancerService(BaseService):
    """Freelancer service with business logic"""

    def __init__(self, db: AsyncSession):
        super().__init__(db)
        self.repo = FreelancerRepository(db)

    async def get_freelancer(self, freelancer_id: UUID) -> Freelancer:
        """Get freelancer by ID"""
        freelancer = await self.repo.get(freelancer_id)
        if not freelancer:
            raise NotFoundException(
                f"Freelancer with ID {freelancer_id} not found"
            )
        return freelancer

    async def search_freelancers(
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
        return await self.repo.search(
            role=role,
            skills=skills,
            min_rate=min_rate,
            max_rate=max_rate,
            availability=availability,
            verified_only=verified_only,
            skip=skip,
            limit=limit,
        )

    async def get_top_freelancers(self, limit: int = 10) -> List[Freelancer]:
        """Get top rated freelancers"""
        return await self.repo.get_top_rated(limit)

    async def create_freelancer_profile(
        self, user_id: UUID, **data
    ) -> Freelancer:
        """Create freelancer profile"""
        return await self.repo.create(user_id=user_id, **data)

    async def update_freelancer_profile(
        self, freelancer_id: UUID, **data
    ) -> Freelancer:
        """Update freelancer profile"""
        freelancer = await self.repo.update(freelancer_id, **data)
        if not freelancer:
            raise NotFoundException(
                f"Freelancer with ID {freelancer_id} not found"
            )
        return freelancer

