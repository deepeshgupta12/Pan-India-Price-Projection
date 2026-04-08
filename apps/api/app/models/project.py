from datetime import date, datetime

from sqlalchemy import (
    JSON,
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


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    project_name: Mapped[str] = mapped_column(String(255), index=True)

    developer_id: Mapped[int | None] = mapped_column(
        ForeignKey("developers.id"), nullable=True, index=True
    )
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"), index=True)
    micromarket_id: Mapped[int | None] = mapped_column(
        ForeignKey("micromarkets.id"), nullable=True, index=True
    )
    locality_id: Mapped[int | None] = mapped_column(
        ForeignKey("localities.id"), nullable=True, index=True
    )

    address_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    asset_class: Mapped[str | None] = mapped_column(String(100), nullable=True)
    project_stage: Mapped[str | None] = mapped_column(String(100), nullable=True)

    launch_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expected_possession_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    total_land_acres: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_units: Mapped[int | None] = mapped_column(Integer, nullable=True)
    towers_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    floors_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    unit_mix_summary: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)

    avg_unit_size_sqft: Mapped[float | None] = mapped_column(Float, nullable=True)
    density_units_per_acre: Mapped[float | None] = mapped_column(Float, nullable=True)
    parking_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    open_space_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    amenity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    construction_quality_score: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    legal_clarity_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    rera_status: Mapped[str | None] = mapped_column(String(100), nullable=True)

    benchmark_current_asking_price: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    benchmark_radius_km: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Market-context fields (added in gap-fix pass)
    avg_rent: Mapped[float | None] = mapped_column(Float, nullable=True)
    inventory_overhang_months: Mapped[float | None] = mapped_column(Float, nullable=True)
    distance_to_metro_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    social_infra_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_data_refreshed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

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

    developer = relationship("Developer", back_populates="projects")
    city = relationship("City", back_populates="projects")
    micromarket = relationship("Micromarket", back_populates="projects")
    locality = relationship("Locality", back_populates="projects")
    saved_analyses = relationship("SavedAnalysis", back_populates="project")