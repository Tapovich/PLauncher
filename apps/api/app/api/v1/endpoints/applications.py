"""
Application endpoints for project applications
"""

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

from app.api.dependencies import get_database, get_current_user
from app.models.user import User
from app.models.application import Application
from app.models.project import Project
from app.models.freelancer import Freelancer
from app.core.logging import get_logger
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = get_logger(__name__)
router = APIRouter()


# Request/Response Models
class ApplicationCreate(BaseModel):
    """Create application"""
    project_id: UUID
    freelancer_id: UUID
    cover_letter: Optional[str] = None
    proposed_rate: Optional[dict] = None  # {amount, currency, type}


class ApplicationUpdate(BaseModel):
    """Update application status"""
    status: str  # pending, accepted, rejected, withdrawn


class ApplicationResponse(BaseModel):
    """Application response"""
    id: UUID
    project_id: UUID
    freelancer_id: UUID
    status: str
    cover_letter: Optional[str]
    proposed_rate: Optional[dict]
    created_at: str

    class Config:
        from_attributes = True


# Valid status transitions
VALID_TRANSITIONS = {
    "pending": ["accepted", "rejected", "withdrawn"],
    "accepted": ["withdrawn"],
    "rejected": [],  # Terminal state
    "withdrawn": [],  # Terminal state
}


