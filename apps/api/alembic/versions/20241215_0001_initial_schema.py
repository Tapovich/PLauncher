"""Initial schema - create all tables

Revision ID: 20241215_0001
Revises: 
Create Date: 2024-12-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20241215_0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('telegram_id', sa.BigInteger(), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('plan', sa.String(length=50), nullable=False, server_default='free'),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('telegram_id')
    )
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_telegram_id', 'users', ['telegram_id'])

    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ideation'),
        sa.Column('ai_generated_spec', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('budget_min', sa.Integer(), nullable=True),
        sa.Column('budget_max', sa.Integer(), nullable=True),
        sa.Column('timeline_weeks', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_projects_user_id', 'projects', ['user_id'])
    op.create_index('idx_projects_status', 'projects', ['status'])
    op.create_index('idx_projects_user_status', 'projects', ['user_id', 'status'])

    # Create ai_conversations table
    op.create_table(
        'ai_conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('messages', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('context', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_ai_conversations_user_id', 'ai_conversations', ['user_id'])
    op.create_index('idx_ai_conversations_project_id', 'ai_conversations', ['project_id'])

    # Create freelancers table
    op.create_table(
        'freelancers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(length=100), nullable=False),
        sa.Column('skills', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('hourly_rate_usd', sa.Integer(), nullable=False),
        sa.Column('availability', sa.String(length=50), nullable=False),
        sa.Column('portfolio_url', sa.String(length=500), nullable=True),
        sa.Column('bio', sa.Text(), nullable=False),
        sa.Column('rating', sa.DECIMAL(precision=3, scale=2), nullable=True, server_default='0.00'),
        sa.Column('projects_completed', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('verified', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('idx_freelancers_role', 'freelancers', ['role'])
    op.create_index('idx_freelancers_skills', 'freelancers', ['skills'], postgresql_using='gin')
    op.create_index('idx_freelancers_hourly_rate', 'freelancers', ['hourly_rate_usd'])
    op.create_index('idx_freelancers_availability', 'freelancers', ['availability'])
    op.create_index('idx_freelancers_verified', 'freelancers', ['verified'])
    op.create_index('idx_freelancers_rating', 'freelancers', ['rating'])

    # Create applications table
    op.create_table(
        'applications',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('freelancer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('cover_letter', sa.Text(), nullable=True),
        sa.Column('proposed_rate', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['freelancer_id'], ['freelancers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_applications_project_id', 'applications', ['project_id'])
    op.create_index('idx_applications_freelancer_id', 'applications', ['freelancer_id'])
    op.create_index('idx_applications_status', 'applications', ['status'])
    op.create_index('idx_applications_project_status', 'applications', ['project_id', 'status'])


def downgrade() -> None:
    # Drop tables in reverse order (handle foreign keys)
    op.drop_table('applications')
    op.drop_table('freelancers')
    op.drop_table('ai_conversations')
    op.drop_table('projects')
    op.drop_table('users')

