"""Add timestamp fields to service_availabilities

Revision ID: add_timestamps
Revises: update_service_availabilities
Create Date: 2026-03-01 09:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_timestamps'
down_revision = 'update_service_availabilities'
branch_labels = None
depends_on = None

def upgrade():
    # Add timestamp columns to service_availabilities table
    op.add_column('service_availabilities', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    op.add_column('service_availabilities', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))

def downgrade():
    # Remove timestamp columns
    op.drop_column('service_availabilities', 'updated_at')
    op.drop_column('service_availabilities', 'created_at')
