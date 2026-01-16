"""Add email column to profiles manually

Revision ID: add_profiles_email_001
Revises: c782d05b6ad9
Create Date: 2026-01-16 10:56:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_profiles_email_001'
down_revision = 'c782d05b6ad9'
branch_labels = None
depends_on = None


def upgrade():
    # Add email column to profiles table if it doesn't exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='profiles' AND column_name='email'
            ) THEN
                ALTER TABLE profiles ADD COLUMN email VARCHAR(255);
            END IF;
        END $$;
    """)


def downgrade():
    # Remove email column from profiles table
    op.drop_column('profiles', 'email')
