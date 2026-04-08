from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class City(Base):
    __tablename__ = "cities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    city_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    city_name: Mapped[str] = mapped_column(String(255), index=True)
    state_name: Mapped[str] = mapped_column(String(255))
    zone: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tier: Mapped[str | None] = mapped_column(String(50), nullable=True)

    demand_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    affordability_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    macro_growth_index: Mapped[float | None] = mapped_column(Float, nullable=True)

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

    micromarkets = relationship("Micromarket", back_populates="city")
    localities = relationship("Locality", back_populates="city")
    projects = relationship("Project", back_populates="city")
    infrastructure_records = relationship(
        "InfrastructureRecord", back_populates="city"
    )
    saved_analyses = relationship("SavedAnalysis", back_populates="city")