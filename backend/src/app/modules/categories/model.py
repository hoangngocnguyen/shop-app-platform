from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from src.app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    # PK, NN - Mã định danh danh mục
    category_id = Column(Integer, primary_key=True, autoincrement=True)

    # NN - Tên danh mục (Duy nhất)
    category_name = Column(String(255), nullable=False, unique=True)

    # FK - Mã danh mục cha (cho danh mục đa cấp)
    parent_id = Column(
        Integer,
        ForeignKey("categories.category_id", ondelete="SET NULL"),
        nullable=True,
    )

    # NN - Đường dẫn tối ưu SEO (Duy nhất)
    slug = Column(String(255), nullable=False, unique=True, index=True)

    # Self-referencing Relationship (Quan hệ danh mục cha - con)
    parent = relationship("Category", remote_side=[category_id], backref="children")

    # Quan hệ 1-N với Product (nếu có)
    products = relationship("Product", back_populates="category")
