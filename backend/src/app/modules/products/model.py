from decimal import Decimal

from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base
from src.app.modules.categories.model import Category  # noqa: F401


class Product(Base):
    __tablename__ = "products"

    # PK
    product_id: Mapped[int] = mapped_column(
        "product_id", Integer, primary_key=True, autoincrement=True
    )

    # NN (Not Null)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(38, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sold: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Nullable (Có thể để trống)
    discount_percent: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sale_price: Mapped[Decimal | None] = mapped_column(Numeric(38, 2), nullable=True)
    rating: Mapped[Decimal | None] = mapped_column(
        Numeric(38, 2), nullable=True, default=0.0
    )
    brand: Mapped[str | None] = mapped_column(String(255), nullable=True)
    origin: Mapped[str | None] = mapped_column(String(255), nullable=True)
    image_src: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # FK (Foreign Key)
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    category = relationship("Category", back_populates="products")