@router.post(
    "/",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create application",
)
async def create_application(
    data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """
    Apply to a project or invite a freelancer
    
    **Use Cases:**
    1. Freelancer applies to project
    2. Project owner invites freelancer
    
    **Requires:** JWT access token
    
    **Validation:**
    - Project must exist
    - Freelancer must exist
    - Cannot apply twice to same project
    """
    # Verify project exists
    project_result = await db.execute(
        select(Project).where(Project.id == data.project_id)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise NotFoundException(f"Project {data.project_id} not found")
    
    # Verify freelancer exists
    freelancer_result = await db.execute(
        select(Freelancer).where(Freelancer.id == data.freelancer_id)
    )
    freelancer = freelancer_result.scalar_one_or_none()
    if not freelancer:
        raise NotFoundException(f"Freelancer {data.freelancer_id} not found")
    
    # Check authorization
    # Either: user owns project (inviting) OR user is freelancer (applying)
    is_project_owner = project.user_id == current_user.id
    is_freelancer = freelancer.user_id == current_user.id
    
    if not (is_project_owner or is_freelancer):
        raise ForbiddenException("You cannot create this application")
    
    # Check for duplicate application
    existing_result = await db.execute(
        select(Application).where(
            Application.project_id == data.project_id,
            Application.freelancer_id == data.freelancer_id,
        )
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        raise BadRequestException("Application already exists")
    
    # Create application
    application = Application(
        project_id=data.project_id,
        freelancer_id=data.freelancer_id,
        cover_letter=data.cover_letter,
        proposed_rate=data.proposed_rate,
        status="pending",
    )
    
    db.add(application)
    await db.flush()
    await db.refresh(application)
    
    logger.info(f"Application created: {application.id}")
    return ApplicationResponse.model_validate(application)


@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
    summary="Get application",
)
async def get_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """
    Get application by ID
    
    **Requires:** JWT access token
    
    **Authorization:** Project owner or freelancer can view
    """
    # Get application with project and freelancer
    result = await db.execute(
        select(Application)
        .join(Project)
        .join(Freelancer)
        .where(Application.id == application_id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise NotFoundException(f"Application {application_id} not found")
    
    # Verify authorization
    # Get project and freelancer to check ownership
    project_result = await db.execute(
        select(Project).where(Project.id == application.project_id)
    )
    project = project_result.scalar_one_or_none()
    
    freelancer_result = await db.execute(
        select(Freelancer).where(Freelancer.id == application.freelancer_id)
    )
    freelancer = freelancer_result.scalar_one_or_none()
    
    is_project_owner = project and project.user_id == current_user.id
    is_freelancer = freelancer and freelancer.user_id == current_user.id
    
    if not (is_project_owner or is_freelancer):
        raise ForbiddenException("You don't have access to this application")
    
    return ApplicationResponse.model_validate(application)


@router.put(
    "/{application_id}",
    response_model=ApplicationResponse,
    summary="Update application status",
)
async def update_application_status(
    application_id: UUID,
    data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """
    Update application status (accept/reject/withdraw)
    
    **Status Transitions:**
    - `pending` → `accepted`, `rejected`, `withdrawn`
    - `accepted` → `withdrawn`
    - `rejected` → (no transitions)
    - `withdrawn` → (no transitions)
    
    **Authorization:**
    - Project owner can: accept, reject
    - Freelancer can: withdraw
    
    **Requires:** JWT access token
    """
    # Get application
    result = await db.execute(
        select(Application).where(Application.id == application_id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise NotFoundException(f"Application {application_id} not found")
    
    # Get project and freelancer for authorization
    project_result = await db.execute(
        select(Project).where(Project.id == application.project_id)
    )
    project = project_result.scalar_one_or_none()
    
    freelancer_result = await db.execute(
        select(Freelancer).where(Freelancer.id == application.freelancer_id)
    )
    freelancer = freelancer_result.scalar_one_or_none()
    
    is_project_owner = project and project.user_id == current_user.id
    is_freelancer = freelancer and freelancer.user_id == current_user.id
    
    # Validate authorization based on new status
    if data.status in ["accepted", "rejected"]:
        if not is_project_owner:
            raise ForbiddenException("Only project owner can accept/reject")
    elif data.status == "withdrawn":
        if not is_freelancer:
            raise ForbiddenException("Only freelancer can withdraw")
    else:
        raise BadRequestException(f"Invalid status: {data.status}")
    
    # Validate transition
    current_status = application.status
    allowed_transitions = VALID_TRANSITIONS.get(current_status, [])
    
    if data.status not in allowed_transitions:
        raise BadRequestException(
            f"Cannot transition from '{current_status}' to '{data.status}'. "
            f"Allowed: {', '.join(allowed_transitions) if allowed_transitions else 'none'}"
        )
    
    # Update status
    application.status = data.status
    await db.flush()
    await db.refresh(application)
    
    logger.info(f"Application {application_id} status updated: {current_status} → {data.status}")
    return ApplicationResponse.model_validate(application)


@router.get(
    "/",
    response_model=List[ApplicationResponse],
    summary="List applications",
)
async def list_applications(
    project_id: Optional[UUID] = Query(None, description="Filter by project"),
    freelancer_id: Optional[UUID] = Query(None, description="Filter by freelancer"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """
    List applications
    
    **Filters:**
    - `project_id`: Applications for a specific project
    - `freelancer_id`: Applications by a specific freelancer
    - `status`: Filter by status
    
    **Authorization:**
    - If project_id: must own project
    - If freelancer_id: must own freelancer profile
    - Otherwise: returns user's applications (as owner or freelancer)
    
    **Requires:** JWT access token
    """
    query = select(Application)
    
    # Build filters
    if project_id:
        # Verify ownership
        project_result = await db.execute(
            select(Project).where(Project.id == project_id)
        )
        project = project_result.scalar_one_or_none()
        if not project:
            raise NotFoundException(f"Project {project_id} not found")
        if project.user_id != current_user.id:
            raise ForbiddenException("You don't have access to this project")
        
        query = query.where(Application.project_id == project_id)
    
    elif freelancer_id:
        # Verify ownership
        freelancer_result = await db.execute(
            select(Freelancer).where(Freelancer.id == freelancer_id)
        )
        freelancer = freelancer_result.scalar_one_or_none()
        if not freelancer:
            raise NotFoundException(f"Freelancer {freelancer_id} not found")
        if freelancer.user_id != current_user.id:
            raise ForbiddenException("You don't have access to this freelancer")
        
        query = query.where(Application.freelancer_id == freelancer_id)
    
    else:
        # Return all applications where user is involved
        # Either as project owner or as freelancer
        user_projects_subquery = select(Project.id).where(Project.user_id == current_user.id)
        user_freelancer_subquery = select(Freelancer.id).where(Freelancer.user_id == current_user.id)
        
        query = query.where(
            Application.project_id.in_(user_projects_subquery) |
            Application.freelancer_id.in_(user_freelancer_subquery)
        )
    
    # Add status filter
    if status_filter:
        query = query.where(Application.status == status_filter)
    
    # Execute query
    query = query.order_by(Application.created_at.desc())
    result = await db.execute(query)
    applications = result.scalars().all()
    
    return [ApplicationResponse.model_validate(app) for app in applications]
