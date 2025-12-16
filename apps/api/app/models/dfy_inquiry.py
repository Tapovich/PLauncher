"""
Done-For-You Inquiry model
"""

from sqlalchemy import Column, String, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.models.base import Base, TimestampMixin


class DFYInquiry(Base, TimestampMixin):
    """Done-For-You service inquiry model"""

    __tablename__ = "dfy_inquiries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Project details
    project_name = Column(String(255), nullable=False)
    project_description = Column(Text, nullable=False)
    project_type = Column(String(100), nullable=True)
    budget = Column(String(50), nullable=True)
    timeline = Column(String(50), nullable=True)
    stage = Column(String(50), nullable=True)  # idea, planning, development, etc.
    additional_info = Column(Text, nullable=True)
    
    # Status
    status = Column(String(50), default="pending", nullable=False)  # pending, contacted, in_progress, completed, declined
    
    # Contact info from Telegram
    contact_info = Column(JSONB, nullable=True)  # {telegram_id, username, first_name, etc.}
    
    # Relationships
    user = relationship("User")

    def __repr__(self):
        return f"<DFYInquiry(id={self.id}, project_name={self.project_name}, status={self.status})>"


# Indexes
Index("idx_dfy_inquiries_user_id", DFYInquiry.user_id)
Index("idx_dfy_inquiries_status", DFYInquiry.status)
Index("idx_dfy_inquiries_created_at", DFYInquiry.created_at)

