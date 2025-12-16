"""
User model
"""

from sqlalchemy import Column, String, BigInteger, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """User model - for both entrepreneurs and freelancers"""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=True, index=True)
    telegram_id = Column(BigInteger, unique=True, nullable=True, index=True)
    full_name = Column(String(255), nullable=False)
    plan = Column(String(50), default="free", nullable=False)  # free, pro, enterprise
    password_hash = Column(String(255), nullable=True)  # For email auth

    # Relationships
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    freelancer_profile = relationship(
        "Freelancer", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    ai_conversations = relationship(
        "AIConversation", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, telegram_id={self.telegram_id})>"


# Indexes
Index("idx_users_email", User.email)
Index("idx_users_telegram_id", User.telegram_id)

