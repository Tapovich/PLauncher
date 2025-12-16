"""
Sentry integration for error tracking and monitoring
"""

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.logging import LoggingIntegration

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def init_sentry():
    """
    Initialize Sentry SDK
    
    Features:
    - Error tracking
    - Performance monitoring
    - Request correlation
    - SQL query tracking
    - User context
    """
    if not settings.SENTRY_DSN:
        logger.info("Sentry DSN not configured - error tracking disabled")
        return
    
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        
        # Environment
        environment=settings.ENVIRONMENT,
        release=f"{settings.APP_NAME}@{settings.APP_VERSION}",
        
        # Performance monitoring
        traces_sample_rate=1.0 if settings.is_development else 0.1,
        profiles_sample_rate=1.0 if settings.is_development else 0.1,
        
        # Integrations
        integrations=[
            FastApiIntegration(
                transaction_style="endpoint",  # Group by endpoint
            ),
            SqlalchemyIntegration(),
            LoggingIntegration(
                level=None,  # Capture all logs
                event_level="ERROR",  # Send ERROR+ to Sentry
            ),
        ],
        
        # Additional options
        attach_stacktrace=True,
        send_default_pii=False,  # Don't send PII automatically
        max_breadcrumbs=50,
        
        # Filter sensitive data
        before_send=filter_sensitive_data,
    )
    
    logger.info(f"Sentry initialized: {settings.ENVIRONMENT}")


def filter_sensitive_data(event, hint):
    """
    Filter sensitive data before sending to Sentry
    
    Removes:
    - Authorization headers
    - Password fields
    - API keys
    - Personal information
    """
    # Remove sensitive headers
    if "request" in event and "headers" in event["request"]:
        sensitive_headers = ["authorization", "cookie", "x-api-key"]
        headers = event["request"]["headers"]
        
        for header in sensitive_headers:
            if header in headers:
                headers[header] = "[Filtered]"
    
    # Remove sensitive query parameters
    if "request" in event and "query_string" in event["request"]:
        query = event["request"]["query_string"]
        if any(key in query.lower() for key in ["token", "key", "password"]):
            event["request"]["query_string"] = "[Filtered]"
    
    # Remove sensitive body fields
    if "request" in event and "data" in event["request"]:
        sensitive_fields = ["password", "password_hash", "api_key", "secret"]
        data = event["request"]["data"]
        
        if isinstance(data, dict):
            for field in sensitive_fields:
                if field in data:
                    data[field] = "[Filtered]"
    
    return event


def set_user_context(user_id: str, email: str = None, username: str = None):
    """
    Set user context for Sentry events
    
    Args:
        user_id: User ID
        email: User email (optional)
        username: Username (optional)
    """
    sentry_sdk.set_user({
        "id": user_id,
        "email": email,
        "username": username,
    })


def add_breadcrumb(message: str, category: str = "info", level: str = "info", data: dict = None):
    """
    Add breadcrumb for debugging
    
    Breadcrumbs help trace the path leading to an error
    """
    sentry_sdk.add_breadcrumb(
        message=message,
        category=category,
        level=level,
        data=data or {},
    )


def capture_exception(exception: Exception, context: dict = None):
    """
    Manually capture exception
    
    Args:
        exception: Exception to capture
        context: Additional context data
    """
    if context:
        sentry_sdk.set_context("custom", context)
    
    sentry_sdk.capture_exception(exception)


def capture_message(message: str, level: str = "info", context: dict = None):
    """
    Capture message (not an exception)
    
    Useful for logging important events
    """
    if context:
        sentry_sdk.set_context("custom", context)
    
    sentry_sdk.capture_message(message, level)

