"""
Custom exceptions
"""

from typing import Any, Optional


class LaunchKitException(Exception):
    """Base exception for LaunchKit API"""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Optional[Any] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or "internal_error"
        self.details = details
        super().__init__(self.message)


class NotFoundException(LaunchKitException):
    """Resource not found exception"""

    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=404,
            error_code="not_found",
            details=details,
        )


class UnauthorizedException(LaunchKitException):
    """Unauthorized exception"""

    def __init__(self, message: str = "Unauthorized", details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=401,
            error_code="unauthorized",
            details=details,
        )


class ForbiddenException(LaunchKitException):
    """Forbidden exception"""

    def __init__(self, message: str = "Forbidden", details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=403,
            error_code="forbidden",
            details=details,
        )


class BadRequestException(LaunchKitException):
    """Bad request exception"""

    def __init__(self, message: str = "Bad request", details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=400,
            error_code="bad_request",
            details=details,
        )


class ConflictException(LaunchKitException):
    """Conflict exception"""

    def __init__(self, message: str = "Conflict", details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=409,
            error_code="conflict",
            details=details,
        )


class ValidationException(LaunchKitException):
    """Validation exception"""

    def __init__(self, message: str = "Validation error", details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=422,
            error_code="validation_error",
            details=details,
        )

