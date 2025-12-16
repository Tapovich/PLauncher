"""
AI Conversation model
"""

from sqlalchemy import Column, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.models.base import Base, TimestampMixin


class AIConversation(Base, TimestampMixin):
    """AI Conversation model - stores chat history with Claude"""

    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True
    )
    messages = Column(JSONB, nullable=False, default=list)  # Array of {role, content, timestamp}
    context = Column(JSONB, nullable=True)  # Metadata for AI

    # Relationships
    user = relationship("User", back_populates="ai_conversations")
    project = relationship("Project", back_populates="ai_conversations")

    def __repr__(self):
        return f"<AIConversation(id={self.id}, user_id={self.user_id})>"


# Indexes
Index("idx_ai_conversations_user_id", AIConversation.user_id)
Index("idx_ai_conversations_project_id", AIConversation.project_id)

