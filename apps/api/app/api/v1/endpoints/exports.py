"""
Export endpoints for PDF generation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from uuid import UUID

from app.api.dependencies import get_database, get_current_user
from app.models.user import User
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get(
    "/projects/{project_id}/pdf",
    summary="Export tech spec as PDF",
    response_class=Response,
)
async def export_project_pdf(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
):
    """
    Export project tech spec as PDF
    
    Generates a professionally formatted PDF from the Markdown tech spec.
    
    **Requires:** JWT access token
    
    **TODO:** Implement PDF generation
    - Use: weasyprint, pdfkit, or external service (DocRaptor)
    - Template: Professional tech spec layout
    - Include: Company branding, page numbers, TOC
    """
    from sqlalchemy import select
    from app.models.project import Project
    
    # Get project
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        from app.core.exceptions import NotFoundException
        raise NotFoundException(f"Project {project_id} not found")
    
    # Verify ownership
    if project.user_id != current_user.id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("You don't have access to this project")
    
    # Check if spec exists
    if not project.ai_generated_spec or "spec_markdown" not in project.ai_generated_spec:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Tech spec not generated for this project")
    
    # TODO: Generate PDF from markdown
    # For now, return 501
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="PDF export not implemented yet. Coming soon!",
    )


@router.get(
    "/projects/{project_id}/markdown",
    summary="Export tech spec as Markdown",
)
async def export_project_markdown(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
):
    """
    Export project tech spec as Markdown
    
    Returns the raw Markdown content for download or preview.
    
    **Requires:** JWT access token
    """
    from sqlalchemy import select
    from app.models.project import Project
    
    # Get project
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        from app.core.exceptions import NotFoundException
        raise NotFoundException(f"Project {project_id} not found")
    
    # Verify ownership
    if project.user_id != current_user.id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("You don't have access to this project")
    
    # Check if spec exists
    if not project.ai_generated_spec or "spec_markdown" not in project.ai_generated_spec:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Tech spec not generated for this project")
    
    markdown = project.ai_generated_spec["spec_markdown"]
    filename = f"{project.title.replace(' ', '_')}_TechSpec.md"
    
    return Response(
        content=markdown,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )

