from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class VariableDefinition(Base):
    __tablename__ = "variable_definitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    field_key: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(150), index=True)

    description: Mapped[str] = mapped_column(Text)
    why_it_matters: Mapped[str] = mapped_column(Text)
    placeholder: Mapped[str | None] = mapped_column(String(255), nullable=True)
    help_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    allowed_values: Mapped[list | dict | None] = mapped_column(JSON, nullable=True)

    unit: Mapped[str | None] = mapped_column(String(100), nullable=True)
    min_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    default_value: Mapped[str | None] = mapped_column(String(255), nullable=True)

    required_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    editable_flag: Mapped[bool] = mapped_column(Boolean, default=True)
    input_type: Mapped[str] = mapped_column(String(100))
    tooltip_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    example: Mapped[str | None] = mapped_column(Text, nullable=True)
    formula_dependency: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_impact: Mapped[str | None] = mapped_column(Text, nullable=True)

    sort_order: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )