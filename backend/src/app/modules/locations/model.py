from datetime import datetime

from sqlalchemy import TIMESTAMP, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base


class AdministrativeRegion(Base):
    __tablename__ = "administrative_regions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    code_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    code_name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)


class AdministrativeUnit(Base):
    __tablename__ = "administrative_units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    short_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    short_name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    code_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    code_name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)


class Province(Base):
    __tablename__ = "provinces"

    code: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    code_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    postal_code_prefix: Mapped[str | None] = mapped_column(String(255), nullable=True)

    administrative_unit_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("administrative_units.id"), nullable=True
    )

    # Relationships với type hint rõ ràng cho IDE
    administrative_unit: Mapped[AdministrativeUnit | None] = relationship(
        "AdministrativeUnit"
    )
    wards: Mapped[list["Ward"]] = relationship(
        "Ward", back_populates="province", cascade="all, delete-orphan"
    )


class Ward(Base):
    __tablename__ = "wards"

    code: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    code_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)

    province_code: Mapped[str | None] = mapped_column(
        String(20),
        ForeignKey("provinces.code"),
        nullable=True,
        index=True,
    )
    administrative_unit_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("administrative_units.id"), nullable=True
    )

    # Relationships
    province: Mapped[Province | None] = relationship("Province", back_populates="wards")
    administrative_unit: Mapped[AdministrativeUnit | None] = relationship(
        "AdministrativeUnit"
    )


class VNProvincesMetadata(Base):
    __tablename__ = "vn_provinces_metadata"

    dataset_version: Mapped[str] = mapped_column(String(50), primary_key=True)
    latest_decree: Mapped[str | None] = mapped_column(String(100), nullable=True)
    generated_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
