"""
Custom middleware for FastAPI
"""

import time
import uuid
from typing import Callable
from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all incoming requests and responses"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Log request
        start_time = time.time()
        logger.info(
            f"Request started: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else None,
            },
        )

        # Process request
        try:
            response = await call_next(request)
            duration = time.time() - start_time

            # Log response
            logger.info(
                f"Request completed: {request.method} {request.url.path} - {response.status_code}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration": f"{duration:.3f}s",
                },
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            return response

        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "error": str(e),
                    "duration": f"{duration:.3f}s",
                },
                exc_info=True,
            )
            raise


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""

    def __init__(self, app, per_minute: int = None, per_hour: int = None):
        super().__init__(app)
        self.per_minute = per_minute or settings.RATE_LIMIT_PER_MINUTE
        self.per_hour = per_hour or settings.RATE_LIMIT_PER_HOUR
        
        # In-memory storage (use Redis in production)
        self.minute_requests = defaultdict(list)
        self.hour_requests = defaultdict(list)

    def get_client_id(self, request: Request) -> str:
        """Get client identifier (IP or user ID)"""
        # Try to get user ID from request state (set by auth middleware)
        if hasattr(request.state, "user_id"):
            return f"user:{request.state.user_id}"
        
        # Fall back to IP address
        if request.client:
            return f"ip:{request.client.host}"
        
        return "unknown"

    def is_rate_limited(self, client_id: str) -> tuple[bool, str]:
        """Check if client is rate limited"""
        now = datetime.utcnow()
        minute_ago = now - timedelta(minutes=1)
        hour_ago = now - timedelta(hours=1)

        # Clean old requests
        self.minute_requests[client_id] = [
            req_time for req_time in self.minute_requests[client_id] if req_time > minute_ago
        ]
        self.hour_requests[client_id] = [
            req_time for req_time in self.hour_requests[client_id] if req_time > hour_ago
        ]

        # Check limits
        minute_count = len(self.minute_requests[client_id])
        hour_count = len(self.hour_requests[client_id])

        if minute_count >= self.per_minute:
            return True, f"Rate limit exceeded: {self.per_minute} requests per minute"
        
        if hour_count >= self.per_hour:
            return True, f"Rate limit exceeded: {self.per_hour} requests per hour"

        # Record this request
        self.minute_requests[client_id].append(now)
        self.hour_requests[client_id].append(now)

        return False, ""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)

        # Check rate limit
        client_id = self.get_client_id(request)
        is_limited, message = self.is_rate_limited(client_id)

        if is_limited:
            logger.warning(
                f"Rate limit exceeded for {client_id}",
                extra={
                    "client_id": client_id,
                    "path": request.url.path,
                },
            )
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "rate_limit_exceeded",
                    "message": message,
                },
                headers={
                    "Retry-After": "60",
                },
            )

        return await call_next(request)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Global error handling middleware"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except Exception as e:
            logger.error(
                f"Unhandled exception: {str(e)}",
                extra={
                    "request_id": getattr(request.state, "request_id", None),
                    "path": request.url.path,
                    "method": request.method,
                },
                exc_info=True,
            )

            # Don't expose internal errors in production
            if settings.is_production:
                return JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    content={
                        "error": "internal_server_error",
                        "message": "An internal error occurred. Please try again later.",
                    },
                )
            else:
                return JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    content={
                        "error": "internal_server_error",
                        "message": str(e),
                        "type": type(e).__name__,
                    },
                )

