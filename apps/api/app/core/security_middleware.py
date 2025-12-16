"""
Security middleware and utilities
"""

import re
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses
    
    Headers added:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block
    - Strict-Transport-Security: max-age=31536000 (HTTPS only)
    - Content-Security-Policy: Basic policy
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # HTTPS-only in production
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        # Basic CSP
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:;"
        )
        
        # Remove server header
        if "Server" in response.headers:
            del response.headers["Server"]

        return response


def sanitize_input(text: str, max_length: int = 10000) -> str:
    """
    Sanitize user input
    
    - Removes control characters
    - Limits length
    - Strips whitespace
    - Removes null bytes
    
    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Remove null bytes
    text = text.replace("\x00", "")
    
    # Remove other control characters (except newlines, tabs)
    text = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', text)
    
    # Limit length
    if len(text) > max_length:
        text = text[:max_length]
    
    # Strip whitespace
    text = text.strip()
    
    return text


def sanitize_html(text: str) -> str:
    """
    Basic HTML sanitization
    
    Removes potentially dangerous HTML tags and attributes.
    For production, use bleach library for comprehensive sanitization.
    
    Args:
        text: Text that might contain HTML
        
    Returns:
        Sanitized text
    """
    # Remove script tags
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove iframe tags
    text = re.sub(r'<iframe[^>]*>.*?</iframe>', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove on* event handlers
    text = re.sub(r'\son\w+\s*=\s*["\'][^"\']*["\']', '', text, flags=re.IGNORECASE)
    
    # Remove javascript: protocol
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
    
    return text


def validate_uuid(value: str) -> bool:
    """
    Validate UUID format
    
    Prevents UUID enumeration attacks by validating format
    before database queries.
    """
    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    return bool(uuid_pattern.match(value))


def is_safe_redirect(url: str, allowed_domains: list = None) -> bool:
    """
    Validate redirect URL to prevent open redirect vulnerabilities
    
    Args:
        url: URL to validate
        allowed_domains: List of allowed domains
        
    Returns:
        True if URL is safe to redirect to
    """
    if not url:
        return False
    
    # Check for javascript: or data: protocols
    if url.startswith(('javascript:', 'data:', 'vbscript:')):
        return False
    
    # Check for double slashes (protocol-relative URL)
    if url.startswith('//'):
        return False
    
    # If allowed_domains specified, validate domain
    if allowed_domains:
        from urllib.parse import urlparse
        try:
            parsed = urlparse(url)
            if parsed.netloc and parsed.netloc not in allowed_domains:
                return False
        except Exception:
            return False
    
    return True


# CSRF Token configuration (for web interface if needed)
# Currently using JWT tokens which are CSRF-safe for API-only access
# If adding cookie-based auth later, implement CSRF tokens

CSRF_CONFIG = {
    "enabled": False,  # Enable when adding cookie-based auth
    "cookie_name": "csrf_token",
    "header_name": "X-CSRF-Token",
    "cookie_secure": True,  # HTTPS only
    "cookie_httponly": True,
    "cookie_samesite": "strict",
}

