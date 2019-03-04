"""bpmn tables

Revision ID: 53df1815994e
Revises: 
Create Date: 2019-03-03 23:12:11.524690

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '53df1815994e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('process',
    sa.Column('id', sa.String(length=40), nullable=False),
    sa.Column('processName', sa.String(length=64), nullable=True),
    sa.Column('importDate', sa.DateTime(), nullable=True),
    sa.Column('noExecutes', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_process_processName'), 'process', ['processName'], unique=True)
    op.create_table('node',
    sa.Column('id', sa.String(length=40), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=True),
    sa.Column('type', sa.String(length=100), nullable=True),
    sa.Column('highlighted', sa.Boolean(), nullable=True),
    sa.Column('processId', sa.String(length=40), nullable=True),
    sa.ForeignKeyConstraint(['processId'], ['process.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('process_doc',
    sa.Column('id', sa.String(length=40), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('processId', sa.String(length=40), nullable=True),
    sa.ForeignKeyConstraint(['processId'], ['process.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('detail_instruction',
    sa.Column('id', sa.String(length=40), nullable=False),
    sa.Column('text', sa.Text(), nullable=True),
    sa.Column('nodeId', sa.String(length=40), nullable=True),
    sa.ForeignKeyConstraint(['nodeId'], ['node.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('edge',
    sa.Column('id', sa.String(length=40), nullable=False),
    sa.Column('highlighted', sa.Boolean(), nullable=True),
    sa.Column('processId', sa.String(length=40), nullable=True),
    sa.Column('sourceId', sa.String(length=40), nullable=True),
    sa.Column('targetId', sa.String(length=40), nullable=True),
    sa.ForeignKeyConstraint(['processId'], ['process.id'], ),
    sa.ForeignKeyConstraint(['sourceId'], ['node.id'], ),
    sa.ForeignKeyConstraint(['targetId'], ['node.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('general_instruction',
    sa.Column('id', sa.String(length=40), nullable=False),
    sa.Column('text', sa.Text(), nullable=True),
    sa.Column('nodeId', sa.String(length=40), nullable=True),
    sa.ForeignKeyConstraint(['nodeId'], ['node.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('general_instruction')
    op.drop_table('edge')
    op.drop_table('detail_instruction')
    op.drop_table('process_doc')
    op.drop_table('node')
    op.drop_index(op.f('ix_process_processName'), table_name='process')
    op.drop_table('process')
    # ### end Alembic commands ###
