"""
Project management endpoints
"""

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.api.dependencies import get_project_service, get_current_user
from app.services.project import ProjectService
from app.models.user import User

router = APIRouter()


class ProjectCreate(BaseModel):
    """Project creation model"""

    title: str
    description: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    timeline_weeks: Optional[int] = None


class ProjectUpdate(BaseModel):
    """Project update model"""

    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    timeline_weeks: Optional[int] = None


class ProjectResponse(BaseModel):
    """Project response model"""

    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    status: str
    budget_min: Optional[int]
    budget_max: Optional[int]
    timeline_weeks: Optional[int]
    created_at: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ProjectResponse], summary="List user projects")
async def list_projects(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by project status"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=100, description="Pagination limit"),
    current_user: User = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service),
):
    """
    List all projects for current user
    
    **Query Parameters:**
    - `status`: Filter by status (ideation, planning, hiring, development, launched)
    - `skip`: Pagination offset (default: 0)
    - `limit`: Pagination limit (default: 100, max: 100)
    
    **Requires:** JWT access token
    
    **Returns:** List of user's projects, most recent first
    """
    projects = await project_service.get_user_projects(
        user_id=current_user.id,
        status=status_filter,
        skip=skip,
        limit=limit
    )
    return [ProjectResponse.model_validate(p) for p in projects]


@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create project",
)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service),
):
    """
    Create a new project
    
    **Required Fields:**
    - `title`: Project name (1-255 characters)
    
    **Optional Fields:**
    - `description`: Project description
    - `budget_min`: Minimum budget in USD
    - `budget_max`: Maximum budget in USD
    - `timeline_weeks`: Estimated timeline in weeks
    
    **Requires:** JWT access token
    
    **Returns:** Created project with status='ideation'
    """
    new_project = await project_service.create_project(
        user_id=current_user.id,
        **project.model_dump(exclude_unset=True)
    )
    return ProjectResponse.model_validate(new_project)


@router.get("/{project_id}", response_model=ProjectResponse, summary="Get project")
async def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service),
):
    """
    Get project by ID
    
    **Requires:** JWT access token
    
    **Ownership:** Only project owner can access
    
    **Returns:** Project details
    """
    project = await project_service.get_project(project_id, current_user.id)
    return ProjectResponse.model_validate(project)


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update project (full)",
)
async def put_project(
    project_id: UUID,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service),
):
    """
    Update project (PUT - full update)
    
    Updates all provided fields. Use PATCH for partial updates.
    
    **Requires:** JWT access token
    
    **Ownership:** Only project owner can update
    """
    project = await project_service.update_project(
        project_id,
        current_user.id,
        **data.model_dump(exclude_unset=True)
    )
    return ProjectResponse.model_validate(project)


@router.patch(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update project (partial)",
)
async def patch_project(
    project_id: UUID,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service),
):
    """
    Update project (PATCH - partial update)
    
    Updates only the provided fields, leaves others unchanged.
    
    **Updatable Fields:**
    - `title`: Project name
    - `description`: Project description
    - `status`: Project status (ideation, planning, hiring, development, launched)
    - `budget_min`, `budget_max`: Budget range
    - `timeline_weeks`: Timeline estimate
    
    **Requires:** JWT access token
    
    **Ownership:** Only project owner can update
    """
    project = await project_service.update_project(
        project_id,
        current_user.id,
        **data.model_dump(exclude_unset=True)
    )
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete project")
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service),
):
    """
    Delete project
    
    **Requires:** JWT access token
    
    **Ownership:** Only project owner can delete
    
    **Warning:** This action cannot be undone. All related data
    (conversations, applications) will also be deleted (CASCADE).
    """
    await project_service.delete_project(project_id, current_user.id)
    return None


class DraftProjectRequest(BaseModel):
    """Draft project creation from idea"""

    idea: dict
    conversation_id: Optional[UUID] = None


@router.post("/draft", response_model=ProjectResponse, summary="Create draft project")
async def create_draft_project(
    data: DraftProjectRequest,
    current_user: User = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service),
):
    """
    Create a draft project from selected idea
    
    Saves the selected idea as a draft project with status='ideation'.
    This allows tracking which idea the user selected before generating the tech spec.
    
    **Requires:** JWT access token
    """
    idea = data.idea
    
    # Create draft project
    project = await project_service.create_project(
        user_id=current_user.id,
        title=idea.get("title", "Untitled Project"),
        description=idea.get("one_liner", ""),
        status="ideation",
        budget_min=int(idea.get("estimated_cost", 0) * 0.8),  # 80% of estimate
        budget_max=int(idea.get("estimated_cost", 0) * 1.2),  # 120% of estimate
        timeline_weeks=idea.get("timeline_months", 3) * 4,  # Convert months to weeks
        ai_generated_spec={
            "idea": idea,
            "conversation_id": str(data.conversation_id) if data.conversation_id else None,
            "status": "draft",
            "created_at": datetime.utcnow().isoformat(),
        },
    )
    
    return ProjectResponse.model_validate(project)

