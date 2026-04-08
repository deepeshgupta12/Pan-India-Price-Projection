from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Locality(Base):
    __tablename__ = "localities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    locality_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    locality_name: Mapped[str] = mapped_column(String(255), index=True)

    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"), index=True)
    micromarket_id: Mapped[int] = mapped_column(
        ForeignKey("micromarkets.id"), index=True
    )

    avg_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_rent: Mapped[float | None] = mapped_column(Float, nullable=True)
    search_demand_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    livability_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    social_infra_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    connectivity_index: Mapped[float | None] = mapped_column(Float, nullable=True)

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

    city = relationship("City", back_populates="localities")
    micromarket = relationship("Micromarket", back_populates="localities")
    projects = relationship("Project", back_populates="locality")
    infrastructure_records = relationship(
        "InfrastructureRecord", back_populates="locality"
    )
    saved_analyses = relationship("SavedAnalysis", back_populates="locality")