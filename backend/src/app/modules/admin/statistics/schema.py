from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from src.app.modules.orders.enums.order_enums import OrderStatus, PaymentMethod


class RevenueOverview(BaseModel):
    """Doanh thu tong quan theo cac moc thoi gian."""

    today_revenue: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        description="Doanh thu hom nay",
        examples=[Decimal("12500000.00")],
    )
    week_revenue: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        description="Doanh thu tuan nay",
        examples=[Decimal("86000000.00")],
    )
    month_revenue: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        description="Doanh thu thang nay",
        examples=[Decimal("350000000.00")],
    )
    year_revenue: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        description="Doanh thu nam nay",
        examples=[Decimal("2100000000.00")],
    )

    model_config = ConfigDict(from_attributes=True)


class OrderStatusCountItem(BaseModel):
    """So luong don hang theo tung trang thai."""

    status: OrderStatus = Field(..., description="Trang thai don hang")
    count: int = Field(..., ge=0, description="So luong don hang")

    model_config = ConfigDict(from_attributes=True)


class PaymentMethodCountItem(BaseModel):
    """So luong don hang theo tung phuong thuc thanh toan."""

    payment_method: PaymentMethod = Field(
        ...,
        description="Phuong thuc thanh toan",
    )
    count: int = Field(..., ge=0, description="So luong don hang")

    model_config = ConfigDict(from_attributes=True)


class ProductInventoryItem(BaseModel):
    """Thong tin ton kho cua san pham."""

    product_id: int = Field(..., description="Ma san pham", examples=[1])
    product_name: str = Field(
        ...,
        description="Ten san pham",
        examples=["iPhone 15 Pro Max 256GB"],
    )
    quantity: int = Field(..., ge=0, description="So luong ton kho", examples=[3])
    image_src: str | None = Field(
        default=None,
        description="Duong dan hinh anh san pham",
    )

    model_config = ConfigDict(from_attributes=True)


class MonthlyRevenueItem(BaseModel):
    """Doanh thu chi tiet theo tung thang trong nam hien tai."""

    month: int = Field(..., ge=1, le=12, description="Thang tu 1 den 12")
    revenue: Decimal = Field(
        ...,
        ge=0,
        description="Doanh thu trong thang",
        examples=[Decimal("285000000.00")],
    )

    model_config = ConfigDict(from_attributes=True)


class RevenueTrendItem(BaseModel):
    """Doanh thu theo mot khoang thoi gian da duoc gom nhom."""

    period: str = Field(
        ...,
        description="Ngay (YYYY-MM-DD), thang (YYYY-MM) hoac nam (YYYY)",
        examples=["2026-03"],
    )
    revenue: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        description="Tong doanh thu da thanh toan trong ky",
        examples=[Decimal("12500000.00")],
    )

    model_config = ConfigDict(from_attributes=True)


class TopSellingProductItem(BaseModel):
    """San pham ban chay nhat trong thang hien tai."""

    product_id: int = Field(..., description="Ma san pham", examples=[1])
    product_name: str = Field(
        ...,
        description="Ten san pham",
        examples=["iPhone 15 Pro Max 256GB"],
    )
    sold_quantity: int = Field(
        ...,
        ge=0,
        description="So luong san pham da ban trong thang",
        examples=[42],
    )
    revenue: Decimal = Field(
        ...,
        ge=0,
        description="Doanh thu cua san pham trong thang",
        examples=[Decimal("1259000000.00")],
    )
    image_src: str | None = Field(
        default=None,
        description="Duong dan hinh anh san pham",
    )

    model_config = ConfigDict(from_attributes=True)


class TopCustomerItem(BaseModel):
    """Khach hang chi tieu nhieu nhat trong thang hien tai."""

    user_id: UUID = Field(..., description="Ma dinh danh khach hang")
    name: str | None = Field(
        default=None,
        description="Ten khach hang",
        examples=["Nguyen Van A"],
    )
    username: str | None = Field(
        default=None,
        description="Ten dang nhap",
        examples=["nguyenvana"],
    )
    email: str | None = Field(
        default=None,
        description="Dia chi email",
        examples=["nguyenvana@example.com"],
    )
    total_spent: Decimal = Field(
        ...,
        ge=0,
        description="Tong so tien khach hang da chi trong thang",
        examples=[Decimal("45800000.00")],
    )
    order_count: int = Field(
        ...,
        ge=0,
        description="Tong so don hang cua khach hang trong thang",
        examples=[12],
    )

    model_config = ConfigDict(from_attributes=True)


class AdminOverviewResponse(BaseModel):
    """Du lieu tong quan cho trang Dashboard quan tri."""

    revenue_summary: RevenueOverview = Field(...)
    order_status_stats: list[OrderStatusCountItem] = Field(default_factory=list)
    payment_method_stats: list[PaymentMethodCountItem] = Field(default_factory=list)
    low_stock_products: list[ProductInventoryItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class RevenueStatisticsResponse(BaseModel):
    """Thong ke doanh thu chi tiet."""

    current_metrics: RevenueOverview = Field(...)
    monthly_revenue: list[MonthlyRevenueItem] = Field(default_factory=list)
    revenue_trend: list[RevenueTrendItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class OrderStatisticsResponse(BaseModel):
    """Thong ke chuyen sau ve don hang."""

    status_breakdown: list[OrderStatusCountItem] = Field(default_factory=list)
    payment_breakdown: list[PaymentMethodCountItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ProductStatisticsResponse(BaseModel):
    """Thong ke san pham va tinh trang ton kho."""

    top_selling_month: list[TopSellingProductItem] = Field(default_factory=list)
    low_stock_alerts: list[ProductInventoryItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class CustomerStatisticsResponse(BaseModel):
    """Thong ke khach hang VIP trong thang hien tai."""

    top_spenders_month: list[TopCustomerItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
