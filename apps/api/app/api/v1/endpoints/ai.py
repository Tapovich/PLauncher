"""
AI endpoints for idea generation and tech specs
"""

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from app.api.dependencies import get_database, get_current_user
from app.services.ai_service import AIService
from app.models.user import User
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


# Request/Response Models
class ChatRequest(BaseModel):
    """Chat message request"""
    conversation_id: Optional[UUID] = None
    message: str


class ChatResponse(BaseModel):
    """Chat response"""
    message: str
    conversation_id: UUID
    should_generate_ideas: bool


class IdeaGenerationRequest(BaseModel):
    """Idea generation request"""
    problems: str
    industries: str
    budget_range: str
    timeline: str
    has_technical_skills: bool


class IdeaResponse(BaseModel):
    """Single idea response"""
    title: str
    one_liner: str
    problem_statement: str
    solution_overview: str
    target_market: str
    revenue_model: str
    mvp_features: List[str]
    estimated_cost: int
    timeline_months: int


class IdeasResponse(BaseModel):
    """Multiple ideas response"""
    ideas: List[IdeaResponse]
    conversation_id: UUID


class TechSpecRequest(BaseModel):
    """Tech spec generation request"""
    idea: Dict[str, Any]
    project_id: Optional[UUID] = None


class TechSpecSection(BaseModel):
    """Tech spec section"""
    title: str
    content: str
    order: int


class TechSpecResponse(BaseModel):
    """Tech spec response"""
    spec_markdown: str
    sections: List[TechSpecSection]
    conversation_id: UUID


class ConversationResponse(BaseModel):
    """Conversation response"""
    id: UUID
    user_id: UUID
    project_id: Optional[UUID]
    messages: List[Dict[str, Any]]
    created_at: str

    class Config:
        from_attributes = True


@router.post("/chat", response_model=ChatResponse, summary="Chat with AI")
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
):
    """
    Continue conversation with AI for idea discovery
    
    If conversation_id is not provided, a new conversation is created.
    AI asks questions to understand user's needs before generating ideas.
    
    **Requires:** JWT access token
    """
    ai_service = AIService(db)
    
    # Create or get conversation
    if request.conversation_id:
        conversation_id = request.conversation_id
    else:
        conversation = await ai_service.create_conversation(current_user.id)
        conversation_id = conversation.id
    
    # Chat with AI
    result = await ai_service.chat(conversation_id, request.message)
    
    return ChatResponse(**result)


@router.post(
    "/generate-ideas",
    response_model=IdeasResponse,
    summary="Generate startup ideas",
)
async def generate_ideas(
    request: IdeaGenerationRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
):
    """
    Generate 3-5 startup ideas based on user preferences
    
    Uses Claude AI to analyze requirements and generate tailored ideas.
    Each idea includes:
    - Title and tagline
    - Problem/solution
    - Target market
    - Revenue model
    - MVP features
    - Cost and timeline estimates
    
    **Requires:** JWT access token
    **Rate Limited:** 10 requests per hour per user
    """
    ai_service = AIService(db)
    
    result = await ai_service.generate_ideas(
        problems=request.problems,
        industries=request.industries,
        budget_range=request.budget_range,
        timeline=request.timeline,
        has_technical_skills=request.has_technical_skills,
        user_id=current_user.id,
    )
    
    return IdeasResponse(**result)


@router.post(
    "/generate-spec",
    response_model=TechSpecResponse,
    summary="Generate technical specification",
)
async def generate_tech_spec(
    request: TechSpecRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
):
    """
    Generate detailed technical specification for a startup idea
    
    Creates a comprehensive 10-15 page tech spec with:
    - Product overview
    - Feature specifications
    - Technical architecture
    - Technology stack recommendations
    - Development timeline
    - Budget breakdown
    - Team requirements
    - Risk analysis
    
    **Requires:** JWT access token
    **Rate Limited:** 5 requests per hour per user
    **Duration:** ~15-30 seconds (target: <30s)
    **Output:** Markdown stored in projects.ai_generated_spec
    
    The spec is stored with:
    - version: "1.0"
    - timestamp: ISO datetime
    - markdown: Full specification
    - sections: Parsed section array
    """
    ai_service = AIService(db)
    
    result = await ai_service.generate_tech_spec(
        idea=request.idea,
        user_id=current_user.id,
        project_id=request.project_id,
    )
    
    # Add version and timestamp to response
    result["version"] = "1.0"
    result["generated_at"] = datetime.utcnow().isoformat()
    
    return TechSpecResponse(**result)


class TechSpecGetResponse(BaseModel):
    """Get stored tech spec response"""
    project_id: UUID
    spec_markdown: str
    sections: List[TechSpecSection]
    version: str
    generated_at: str


@router.get(
    "/spec/{project_id}",
    response_model=TechSpecGetResponse,
    summary="Get project tech spec",
)
async def get_project_tech_spec(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
):
    """
    Get stored technical specification for a project
    
    Retrieves the previously generated tech spec from the database.
    
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
    
    spec_data = project.ai_generated_spec
    
    return TechSpecGetResponse(
        project_id=project.id,
        spec_markdown=spec_data.get("spec_markdown", ""),
        sections=spec_data.get("sections", []),
        version=spec_data.get("version", "1.0"),
        generated_at=spec_data.get("generated_at", project.created_at.isoformat()),
    )


@router.get(
    "/conversations/{conversation_id}",
    response_model=ConversationResponse,
    summary="Get conversation history",
)
async def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
):
    """
    Get conversation history by ID
    
    Returns all messages in the conversation.
    
    **Requires:** JWT access token
    """
    ai_service = AIService(db)
    conversation = await ai_service.get_conversation(conversation_id)
    
    # Verify ownership
    if conversation.user_id != current_user.id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("You don't have access to this conversation")
    
    return ConversationResponse.model_validate(conversation)


@router.get(
    "/conversations",
    response_model=List[ConversationResponse],
    summary="List user conversations",
)
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database),
):
    """
    List all AI conversations for current user
    
    **Requires:** JWT access token
    """
    ai_service = AIService(db)
    conversations = await ai_service.get_user_conversations(current_user.id)
    
    return [ConversationResponse.model_validate(conv) for conv in conversations]

