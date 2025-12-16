"""
Freelancer marketplace endpoints
"""

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from uuid import UUID

from app.api.dependencies import get_freelancer_service, get_current_user, get_current_user_optional
from app.services.freelancer import FreelancerService
from app.models.user import User
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


# Request/Response Models
class FreelancerCreate(BaseModel):
    """Create freelancer profile"""
    role: str  # developer, designer, pm, qa, devops, marketing
    skills: List[str]
    hourly_rate_usd: int
    availability: str  # full-time, part-time, contract
    portfolio_url: Optional[HttpUrl] = None
    bio: str


class FreelancerUpdate(BaseModel):
    """Update freelancer profile"""
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    hourly_rate_usd: Optional[int] = None
    availability: Optional[str] = None
    portfolio_url: Optional[HttpUrl] = None
    bio: Optional[str] = None


class FreelancerResponse(BaseModel):
    """Freelancer response model"""
    id: UUID
    user_id: UUID
    role: str
    skills: List[str]
    hourly_rate_usd: int
    availability: str
    portfolio_url: Optional[str]
    bio: str
    rating: float
    projects_completed: int
    verified: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[FreelancerResponse], summary="Search freelancers")
async def search_freelancers(
    role: Optional[str] = Query(None, description="Filter by role"),
    skills: Optional[str] = Query(None, description="Comma-separated skills"),
    min_rate: Optional[int] = Query(None, ge=0, description="Minimum hourly rate"),
    max_rate: Optional[int] = Query(None, ge=0, description="Maximum hourly rate"),
    availability: Optional[str] = Query(None, description="Availability status"),
    verified_only: bool = Query(False, description="Show only verified"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    freelancer_service: FreelancerService = Depends(get_freelancer_service),
):
    """
    Search for freelancers with filters
    
    **Filters:**
    - `role`: developer, designer, pm, qa, devops, marketing
    - `skills`: Comma-separated (e.g., "React,TypeScript")
    - `min_rate`, `max_rate`: Rate range in USD/hour
    - `availability`: full-time, part-time, contract
    - `verified_only`: Show only verified freelancers
    
    **Sorting:** By rating DESC, projects_completed DESC
    
    **Indexed fields:** role, skills (GIN), hourly_rate, availability, verified, rating
    """
    # Parse skills from comma-separated string
    skills_list = [s.strip() for s in skills.split(",")] if skills else None

    freelancers = await freelancer_service.search_freelancers(
        role=role,
        skills=skills_list,
        min_rate=min_rate,
        max_rate=max_rate,
        availability=availability,
        verified_only=verified_only,
        skip=skip,
        limit=limit,
    )
    
    logger.info(f"Search returned {len(freelancers)} freelancers")
    return freelancers


@router.get(
    "/top",
    response_model=List[FreelancerResponse],
    summary="Get top rated freelancers",
)
async def get_top_freelancers(
    limit: int = Query(10, ge=1, le=50),
    freelancer_service: FreelancerService = Depends(get_freelancer_service),
):
    """Get top rated verified freelancers"""
    freelancers = await freelancer_service.get_top_freelancers(limit=limit)
    return freelancers


@router.get(
    "/{freelancer_id}",
    response_model=FreelancerResponse,
    summary="Get freelancer profile",
)
async def get_freelancer(
    freelancer_id: UUID,
    freelancer_service: FreelancerService = Depends(get_freelancer_service),
):
    """
    Get freelancer profile by ID
    
    Public endpoint - no authentication required
    """
    freelancer = await freelancer_service.get_freelancer(freelancer_id)
    return freelancer


@router.post(
    "/",
    response_model=FreelancerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create freelancer profile",
)
async def create_freelancer_profile(
    data: FreelancerCreate,
    current_user: User = Depends(get_current_user),
    freelancer_service: FreelancerService = Depends(get_freelancer_service),
):
    """
    Create freelancer profile for current user
    
    **Required Fields:**
    - `role`: developer, designer, pm, qa, devops, marketing
    - `skills`: Array of skills (min 1)
    - `hourly_rate_usd`: Rate in USD (must be > 0)
    - `availability`: full-time, part-time, contract
    - `bio`: Professional bio (min 50 chars)
    
    **Requires:** JWT access token
    
    **Note:** One freelancer profile per user
    """
    # Validation
    if not data.skills or len(data.skills) == 0:
        from app.core.exceptions import BadRequestException
        raise BadRequestException("At least one skill is required")
    
    if data.hourly_rate_usd <= 0:
        from app.core.exceptions import BadRequestException
        raise BadRequestException("Hourly rate must be greater than 0")
    
    if len(data.bio) < 50:
        from app.core.exceptions import BadRequestException
        raise BadRequestException("Bio must be at least 50 characters")
    
    freelancer = await freelancer_service.create_freelancer_profile(
        user_id=current_user.id,
        **data.model_dump()
    )
    
    return freelancer


@router.put(
    "/{freelancer_id}",
    response_model=FreelancerResponse,
    summary="Update freelancer profile",
)
async def update_freelancer_profile(
    freelancer_id: UUID,
    data: FreelancerUpdate,
    current_user: User = Depends(get_current_user),
    freelancer_service: FreelancerService = Depends(get_freelancer_service),
):
    """
    Update freelancer profile
    
    **Requires:** JWT access token
    
    **Ownership:** Can only update your own profile
    """
    # Verify ownership
    freelancer = await freelancer_service.get_freelancer(freelancer_id)
    if freelancer.user_id != current_user.id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("You can only update your own profile")
    
    # Validate updates
    if data.skills is not None and len(data.skills) == 0:
        from app.core.exceptions import BadRequestException
        raise BadRequestException("At least one skill is required")
    
    if data.hourly_rate_usd is not None and data.hourly_rate_usd <= 0:
        from app.core.exceptions import BadRequestException
        raise BadRequestException("Hourly rate must be greater than 0")
    
    updated_freelancer = await freelancer_service.update_freelancer_profile(
        freelancer_id,
        **data.model_dump(exclude_unset=True)
    )
    
    return updated_freelancer

