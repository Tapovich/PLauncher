"""
Telegram WebApp authentication utilities
"""

import hmac
import hashlib
from urllib.parse import parse_qs, unquote
from typing import Dict, Optional
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.exceptions import UnauthorizedException
from app.core.logging import get_logger

logger = get_logger(__name__)


def verify_telegram_init_data(init_data: str, bot_token: Optional[str] = None) -> Dict[str, str]:
    """
    Verify Telegram WebApp initData
    
    Args:
        init_data: The initData string from Telegram WebApp
        bot_token: Bot token (uses settings if not provided)
        
    Returns:
        Parsed and verified data as dictionary
        
    Raises:
        UnauthorizedException: If verification fails
    """
    if not bot_token:
        bot_token = settings.TELEGRAM_BOT_TOKEN
    
    if not bot_token:
        raise UnauthorizedException("Telegram bot token not configured")
    
    try:
        # Parse the init data
        parsed_data = parse_qs(init_data)
        
        # Extract hash
        received_hash = parsed_data.get("hash", [None])[0]
        if not received_hash:
            raise UnauthorizedException("Missing hash in initData")
        
        # Remove hash from data for verification
        data_check_string_parts = []
        for key in sorted(parsed_data.keys()):
            if key == "hash":
                continue
            value = parsed_data[key][0]
            data_check_string_parts.append(f"{key}={value}")
        
        data_check_string = "\n".join(data_check_string_parts)
        
        # Calculate secret key
        secret_key = hmac.new(
            "WebAppData".encode(),
            bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Verify hash
        if not hmac.compare_digest(calculated_hash, received_hash):
            logger.warning("Telegram initData hash verification failed")
            raise UnauthorizedException("Invalid Telegram authentication data")
        
        # Check auth_date (should be recent, within 24 hours)
        auth_date = parsed_data.get("auth_date", [None])[0]
        if auth_date:
            try:
                auth_timestamp = int(auth_date)
                auth_datetime = datetime.fromtimestamp(auth_timestamp)
                age = datetime.utcnow() - auth_datetime
                
                if age > timedelta(hours=24):
                    raise UnauthorizedException("Telegram authentication data expired")
            except (ValueError, TypeError):
                logger.warning("Invalid auth_date in initData")
        
        # Return parsed data as dict
        result = {}
        for key, value in parsed_data.items():
            if key != "hash":
                result[key] = unquote(value[0])
        
        logger.info("Telegram initData verified successfully")
        return result
        
    except UnauthorizedException:
        raise
    except Exception as e:
        logger.error(f"Error verifying Telegram initData: {str(e)}", exc_info=True)
        raise UnauthorizedException(f"Failed to verify Telegram data: {str(e)}")


def parse_telegram_user(init_data_result: Dict[str, str]) -> Dict[str, any]:
    """
    Parse Telegram user data from verified initData
    
    Args:
        init_data_result: Verified initData dictionary
        
    Returns:
        User data dictionary
    """
    import json
    
    # Parse user JSON if present
    user_json = init_data_result.get("user")
    if user_json:
        try:
            user_data = json.loads(user_json)
            return {
                "telegram_id": user_data.get("id"),
                "first_name": user_data.get("first_name", ""),
                "last_name": user_data.get("last_name", ""),
                "username": user_data.get("username"),
                "language_code": user_data.get("language_code"),
                "photo_url": user_data.get("photo_url"),
                "full_name": f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
            }
        except json.JSONDecodeError:
            logger.error("Failed to parse user JSON from initData")
    
    # Fallback: try to get individual fields
    return {
        "telegram_id": init_data_result.get("id"),
        "first_name": init_data_result.get("first_name", ""),
        "last_name": init_data_result.get("last_name", ""),
        "username": init_data_result.get("username"),
        "full_name": f"{init_data_result.get('first_name', '')} {init_data_result.get('last_name', '')}".strip(),
    }

