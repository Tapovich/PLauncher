"""Services package"""

from app.services.user import UserService
from app.services.project import ProjectService
from app.services.freelancer import FreelancerService
from app.services.ai_service import AIService
from app.services.ai_provider import AIProvider, get_ai_provider

__all__ = [
    "UserService",
    "ProjectService",
    "FreelancerService",
    "AIService",
    "AIProvider",
    "get_ai_provider",
]

