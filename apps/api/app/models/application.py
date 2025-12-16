"""
Application model
"""

from sqlalchemy import Column, String, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.models.base import Base, TimestampMixin


class Application(Base, TimestampMixin):
    """Application model - freelancer applications to projects"""

    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    freelancer_id = Column(
        UUID(as_uuid=True), ForeignKey("freelancers.id", ondelete="CASCADE"), nullable=False
    )
    status = Column(
        String(50), default="pending", nullable=False
    )  # pending, accepted, rejected, withdrawn
    cover_letter = Column(Text, nullable=True)
    proposed_rate = Column(JSONB, nullable=True)  # {amount, currency, type: hourly/fixed}
    details = Column(JSONB, nullable=True)  # Additional application details

    # Relationships
    project = relationship("Project", back_populates="applications")
    freelancer = relationship("Freelancer", back_populates="applications")

    def __repr__(self):
        return f"<Application(id={self.id}, project_id={self.project_id}, status={self.status})>"


# Indexes
Index("idx_applications_project_id", Application.project_id)
Index("idx_applications_freelancer_id", Application.freelancer_id)
Index("idx_applications_status", Application.status)
Index("idx_applications_project_status", Application.project_id, Application.status)

