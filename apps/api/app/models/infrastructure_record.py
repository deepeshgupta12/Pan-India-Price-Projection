from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class InfrastructureRecord(Base):
    __tablename__ = "infrastructure_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    infra_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    infra_name: Mapped[str] = mapped_column(String(255), index=True)
    infra_type: Mapped[str] = mapped_column(String(100), index=True)

    city_id: Mapped[int | None] = mapped_column(
        ForeignKey("cities.id"), nullable=True, index=True
    )
    micromarket_id: Mapped[int | None] = mapped_column(
        ForeignKey("micromarkets.id"), nullable=True, index=True
    )
    locality_id: Mapped[int | None] = mapped_column(
        ForeignKey("localities.id"), nullable=True, index=True
    )

    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    status: Mapped[str] = mapped_column(String(100), index=True)
    planned_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expected_completion_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    confidence_level: Mapped[str | None] = mapped_column(String(100), nullable=True)

    source_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    distance_to_project_km: Mapped[float | None] = mapped_column(Float, nullable=True)

    type_weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    status_weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    probability_weight: Mapped[float | None] = mapped_column(Float, nullable=True)

    time_relevance_weight_1y: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    time_relevance_weight_3y: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    time_relevance_weight_5y: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    estimated_uplift_min_pct: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    estimated_uplift_max_pct: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
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

    city = relationship("City", back_populates="infrastructure_records")
    micromarket = relationship(
        "Micromarket", back_populates="infrastructure_records"
    )
    locality = relationship("Locality", back_populates="infrastructure_records")