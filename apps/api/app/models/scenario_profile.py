from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class ScenarioProfile(Base):
    __tablename__ = "scenario_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scenario_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    scenario_name: Mapped[str] = mapped_column(String(150), index=True)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    market_cagr: Mapped[float | None] = mapped_column(Float, nullable=True)
    supply_stress_adjustment: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    infra_realization_adjustment: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    affordability_drag_adjustment: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    developer_premium_drift: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    risk_drag_adjustment: Mapped[float | None] = mapped_column(Float, nullable=True)

    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
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