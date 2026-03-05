"""initial_reports_schema

Revision ID: 001_initial_reports_schema
Revises: 
Create Date: 2026-03-05 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_reports_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    """
    Constructs the core 'reports' table using Postgres-native UUID sequences
    and optimized JSONB storage for the extensive LLM responses.
    Additionally prepares indexing for fast querying of historical user data.
    """
    op.create_table(
        'reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', sa.String(length=128), nullable=False),
        sa.Column('symbol', sa.String(length=16), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='pending'),
        sa.Column('report_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False)
    )

    # Establish an index on user_id to rapidly fetch /api/report/history collections
    op.create_index(
        op.f('ix_reports_user_id'),
        'reports',
        ['user_id'],
        unique=False
    )
    
    # Establish a compound index for fast idempotency lookups on a symbol per user
    op.create_index(
        op.f('ix_reports_symbol_time'),
        'reports',
        ['symbol', 'created_at'],
        unique=False
    )

def downgrade() -> None:
    """Rollback strategy drops all sequences and indexes associated with the core entity."""
    op.drop_index(op.f('ix_reports_symbol_time'), table_name='reports')
    op.drop_index(op.f('ix_reports_user_id'), table_name='reports')
    op.drop_table('reports')
