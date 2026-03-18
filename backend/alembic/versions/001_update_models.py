"""Initial migration for updated Hospital and Staff models

Revision ID: 001_update_models
Revises: 
Create Date: 2026-02-26 17:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_update_models'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create staff table
    op.create_table('staff',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('hospital_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['hospital_id'], ['hospitals.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_staff_email'), 'staff', ['email'], unique=True)
    op.create_index(op.f('ix_staff_hospital_id'), 'staff', ['hospital_id'], unique=False)
    op.create_index(op.f('ix_staff_id'), 'staff', ['id'], unique=False)

    # Update hospitals table - add new columns
    op.add_column('hospitals', sa.Column('registration_number', sa.String(length=100), nullable=True))
    op.add_column('hospitals', sa.Column('hospital_type', sa.String(length=50), nullable=False, server_default='private'))
    op.add_column('hospitals', sa.Column('address', sa.String(length=500), nullable=False))
    op.add_column('hospitals', sa.Column('city', sa.String(length=100), nullable=False))
    op.add_column('hospitals', sa.Column('pincode', sa.String(length=10), nullable=False))
    op.add_column('hospitals', sa.Column('phone_number', sa.String(length=20), nullable=False))
    op.add_column('hospitals', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('hospitals', sa.Column('updated_at', sa.DateTime(), nullable=False))

    # Create indexes for new hospital fields
    op.create_index(op.f('ix_hospitals_city'), 'hospitals', ['city'], unique=False)
    op.create_index(op.f('ix_hospitals_email'), 'hospitals', ['email'], unique=True)
    op.create_index(op.f('ix_hospitals_registration_number'), 'hospitals', ['registration_number'], unique=True)
    op.create_index(op.f('ix_hospitals_state'), 'hospitals', ['state'], unique=False)

    # Drop old columns that are no longer needed
    op.drop_index('ix_hospitals_staff_id', table_name='hospitals')
    op.drop_column('hospitals', 'staff_id')
    op.drop_column('hospitals', 'password_hash')
    op.drop_column('hospitals', 'latitude')
    op.drop_column('hospitals', 'longitude')
    op.drop_column('hospitals', 'is_registered')

    # Make new columns not nullable after data migration
    op.alter_column('hospitals', 'registration_number', nullable=False)
    op.alter_column('hospitals', 'address', nullable=False)
    op.alter_column('hospitals', 'city', nullable=False)
    op.alter_column('hospitals', 'pincode', nullable=False)
    op.alter_column('hospitals', 'phone_number', nullable=False)
    op.alter_column('hospitals', 'email', nullable=False)

def downgrade():
    # Add back old columns
    op.add_column('hospitals', sa.Column('staff_id', sa.VARCHAR(length=100), nullable=False))
    op.add_column('hospitals', sa.Column('password_hash', sa.VARCHAR(length=255), nullable=False))
    op.add_column('hospitals', sa.Column('latitude', sa.FLOAT(), nullable=False))
    op.add_column('hospitals', sa.Column('longitude', sa.FLOAT(), nullable=False))
    op.add_column('hospitals', sa.Column('is_registered', sa.BOOLEAN(), nullable=False))

    # Drop new columns and indexes
    op.drop_index(op.f('ix_hospitals_state'), table_name='hospitals')
    op.drop_index(op.f('ix_hospitals_registration_number'), table_name='hospitals')
    op.drop_index(op.f('ix_hospitals_email'), table_name='hospitals')
    op.drop_index(op.f('ix_hospitals_city'), table_name='hospitals')
    op.drop_column('hospitals', 'updated_at')
    op.drop_column('hospitals', 'is_verified')
    op.drop_column('hospitals', 'phone_number')
    op.drop_column('hospitals', 'pincode')
    op.drop_column('hospitals', 'city')
    op.drop_column('hospitals', 'address')
    op.drop_column('hospitals', 'hospital_type')
    op.drop_column('hospitals', 'registration_number')

    # Recreate old index
    op.create_index('ix_hospitals_staff_id', 'hospitals', ['staff_id'], unique=True)

    # Drop staff table
    op.drop_index(op.f('ix_staff_id'), table_name='staff')
    op.drop_index(op.f('ix_staff_hospital_id'), table_name='staff')
    op.drop_index(op.f('ix_staff_email'), table_name='staff')
    op.drop_table('staff')
