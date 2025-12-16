"""
Seed script to populate database with demo data
Run with: python -m scripts.seed_database
"""

import asyncio
import sys
import os
from datetime import datetime
import random
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.models import User, Project, Freelancer, AIConversation
from app.core.config import settings


# Sample data
SKILLS_BY_ROLE = {
    "developer": [
        ["Python", "FastAPI", "PostgreSQL", "Docker"],
        ["React", "TypeScript", "Node.js", "MongoDB"],
        ["Go", "Kubernetes", "AWS", "Microservices"],
        ["Java", "Spring Boot", "MySQL", "Redis"],
        ["PHP", "Laravel", "Vue.js", "REST API"],
        ["Ruby", "Rails", "PostgreSQL", "Heroku"],
        ["C#", ".NET", "Azure", "SQL Server"],
        ["Swift", "iOS", "SwiftUI", "Firebase"],
    ],
    "designer": [
        ["Figma", "UI/UX", "Prototyping", "Design Systems"],
        ["Adobe XD", "Illustration", "Branding", "Typography"],
        ["Sketch", "Wireframing", "User Research", "Mobile Design"],
        ["Photoshop", "Web Design", "Responsive Design", "CSS"],
    ],
    "pm": [
        ["Agile", "Scrum", "JIRA", "Product Strategy"],
        ["Roadmapping", "Stakeholder Management", "Analytics", "A/B Testing"],
        ["User Stories", "Sprint Planning", "Team Leadership", "Communication"],
    ],
    "qa": [
        ["Manual Testing", "Automation", "Selenium", "Test Plans"],
        ["Cypress", "Jest", "API Testing", "Bug Tracking"],
        ["Performance Testing", "Security Testing", "Documentation"],
    ],
    "devops": [
        ["AWS", "Docker", "Kubernetes", "CI/CD"],
        ["Azure", "Terraform", "Jenkins", "Monitoring"],
        ["GCP", "Ansible", "GitLab CI", "Infrastructure as Code"],
    ],
}

FREELANCER_BIOS = [
    "Full-stack developer with 5+ years of experience building scalable web applications. Passionate about clean code and modern tech stacks.",
    "Senior UI/UX designer specializing in mobile-first design and design systems. I help startups create beautiful, user-friendly products.",
    "Product manager with a technical background. I've launched 10+ products from 0 to 1, working with distributed teams.",
    "Backend engineer focused on API design and microservices. Experience with high-traffic applications and cloud architecture.",
    "Frontend specialist who loves React and TypeScript. I build fast, accessible, and maintainable user interfaces.",
    "DevOps engineer with expertise in AWS and Kubernetes. I help teams automate deployments and scale infrastructure.",
    "Mobile developer (iOS & Android) with a portfolio of apps in the App Store. Passionate about native performance.",
    "QA engineer with automation expertise. I help teams ship quality products faster with comprehensive test coverage.",
    "Full-stack developer passionate about startups. I move fast, build MVPs, and iterate based on user feedback.",
    "Designer with frontend skills. I can design and implement the UI, bridging the gap between design and development.",
]

FULL_NAMES = [
    "Alex Johnson", "Sarah Chen", "Michael Rodriguez", "Emma Thompson",
    "David Kim", "Jessica Martinez", "James Wilson", "Maria Garcia",
    "Robert Taylor", "Lisa Anderson", "Chris Brown", "Anna Davis",
    "Kevin Lee", "Sophie White", "Daniel Martin", "Rachel Cooper",
    "Thomas Moore", "Jennifer Hall", "Ryan Clark", "Emily Lewis",
]

PROJECT_TITLES = [
    "AI-Powered Task Manager",
    "Social Fitness App",
    "Local Service Marketplace",
]

PROJECT_DESCRIPTIONS = [
    "A smart task management app that uses AI to prioritize tasks, suggest optimal scheduling, and provide productivity insights. Target audience: busy professionals and entrepreneurs.",
    "A fitness app that combines social features with workout tracking. Users can join challenges, share progress, and find workout buddies nearby. Gamification and community-driven.",
    "A platform connecting local service providers (plumbers, electricians, cleaners) with customers. Features include instant booking, reviews, and secure payments.",
]


async def clear_database(db: AsyncSession):
    """Clear all data from the database"""
    print("🗑️  Clearing existing data...")
    
    # Import here to avoid circular imports
    from app.models import Application, AIConversation, Freelancer, Project, User
    
    # Delete in order to respect foreign keys
    await db.execute("DELETE FROM applications")
    await db.execute("DELETE FROM ai_conversations")
    await db.execute("DELETE FROM freelancers")
    await db.execute("DELETE FROM projects")
    await db.execute("DELETE FROM users")
    await db.commit()
    
    print("✅ Database cleared")


