"""
API v1 Router
Aggregates all API endpoints with proper tags
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, projects, ai, freelancers, exports, applications, dfy


api_router = APIRouter()

# Include all routers with proper tags
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

api_router.include_router(
    projects.router,
    prefix="/projects",
    tags=["Projects"],
)

api_router.include_router(
    ai.router,
    prefix="/ai",
    tags=["AI"],
)

api_router.include_router(
    freelancers.router,
    prefix="/freelancers",
    tags=["Freelancers"],
)

api_router.include_router(
    applications.router,
    prefix="/applications",
    tags=["Applications"],
)

api_router.include_router(
    dfy.router,
    prefix="/dfy",
    tags=["Done-For-You"],
)

api_router.include_router(
    exports.router,
    prefix="/exports",
    tags=["Exports"],
)

