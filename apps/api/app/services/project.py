"""
Project service
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.repositories.project import ProjectRepository
from app.services.base import BaseService
from app.core.exceptions import NotFoundException, ForbiddenException


class ProjectService(BaseService):
    """Project service with business logic"""

    def __init__(self, db: AsyncSession):
        super().__init__(db)
        self.repo = ProjectRepository(db)

    async def get_project(self, project_id: UUID, user_id: Optional[UUID] = None) -> Project:
        """
        Get project by ID with optional ownership check
        
        Args:
            project_id: Project ID to fetch
            user_id: If provided, verify user owns the project
            
        Returns:
            Project instance
            
        Raises:
            NotFoundException: Project not found
            ForbiddenException: User doesn't own the project
        """
        project = await self.repo.get(project_id)
        if not project:
            raise NotFoundException(f"Project with ID {project_id} not found")
        
        # Verify ownership if user_id provided
        if user_id and project.user_id != user_id:
            raise ForbiddenException("You don't have access to this project")
        
        return project

    async def get_user_projects(
        self, 
        user_id: UUID, 
        status: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Project]:
        """
        Get all projects for a user with optional filtering
        
        Args:
            user_id: User ID
            status: Optional status filter
            skip: Pagination offset
            limit: Pagination limit
            
        Returns:
            List of projects
        """
        if status:
            return await self.repo.get_user_projects_by_status(user_id, status)
        return await self.repo.get_by_user(user_id, skip, limit)

    async def create_project(
        self,
        user_id: UUID,
        title: str,
        description: Optional[str] = None,
        **kwargs,
    ) -> Project:
        """
        Create new project
        
        Args:
            user_id: Owner user ID
            title: Project title (required)
            description: Project description
            **kwargs: Additional project fields
            
        Returns:
            Created project
        """
        # Validation
        if not title or len(title.strip()) == 0:
            from app.core.exceptions import BadRequestException
            raise BadRequestException("Project title is required")
        
        if len(title) > 255:
            from app.core.exceptions import BadRequestException
            raise BadRequestException("Project title must be less than 255 characters")
        
        return await self.repo.create(
            user_id=user_id,
            title=title.strip(),
            description=description.strip() if description else None,
            **kwargs,
        )

    async def update_project(
        self, 
        project_id: UUID, 
        user_id: UUID,
        **data
    ) -> Project:
        """
        Update project with ownership check
        
        Args:
            project_id: Project ID to update
            user_id: User ID (for ownership check)
            **data: Fields to update
            
        Returns:
            Updated project
            
        Raises:
            NotFoundException: Project not found
            ForbiddenException: User doesn't own project
        """
        # Verify ownership first
        await self.get_project(project_id, user_id)
        
        # Validate data
        if "title" in data and data["title"]:
            if len(data["title"]) > 255:
                from app.core.exceptions import BadRequestException
                raise BadRequestException("Project title must be less than 255 characters")
            data["title"] = data["title"].strip()
        
        if "description" in data and data["description"]:
            data["description"] = data["description"].strip()
        
        # Update
        project = await self.repo.update(project_id, **data)
        if not project:
            raise NotFoundException(f"Project with ID {project_id} not found")
        
        return project

    async def delete_project(self, project_id: UUID, user_id: UUID) -> bool:
        """
        Delete project with ownership check
        
        Args:
            project_id: Project ID to delete
            user_id: User ID (for ownership check)
            
        Returns:
            True if deleted
            
        Raises:
            NotFoundException: Project not found
            ForbiddenException: User doesn't own project
        """
        # Verify ownership first
        await self.get_project(project_id, user_id)
        
        # Delete
        success = await self.repo.delete(project_id)
        if not success:
            raise NotFoundException(f"Project with ID {project_id} not found")
        
        return success

    async def update_project_status(
        self, project_id: UUID, user_id: UUID, status: str
    ) -> Project:
        """Update project status with ownership check"""
        return await self.update_project(project_id, user_id, status=status)

