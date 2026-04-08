from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Micromarket(Base):
    __tablename__ = "micromarkets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    micromarket_code: Mapped[str] = mapped_column(
        String(100), unique=True, index=True
    )
    micromarket_name: Mapped[str] = mapped_column(String(255), index=True)

    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"), index=True)

    market_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    avg_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_rent: Mapped[float | None] = mapped_column(Float, nullable=True)
    inventory_overhang_months: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    absorption_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    future_supply_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    infra_momentum_index: Mapped[float | None] = mapped_column(Float, nullable=True)

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

    city = relationship("City", back_populates="micromarkets")
    localities = relationship("Locality", back_populates="micromarket")
    projects = relationship("Project", back_populates="micromarket")
    infrastructure_records = relationship(
        "InfrastructureRecord", back_populates="micromarket"
    )
    saved_analyses = relationship("SavedAnalysis", back_populates="micromarket")