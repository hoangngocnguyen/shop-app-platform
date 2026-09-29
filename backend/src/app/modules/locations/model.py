from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from src.app.core.database import Base


class AdministrativeRegion(Base):
    __tablename__ = "administrative_regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    name_en = Column(String(255), nullable=False)
    code_name = Column(String(255), nullable=True)
    code_name_en = Column(String(255), nullable=True)


class AdministrativeUnit(Base):
    __tablename__ = "administrative_units"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=True)
    full_name_en = Column(String(255), nullable=True)
    short_name = Column(String(255), nullable=True)
    short_name_en = Column(String(255), nullable=True)
    code_name = Column(String(255), nullable=True)
    code_name_en = Column(String(255), nullable=True)


class Province(Base):
    __tablename__ = "provinces"

    code = Column(String(20), primary_key=True)
    name = Column(String(255), nullable=False)
    name_en = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    full_name_en = Column(String(255), nullable=True)
    code_name = Column(String(255), nullable=True)
    postal_code_prefix = Column(String(255), nullable=True)
    administrative_unit_id = Column(
        Integer, ForeignKey("administrative_units.id"), nullable=True
    )

    administrative_unit = relationship("AdministrativeUnit")
    wards = relationship(
        "Ward", back_populates="province", cascade="all, delete-orphan"
    )


class Ward(Base):
    __tablename__ = "wards"

    code = Column(String(20), primary_key=True)
    name = Column(String(255), nullable=False)
    name_en = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    full_name_en = Column(String(255), nullable=True)
    code_name = Column(String(255), nullable=True)
    postal_code = Column(String(20), nullable=True)
    province_code = Column(String(20), ForeignKey("provinces.code"), nullable=True)
    administrative_unit_id = Column(
        Integer, ForeignKey("administrative_units.id"), nullable=True
    )

    province = relationship("Province", back_populates="wards")
    administrative_unit = relationship("AdministrativeUnit")


class VNProvincesMetadata(Base):
    __tablename__ = "vn_provinces_metadata"

    dataset_version = Column(String(50), primary_key=True)
    latest_decree = Column(String(100), nullable=True)
    generated_at = Column(TIMESTAMP, nullable=False)
