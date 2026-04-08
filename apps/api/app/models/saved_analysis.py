from datetime import datetime

from sqlalchemy import (
    JSON,
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


class SavedAnalysis(Base):
    __tablename__ = "saved_analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    analysis_name: Mapped[str] = mapped_column(String(255), index=True)

    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id"), nullable=True, index=True
    )
    city_id: Mapped[int | None] = mapped_column(
        ForeignKey("cities.id"), nullable=True, index=True
    )
    micromarket_id: Mapped[int | None] = mapped_column(
        ForeignKey("micromarkets.id"), nullable=True, index=True
    )
    locality_id: Mapped[int | None] = mapped_column(
        ForeignKey("localities.id"), nullable=True, index=True
    )

    input_payload: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    output_payload: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    scenario_payload: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)

    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    data_completeness_score: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

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

    project = relationship("Project", back_populates="saved_analyses")
    city = relationship("City", back_populates="saved_analyses")
    micromarket = relationship("Micromarket", back_populates="saved_analyses")
    locality = relationship("Locality", back_populates="saved_analyses")