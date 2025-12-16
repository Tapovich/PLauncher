"""
AI Service - Business logic for AI features
"""

import json
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.ai_conversation import AIConversation
from app.models.project import Project
from app.services.base import BaseService
from app.services.ai_provider import get_ai_provider, AIProviderError
from app.core.prompts import (
    get_idea_generation_prompt,
    get_tech_spec_generation_prompt,
    get_conversational_prompt,
)
from app.core.logging import get_logger
from app.core.exceptions import NotFoundException, BadRequestException

logger = get_logger(__name__)


class AIService(BaseService):
    """AI service with business logic"""

    def __init__(self, db: AsyncSession):
        super().__init__(db)
        self.ai_provider = get_ai_provider()

    async def create_conversation(
        self, user_id: UUID, project_id: Optional[UUID] = None
    ) -> AIConversation:
        """Create a new AI conversation"""
        conversation = AIConversation(
            user_id=user_id,
            project_id=project_id,
            messages=[],
            context={},
        )
        self.db.add(conversation)
        await self.db.flush()
        await self.db.refresh(conversation)
        return conversation

    async def get_conversation(self, conversation_id: UUID) -> AIConversation:
        """Get conversation by ID"""
        result = await self.db.execute(
            select(AIConversation).where(AIConversation.id == conversation_id)
        )
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            raise NotFoundException(f"Conversation {conversation_id} not found")
        
        return conversation

    async def add_message(
        self,
        conversation_id: UUID,
        role: str,
        content: str,
    ) -> AIConversation:
        """Add message to conversation"""
        conversation = await self.get_conversation(conversation_id)
        
        # Add message to messages array
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        messages = conversation.messages or []
        messages.append(message)
        conversation.messages = messages
        
        await self.db.flush()
        await self.db.refresh(conversation)
        
        return conversation

    async def chat(
        self,
        conversation_id: UUID,
        user_message: str,
    ) -> Dict[str, Any]:
        """
        Continue conversation with AI
        
        Returns:
            {
                "message": str,
                "conversation_id": UUID,
                "should_generate_ideas": bool
            }
        """
        conversation = await self.get_conversation(conversation_id)
        
        # Add user message
        conversation = await self.add_message(conversation_id, "user", user_message)
        
        # Prepare messages for Claude (exclude timestamps)
        claude_messages = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in conversation.messages
            if msg["role"] in ["user", "assistant"]
        ]
        
        # Generate response
        try:
            prompt = get_conversational_prompt(
                conversation.messages[:-1],  # All messages except the one we just added
                user_message,
            )
            
            ai_response = await self.ai_provider.generate_completion(prompt)
            
            # Add AI response to conversation
            conversation = await self.add_message(conversation_id, "assistant", ai_response)
            
            # Check if AI is ready to generate ideas
            should_generate = (
                len(conversation.messages) >= 10  # At least 5 exchanges
                or "generate ideas" in ai_response.lower()
                or "ready to see them" in ai_response.lower()
            )
            
            return {
                "message": ai_response,
                "conversation_id": str(conversation.id),
                "should_generate_ideas": should_generate,
            }
            
        except AIProviderError as e:
            logger.error(f"AI generation failed: {str(e)}")
            raise

    async def generate_ideas(
        self,
        problems: str,
        industries: str,
        budget_range: str,
        timeline: str,
        has_technical_skills: bool,
        user_id: UUID,
    ) -> Dict[str, Any]:
        """
        Generate startup ideas based on user preferences
        
        Returns:
            {
                "ideas": [...],
                "conversation_id": UUID
            }
        """
        try:
            logger.info(f"Generating ideas for user {user_id}")
            
            # Create conversation to store this interaction
            conversation = await self.create_conversation(user_id)
            
            # Store user input in context
            conversation.context = {
                "problems": problems,
                "industries": industries,
                "budget_range": budget_range,
                "timeline": timeline,
                "has_technical_skills": has_technical_skills,
            }
            
            # Generate prompt
            prompt = get_idea_generation_prompt(
                problems, industries, budget_range, timeline, has_technical_skills
            )
            
            # Add to conversation
            await self.add_message(conversation.id, "user", prompt)
            
            # Generate ideas
            response_data = await self.ai_provider.generate_json(prompt)
            
            # Extract ideas from response
            ideas = response_data.get("ideas", [])
            
            if not ideas:
                raise AIProviderError("No ideas generated")
            
            logger.info(f"Generated {len(ideas)} ideas")
            
            # Store AI response
            await self.add_message(
                conversation.id, "assistant", json.dumps(response_data, indent=2)
            )
            
            return {
                "ideas": ideas,
                "conversation_id": str(conversation.id),
            }
            
        except AIProviderError:
            raise
        except Exception as e:
            logger.error(f"Error generating ideas: {str(e)}", exc_info=True)
            raise AIProviderError(f"Failed to generate ideas: {str(e)}")

    async def generate_tech_spec(
        self,
        idea: Dict[str, Any],
        user_id: UUID,
        project_id: Optional[UUID] = None,
    ) -> Dict[str, Any]:
        """
        Generate detailed technical specification for an idea
        
        Returns:
            {
                "spec_markdown": str,
                "sections": [...],
                "conversation_id": UUID
            }
        """
        try:
            logger.info(f"Generating tech spec for idea: {idea.get('title')}")
            
            # Create conversation
            conversation = await self.create_conversation(user_id, project_id)
            
            # Store idea in context
            conversation.context = {"idea": idea}
            
            # Generate prompt
            prompt = get_tech_spec_generation_prompt(idea)
            
            # Add to conversation
            await self.add_message(conversation.id, "user", f"Generate tech spec for: {idea.get('title')}")
            
            # Generate spec
            spec_markdown = await self.ai_provider.generate_markdown(
                prompt, max_tokens=8000
            )
            
            logger.info(f"Generated tech spec: {len(spec_markdown)} characters")
            
            # Store AI response
            await self.add_message(conversation.id, "assistant", spec_markdown)
            
            # Parse sections (basic parsing by # headers)
            sections = self._parse_markdown_sections(spec_markdown)
            
            # Update project if provided
            if project_id:
                result = await self.db.execute(
                    select(Project).where(Project.id == project_id)
                )
                project = result.scalar_one_or_none()
                
                if project:
                    project.ai_generated_spec = {
                        "idea": idea,
                        "spec_markdown": spec_markdown,
                        "sections": sections,
                        "version": "1.0",
                        "generated_at": datetime.utcnow().isoformat(),
                        "conversation_id": str(conversation.id),
                    }
                    project.status = "planning"  # Move from ideation to planning
                    await self.db.flush()
            
            return {
                "spec_markdown": spec_markdown,
                "sections": sections,
                "conversation_id": str(conversation.id),
                "version": "1.0",
                "generated_at": datetime.utcnow().isoformat(),
            }
            
        except AIProviderError:
            raise
        except Exception as e:
            logger.error(f"Error generating tech spec: {str(e)}", exc_info=True)
            raise AIProviderError(f"Failed to generate tech spec: {str(e)}")

    def _parse_markdown_sections(self, markdown: str) -> List[Dict[str, Any]]:
        """Parse markdown into sections by headers"""
        sections = []
        current_section = None
        current_content = []
        
        for line in markdown.split("\n"):
            # Check for header
            if line.startswith("# "):
                # Save previous section
                if current_section:
                    sections.append({
                        "title": current_section,
                        "content": "\n".join(current_content).strip(),
                        "order": len(sections),
                    })
                
                # Start new section
                current_section = line[2:].strip()
                current_content = []
            else:
                current_content.append(line)
        
        # Add last section
        if current_section:
            sections.append({
                "title": current_section,
                "content": "\n".join(current_content).strip(),
                "order": len(sections),
            })
        
        return sections

    async def get_user_conversations(
        self, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[AIConversation]:
        """Get all conversations for a user"""
        result = await self.db.execute(
            select(AIConversation)
            .where(AIConversation.user_id == user_id)
            .order_by(AIConversation.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

