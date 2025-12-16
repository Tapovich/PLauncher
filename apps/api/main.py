"""
LaunchKit AI - FastAPI Backend
Main application entry point
"""

from contextlib import asynccontextmanager
import uvicorn

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.middleware import (
    RequestLoggingMiddleware,
    RateLimitMiddleware,
    ErrorHandlerMiddleware,
)
from app.core.security_middleware import SecurityHeadersMiddleware
from app.core.exceptions import LaunchKitException
from app.core.sentry import init_sentry
from app.db.session import init_db, close_db
from app.api.v1 import api_router

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Setup Sentry (error tracking)
init_sentry()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 LaunchKit AI API starting...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"API URL: http://{settings.HOST}:{settings.PORT}")
    
    # Initialize database (don't fail startup if DB is unavailable)
    try:
        await init_db()
        logger.info("✅ Database connection established")
    except Exception as e:
        logger.warning(f"⚠️  Database initialization failed: {str(e)}")
        logger.warning("🚨 API will start without database - some features may not work")
        # Don't raise - allow API to start without DB
    
    yield
    
    # Shutdown
    logger.info("🛑 LaunchKit AI API shutting down...")
    await close_db()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered platform for entrepreneurs to build and launch startups",
    version=settings.APP_VERSION,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
    swagger_ui_parameters={
        "persistAuthorization": True,
    },
    openapi_tags=[
        {
            "name": "Health",
            "description": "Health check and status endpoints",
        },
        {
            "name": "Authentication",
            "description": "User authentication and authorization",
        },
        {
            "name": "Users",
            "description": "User management operations",
        },
        {
            "name": "Projects",
            "description": "Project management and CRUD operations",
        },
        {
            "name": "AI",
            "description": "AI-powered idea generation and tech specs",
        },
        {
            "name": "Freelancers",
            "description": "Freelancer marketplace and search",
        },
        {
            "name": "Applications",
            "description": "Project application management",
        },
        {
            "name": "Payments",
            "description": "Payment processing and subscriptions",
        },
        {
            "name": "Done-For-You",
            "description": "Full-service launch support",
        },
    ],
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# Custom middleware (order matters - first added = last executed)
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)


# Exception handlers
@app.exception_handler(LaunchKitException)
async def launchkit_exception_handler(request: Request, exc: LaunchKitException):
    """Handle custom LaunchKit exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "validation_error",
            "message": "Request validation failed",
            "details": exc.errors(),
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "http_error",
            "message": exc.detail,
        },
    )


# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint"""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if not settings.is_production else None,
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    
    Returns detailed health status of all services
    """
    health_status = {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "components": {
            "api": "healthy",
            "database": "healthy",  # TODO: Add actual DB check
            "redis": "unknown",  # TODO: Add actual Redis check
        },
    }
    
    return health_status


@app.get("/health/live", tags=["Health"])
async def liveness():
    """Kubernetes liveness probe"""
    return {"status": "alive"}


@app.get("/health/ready", tags=["Health"])
async def readiness():
    """Kubernetes readiness probe"""
    # TODO: Check database connection
    return {"status": "ready"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower(),
    )

