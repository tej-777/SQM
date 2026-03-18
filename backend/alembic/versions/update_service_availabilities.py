"""Update service_availabilities table

Revision ID: update_service_availabilities
Revises: f1fbb81158aa
Create Date: 2026-02-28 15:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'update_service_availabilities'
down_revision = 'f1fbb81158aa'
branch_labels = None
depends_on = None

def upgrade():
    # Check if table exists first
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    if 'service_availabilities' in inspector.get_table_names():
        # Check if columns exist before adding them
        columns = [col['name'] for col in inspector.get_columns('service_availabilities')]
        
        if 'total_slots' not in columns:
            op.add_column('service_availabilities', sa.Column('total_slots', sa.Integer(), nullable=False, server_default='0'))
        
        if 'booked_slots' not in columns:
            op.add_column('service_availabilities', sa.Column('booked_slots', sa.Integer(), nullable=False, server_default='0'))
        
        if 'is_active' not in columns:
            op.add_column('service_availabilities', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
        
        # Drop old columns if they exist
        if 'is_available' in columns:
            op.drop_column('service_availabilities', 'is_available')
        
        if 'max_tokens_override' in columns:
            op.drop_column('service_availabilities', 'max_tokens_override')
    else:
        # Create the table if it doesn't exist
        op.create_table('service_availabilities',
            sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('hospital_service_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('date', sa.Date(), nullable=False),
            sa.Column('total_slots', sa.Integer(), nullable=False),
            sa.Column('booked_slots', sa.Integer(), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False),
            sa.ForeignKeyConstraint(['hospital_service_id'], ['hospital_services.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('hospital_service_id', 'date', name='_hospital_service_date_uc')
        )

def downgrade():
    # Revert changes
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    if 'service_availabilities' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('service_availabilities')]
        
        # Add back old columns
        if 'is_available' not in columns:
            op.add_column('service_availabilities', sa.Column('is_available', sa.Boolean(), nullable=True))
        
        if 'max_tokens_override' not in columns:
            op.add_column('service_availabilities', sa.Column('max_tokens_override', sa.Integer(), nullable=True))
        
        # Drop new columns
        if 'total_slots' in columns:
            op.drop_column('service_availabilities', 'total_slots')
        
        if 'booked_slots' in columns:
            op.drop_column('service_availabilities', 'booked_slots')
        
        if 'is_active' in columns:
            op.drop_column('service_availabilities', 'is_active')
