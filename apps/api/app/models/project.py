"""
Project model
"""

from sqlalchemy import Column, String, Text, Integer, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.models.base import Base, TimestampMixin


class Project(Base, TimestampMixin):
    """Project model - user's startup projects"""

    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        String(50), default="ideation", nullable=False
    )  # ideation, planning, hiring, development, launched
    ai_generated_spec = Column(JSONB, nullable=True)  # Full tech spec from AI
    budget_min = Column(Integer, nullable=True)
    budget_max = Column(Integer, nullable=True)
    timeline_weeks = Column(Integer, nullable=True)

    # Relationships
    user = relationship("User", back_populates="projects")
    ai_conversations = relationship(
        "AIConversation", back_populates="project", cascade="all, delete-orphan"
    )
    applications = relationship("Application", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project(id={self.id}, title={self.title}, status={self.status})>"


# Indexes
Index("idx_projects_user_id", Project.user_id)
Index("idx_projects_status", Project.status)
Index("idx_projects_user_status", Project.user_id, Project.status)

