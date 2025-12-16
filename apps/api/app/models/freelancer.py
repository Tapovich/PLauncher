"""
Freelancer model
"""

from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey, Index, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid

from app.models.base import Base, TimestampMixin


class Freelancer(Base, TimestampMixin):
    """Freelancer model - developers, designers, PMs, etc."""

    __tablename__ = "freelancers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    role = Column(String(100), nullable=False)  # developer, designer, pm, qa, devops, etc.
    skills = Column(ARRAY(String), nullable=False, default=list)  # Array of skills
    hourly_rate_usd = Column(Integer, nullable=False)
    availability = Column(String(50), nullable=False)  # full-time, part-time, contract
    portfolio_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=False)
    rating = Column(DECIMAL(3, 2), default=0.00)  # 0.00 to 5.00
    projects_completed = Column(Integer, default=0)
    verified = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="freelancer_profile")
    applications = relationship("Application", back_populates="freelancer", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Freelancer(id={self.id}, role={self.role}, rating={self.rating})>"


# Indexes for search performance
Index("idx_freelancers_role", Freelancer.role)
Index("idx_freelancers_skills", Freelancer.skills, postgresql_using="gin")  # GIN index for array search
Index("idx_freelancers_hourly_rate", Freelancer.hourly_rate_usd)
Index("idx_freelancers_availability", Freelancer.availability)
Index("idx_freelancers_verified", Freelancer.verified)
Index("idx_freelancers_rating", Freelancer.rating)

