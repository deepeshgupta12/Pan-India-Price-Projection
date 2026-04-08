from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Developer(Base):
    __tablename__ = "developers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    developer_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    developer_name: Mapped[str] = mapped_column(String(255), index=True)

    city_presence_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completed_projects_count: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    under_construction_count: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    avg_delivery_delay_months: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    on_time_delivery_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    brand_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    litigation_risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    consumer_sentiment_score: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    premium_index_vs_market: Mapped[float | None] = mapped_column(
        Float, nullable=True
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

    projects = relationship("Project", back_populates="developer")