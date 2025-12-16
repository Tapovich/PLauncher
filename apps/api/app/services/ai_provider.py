"""
AI Provider Service - Claude Integration
Handles all AI-related operations with Anthropic Claude
"""

import json
import asyncio
from typing import Dict, Any, List, Optional
from anthropic import AsyncAnthropic, APIError, APITimeoutError
import httpx

from app.core.config import settings
from app.core.logging import get_logger
from app.core.exceptions import LaunchKitException

logger = get_logger(__name__)


class AIProviderError(LaunchKitException):
    """AI Provider specific error"""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=500,
            error_code="ai_provider_error",
            details=details,
        )


class AIProvider:
    """
    AI Provider service using Anthropic Claude
    
    Features:
    - Async API calls
    - Timeout handling (30s default)
    - Retry logic (3 attempts)
    - Structured error handling
    - JSON and Markdown response parsing
    """

    def __init__(self):
        if not settings.ANTHROPIC_API_KEY:
            logger.warning("Anthropic API key not configured")
        
        self.client = AsyncAnthropic(
            api_key=settings.ANTHROPIC_API_KEY,
            timeout=httpx.Timeout(30.0, connect=10.0),
            max_retries=3,
        )
        self.model = settings.ANTHROPIC_MODEL
        self.max_tokens = settings.ANTHROPIC_MAX_TOKENS

    async def generate_completion(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        enable_thinking: bool = False,
    ) -> str:
        """
        Generate text completion from Claude
        
        Args:
            prompt: User prompt
            system: System prompt (optional)
            temperature: Randomness (0-1)
            max_tokens: Max response tokens
            
        Returns:
            Generated text response
            
        Raises:
            AIProviderError: If API call fails
        """
        try:
            logger.info(f"Generating completion with Claude {self.model}")
            
            # Prepare messages
            messages = [{"role": "user", "content": prompt}]
            
            # Prepare Claude API call parameters
            api_params = {
                "model": self.model,
                "max_tokens": max_tokens or self.max_tokens,
                "temperature": temperature,  # Claude 4.5: use only temperature OR top_p, not both
                "system": system or "You are a helpful AI assistant.",
                "messages": messages,
            }

            # Add extended thinking for complex tasks (Claude 4.5 feature)
            if enable_thinking and (max_tokens or self.max_tokens) > 8000:
                thinking_budget = min(10000, (max_tokens or self.max_tokens) // 2)
                api_params["thinking"] = {
                    "type": "enabled",
                    "budget_tokens": thinking_budget
                }

            # Call Claude API
            response = await self.client.messages.create(**api_params)
            
            # Check for refusal (Claude 4.5 new stop reason)
            if hasattr(response, 'stop_reason') and response.stop_reason == "refusal":
                logger.warning("Claude refused the request")
                raise AIProviderError("I cannot assist with this request as it violates my guidelines.")

            # Extract text from response
            if response.content and len(response.content) > 0:
                text = response.content[0].text
                logger.info(f"Generated {len(text)} characters")
                return text

            raise AIProviderError("Empty response from Claude API")
            
        except APITimeoutError as e:
            logger.error(f"Claude API timeout: {str(e)}")
            raise AIProviderError("AI request timed out. Please try again.")
        
        except APIError as e:
            logger.error(f"Claude API error: {str(e)}", exc_info=True)
            raise AIProviderError(f"AI service error: {str(e)}")
        
        except Exception as e:
            logger.error(f"Unexpected error in AI generation: {str(e)}", exc_info=True)
            raise AIProviderError(f"Failed to generate response: {str(e)}")

    async def generate_json(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Generate JSON response from Claude
        
        Used for structured data like startup ideas.
        
        Returns:
            Parsed JSON response
            
        Raises:
            AIProviderError: If generation or parsing fails
        """
        try:
            # Generate response
            text = await self.generate_completion(
                prompt=prompt,
                system=system,
                temperature=temperature,
            )
            
            # Try to find JSON in response
            # Claude sometimes wraps JSON in markdown code blocks
            text = text.strip()
            
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text[7:]  # Remove ```json
            elif text.startswith("```"):
                text = text[3:]  # Remove ```
            
            if text.endswith("```"):
                text = text[:-3]  # Remove closing ```
            
            text = text.strip()
            
            # Parse JSON
            try:
                data = json.loads(text)
                logger.info("Successfully parsed JSON response")
                return data
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON: {str(e)}")
                logger.error(f"Response text: {text[:500]}")
                raise AIProviderError(
                    "Failed to parse AI response as JSON",
                    details={"error": str(e), "text_preview": text[:200]},
                )
        
        except AIProviderError:
            raise
        except Exception as e:
            logger.error(f"Error generating JSON: {str(e)}", exc_info=True)
            raise AIProviderError(f"Failed to generate JSON response: {str(e)}")

    async def generate_markdown(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Generate Markdown response from Claude

        Used for long-form content like technical specifications.
        Enables extended thinking for complex tasks.

        Returns:
            Markdown formatted text
        """
        return await self.generate_completion(
            prompt=prompt,
            system=system,
            temperature=temperature,
            max_tokens=max_tokens or 16000,  # Longer for tech specs (Claude 4.5 supports up to 64K)
            enable_thinking=True,  # Enable extended thinking for complex tech specs
        )

    async def chat(
        self,
        messages: List[Dict[str, str]],
        system: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        """
        Chat with Claude using conversation history
        
        Args:
            messages: List of {role: "user"|"assistant", content: str}
            system: System prompt
            temperature: Randomness
            
        Returns:
            Assistant's response
        """
        try:
            logger.info(f"Chat with {len(messages)} messages in history")
            
            # Call Claude API with conversation history
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=temperature,  # Claude 4.5: use only temperature OR top_p, not both
                system=system or "You are a helpful AI assistant.",
                messages=messages,
            )

            # Check for refusal (Claude 4.5 new stop reason)
            if hasattr(response, 'stop_reason') and response.stop_reason == "refusal":
                logger.warning("Claude refused the chat request")
                return "I cannot assist with this request as it violates my guidelines."

            if response.content and len(response.content) > 0:
                text = response.content[0].text
                logger.info(f"Generated chat response: {len(text)} characters")
                return text

            raise AIProviderError("Empty response from Claude API")
            
        except APITimeoutError as e:
            logger.error(f"Claude API timeout: {str(e)}")
            raise AIProviderError("AI request timed out. Please try again.")
        
        except APIError as e:
            logger.error(f"Claude API error: {str(e)}", exc_info=True)
            raise AIProviderError(f"AI service error: {str(e)}")
        
        except Exception as e:
            logger.error(f"Unexpected error in chat: {str(e)}", exc_info=True)
            raise AIProviderError(f"Failed to generate response: {str(e)}")


# Singleton instance
_ai_provider: Optional[AIProvider] = None


def get_ai_provider() -> AIProvider:
    """Get or create AI provider instance"""
    global _ai_provider
    if _ai_provider is None:
        _ai_provider = AIProvider()
    return _ai_provider

