"""Add dfy_inquiries table

Revision ID: 20241215_1200
Revises: 20241215_0001
Create Date: 2024-12-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20241215_1200'
down_revision: Union[str, None] = '20241215_0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create dfy_inquiries table
    op.create_table(
        'dfy_inquiries',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_name', sa.String(length=255), nullable=False),
        sa.Column('project_description', sa.Text(), nullable=False),
        sa.Column('project_type', sa.String(length=100), nullable=True),
        sa.Column('budget', sa.String(length=50), nullable=True),
        sa.Column('timeline', sa.String(length=50), nullable=True),
        sa.Column('stage', sa.String(length=50), nullable=True),
        sa.Column('additional_info', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('contact_info', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('idx_dfy_inquiries_user_id', 'dfy_inquiries', ['user_id'])
    op.create_index('idx_dfy_inquiries_status', 'dfy_inquiries', ['status'])
    op.create_index('idx_dfy_inquiries_created_at', 'dfy_inquiries', ['created_at'])


def downgrade() -> None:
    op.drop_table('dfy_inquiries')