async def seed_users_and_freelancers(db: AsyncSession):
    """Create users and freelancer profiles"""
    print("👥 Creating users and freelancers...")
    
    users = []
    freelancers = []
    
    # Create demo user with telegram_id
    demo_user = User(
        email="demo@launchkit.ai",
        telegram_id=123456789,
        full_name="Demo User",
        plan="pro",
    )
    users.append(demo_user)
    
    # Create 20 freelancers
    for i in range(20):
        # Pick a role
        role = random.choice(list(SKILLS_BY_ROLE.keys()))
        skills = random.choice(SKILLS_BY_ROLE[role])
        
        # Create user for freelancer
        user = User(
            email=f"freelancer{i+1}@example.com",
            full_name=FULL_NAMES[i] if i < len(FULL_NAMES) else f"Freelancer {i+1}",
            plan="free",
        )
        users.append(user)
        
        # Create freelancer profile
        freelancer = Freelancer(
            user=user,
            role=role,
            skills=skills,
            hourly_rate_usd=random.randint(25, 150),
            availability=random.choice(["full-time", "part-time", "contract"]),
            portfolio_url=f"https://portfolio{i+1}.com" if random.random() > 0.3 else None,
            bio=random.choice(FREELANCER_BIOS),
            rating=Decimal(str(round(random.uniform(3.5, 5.0), 2))),
            projects_completed=random.randint(0, 50),
            verified=random.random() > 0.4,  # 60% verified
        )
        freelancers.append(freelancer)
    
    # Add all to database
    db.add_all(users)
    await db.flush()  # Flush to get user IDs
    db.add_all(freelancers)
    await db.commit()
    
    print(f"✅ Created {len(users)} users and {len(freelancers)} freelancers")
    return demo_user


async def seed_projects(db: AsyncSession, demo_user: User):
    """Create demo projects"""
    print("📁 Creating projects...")
    
    projects = []
    
    for i in range(3):
        project = Project(
            user_id=demo_user.id,
            title=PROJECT_TITLES[i],
            description=PROJECT_DESCRIPTIONS[i],
            status=random.choice(["ideation", "planning", "hiring"]),
            budget_min=random.randint(5000, 15000),
            budget_max=random.randint(20000, 50000),
            timeline_weeks=random.randint(8, 16),
            ai_generated_spec={
                "features": [
                    "User authentication",
                    "Dashboard",
                    "Core functionality",
                    "Mobile responsive design",
                    "API integration",
                ],
                "tech_stack": {
                    "frontend": "React + TypeScript",
                    "backend": "Python + FastAPI",
                    "database": "PostgreSQL",
                },
                "estimated_hours": random.randint(200, 600),
            },
        )
        projects.append(project)
    
    db.add_all(projects)
    await db.commit()
    
    print(f"✅ Created {len(projects)} projects")
    return projects


async def seed_ai_conversations(db: AsyncSession, demo_user: User, projects: list):
    """Create sample AI conversations"""
    print("💬 Creating AI conversations...")
    
    conversation = AIConversation(
        user_id=demo_user.id,
        project_id=projects[0].id if projects else None,
        messages=[
            {
                "role": "user",
                "content": "I want to build a task management app",
                "timestamp": datetime.utcnow().isoformat(),
            },
            {
                "role": "assistant",
                "content": "Great idea! Let me ask you a few questions to understand your vision better. What problems are you trying to solve with this task manager?",
                "timestamp": datetime.utcnow().isoformat(),
            },
            {
                "role": "user",
                "content": "People struggle with prioritizing tasks and often feel overwhelmed. I want to use AI to help them focus on what matters.",
                "timestamp": datetime.utcnow().isoformat(),
            },
        ],
        context={"stage": "ideation", "industry": "productivity"},
    )
    
    db.add(conversation)
    await db.commit()
    
    print("✅ Created AI conversation")


async def main():
    """Main seed function"""
    print("🌱 Starting database seed...")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Database: {settings.DATABASE_URL.split('@')[-1]}")  # Hide credentials
    
    async with AsyncSessionLocal() as db:
        try:
            # Clear existing data
            await clear_database(db)
            
            # Seed data
            demo_user = await seed_users_and_freelancers(db)
            projects = await seed_projects(db, demo_user)
            await seed_ai_conversations(db, demo_user, projects)
            
            print("\n🎉 Database seeding completed successfully!")
            print(f"\n📊 Summary:")
            print(f"   - 1 demo user (telegram_id: 123456789)")
            print(f"   - 20 freelancers with diverse skills")
            print(f"   - 3 demo projects")
            print(f"   - 1 AI conversation sample")
            print(f"\n🔑 Demo Login:")
            print(f"   Email: demo@launchkit.ai")
            print(f"   Telegram ID: 123456789")
            
        except Exception as e:
            print(f"\n❌ Error seeding database: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())

