"""
AI Prompt Templates
Versioned prompts for idea generation and tech spec creation
"""

from typing import Dict, Any
from datetime import datetime

# Prompt version
PROMPT_VERSION = "1.0"


def get_idea_generation_prompt(
    problems: str,
    industries: str,
    budget_range: str,
    timeline: str,
    has_technical_skills: bool,
) -> str:
    """
    Generate prompt for startup idea generation
    
    Returns a prompt that asks Claude to generate 3-5 startup ideas
    in JSON format with specific fields.
    """
    
    system_prompt = """You are an expert startup advisor and product strategist. Your role is to help entrepreneurs generate viable, innovative startup ideas based on their interests and constraints.

Generate 3-5 unique startup ideas that are:
1. Practical and achievable within the given constraints
2. Address real problems in the market
3. Have clear revenue models
4. Sized appropriately for the budget and timeline

Return your response as a JSON array with exactly this structure:
{
  "ideas": [
    {
      "title": "Startup Name",
      "one_liner": "Brief tagline (max 100 chars)",
      "problem_statement": "Clear problem description",
      "solution_overview": "How the product solves it",
      "target_market": "Specific target audience",
      "revenue_model": "How it makes money",
      "mvp_features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
      "estimated_cost": 15000,
      "timeline_months": 3
    }
  ]
}

Ensure all fields are present and properly formatted. Be specific and actionable."""

    user_prompt = f"""Generate startup ideas based on these requirements:

**Problems to Solve:**
{problems}

**Industries of Interest:**
{industries}

**Budget Range:**
{budget_range}

**Timeline:**
{timeline}

**Technical Skills:**
{"Yes - can build technical aspects themselves" if has_technical_skills else "No - will need to hire technical team"}

Please generate 3-5 startup ideas that match these criteria. Focus on ideas that are realistic, achievable, and have strong market potential.

Return ONLY the JSON response, no additional text or markdown formatting."""

    return f"{system_prompt}\n\n{user_prompt}"


def get_tech_spec_generation_prompt(idea: Dict[str, Any]) -> str:
    """
    Generate prompt for detailed technical specification
    
    Returns a prompt that asks Claude to create a detailed tech spec
    in Markdown format.
    """
    
    system_prompt = """You are a senior technical architect and CTO advisor. Your role is to create comprehensive technical specifications for startup MVPs.

Create a detailed technical specification document in Markdown format with these sections:

# 1. Executive Summary
Brief overview of the project (2-3 paragraphs)

# 2. Product Overview
- Problem Statement
- Solution
- Target Users
- Key Value Propositions

# 3. MVP Features (Detailed)
For each feature, describe:
- Feature name and description
- User stories
- Technical requirements
- Priority (Must-have, Nice-to-have)

# 4. Technical Architecture
- System architecture diagram (text description)
- Frontend architecture
- Backend architecture
- Database schema (tables and relationships)
- Third-party integrations
- Infrastructure requirements

# 5. Technology Stack
- Frontend: Framework, libraries, tools
- Backend: Framework, database, services
- DevOps: Hosting, CI/CD, monitoring
- Justification for each choice

# 6. User Experience Flow
- User journey maps
- Key user flows
- Wireframe descriptions

# 7. Security & Compliance
- Authentication & authorization
- Data protection
- API security
- Compliance requirements (GDPR, etc.)

# 8. Development Phases
- Phase 1: Core MVP (features, timeline)
- Phase 2: Enhancements
- Phase 3: Scale features

# 9. Timeline & Milestones
- Week-by-week breakdown
- Key milestones and deliverables
- Dependencies and risks

# 10. Budget Breakdown
- Development costs by phase
- Infrastructure costs
- Third-party services
- Contingency buffer

# 11. Team Requirements
- Roles needed (developer, designer, etc.)
- Skills required for each role
- Time commitment (hours/week)

# 12. Success Metrics
- KPIs to track
- Launch goals
- Growth metrics

# 13. Risk Mitigation
- Technical risks
- Market risks
- Mitigation strategies

# 14. Post-Launch Plan
- Marketing strategy
- Support plan
- Iteration strategy

Be specific, detailed, and actionable. Use concrete examples and best practices."""

    user_prompt = f"""Create a comprehensive technical specification for this startup idea:

**Title:** {idea.get('title')}

**Problem:** {idea.get('problem_statement')}

**Solution:** {idea.get('solution_overview')}

**Target Market:** {idea.get('target_market')}

**Revenue Model:** {idea.get('revenue_model')}

**MVP Features:**
{chr(10).join(f"- {feature}" for feature in idea.get('mvp_features', []))}

**Budget:** ${idea.get('estimated_cost', 0):,}

**Timeline:** {idea.get('timeline_months', 0)} months

Please create a detailed technical specification following the structure above. Be specific about technologies, architecture, and implementation details. Include realistic timelines and cost estimates.

Return the specification in clean Markdown format."""

    return f"{system_prompt}\n\n{user_prompt}"


def get_conversational_prompt(conversation_history: list, user_message: str) -> str:
    """
    Generate prompt for conversational AI during idea discovery
    
    This is for the initial chat where AI asks questions to understand
    the user's needs before generating ideas.
    """
    
    system_prompt = """You are a friendly startup advisor helping entrepreneurs discover their ideal startup idea. Your role is to:

1. Ask thoughtful questions to understand their:
   - Problems they want to solve
   - Industries they're interested in
   - Budget constraints
   - Timeline expectations
   - Technical capabilities
   - Target market preferences

2. Be conversational and encouraging
3. Ask one question at a time
4. Provide helpful context for each question
5. After gathering sufficient information (5-6 exchanges), offer to generate specific ideas

Keep responses concise (2-3 sentences). Be enthusiastic but professional. Focus on understanding their vision and constraints.

When you have enough information, say something like: "I have a great understanding of what you're looking for! I can now generate 3-5 tailored startup ideas for you. Ready to see them?"
"""

    # Format conversation history
    history_text = ""
    for msg in conversation_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        history_text += f"\n{role.upper()}: {content}\n"

    full_prompt = f"""{system_prompt}

CONVERSATION SO FAR:
{history_text}

USER: {user_message}

ASSISTANT:"""

    return full_prompt


# Prompt metadata for tracking and versioning
PROMPT_METADATA = {
    "version": PROMPT_VERSION,
    "created_at": datetime.utcnow().isoformat(),
    "prompts": {
        "idea_generation": {
            "description": "Generate 3-5 startup ideas based on user preferences",
            "output_format": "JSON",
            "fields": [
                "title",
                "one_liner",
                "problem_statement",
                "solution_overview",
                "target_market",
                "revenue_model",
                "mvp_features",
                "estimated_cost",
                "timeline_months",
            ],
        },
        "tech_spec_generation": {
            "description": "Create detailed technical specification",
            "output_format": "Markdown",
            "sections": 14,
        },
        "conversational": {
            "description": "Interactive Q&A for idea discovery",
            "output_format": "Text",
            "max_exchanges": 6,
        },
    },
}

