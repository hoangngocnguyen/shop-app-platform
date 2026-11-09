from datetime import UTC, date, datetime, time, timedelta
from decimal import Decimal
from typing import Literal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.app.modules.admin.statistics.schema import (
    AdminOverviewResponse,
    CustomerStatisticsResponse,
    MonthlyRevenueItem,
    OrderStatisticsResponse,
    OrderStatusCountItem,
    PaymentMethodCountItem,
    ProductInventoryItem,
    ProductStatisticsResponse,
    RevenueOverview,
    RevenueStatisticsResponse,
    RevenueTrendItem,
    TopCustomerItem,
    TopSellingProductItem,
)
from src.app.modules.orders.enums.order_enums import (
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from src.app.modules.orders.model import Order, OrderDetail
from src.app.modules.products.model import Product
from src.app.modules.users.model import User


class AdminStatisticsService:
    """Business logic cho cac thong ke quan tri."""

    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _money(value: Decimal | int | None) -> Decimal:
        return Decimal(str(value or 0)).quantize(Decimal("0.01"))

    @staticmethod
    def _month_bounds(value: datetime) -> tuple[datetime, datetime]:
        start = value.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = (
            start.replace(year=start.year + 1, month=1)
            if start.month == 12
            else start.replace(month=start.month + 1)
        )
        return start, end

    @staticmethod
    def _year_bounds(value: datetime) -> tuple[datetime, datetime]:
        start = value.replace(
            month=1, day=1, hour=0, minute=0, second=0, microsecond=0
        )
        return start, start.replace(year=start.year + 1)

    @staticmethod
    def _trend_periods(
        start: date,
        end: date,
        group_by: Literal["day", "month", "year"],
    ) -> list[str]:
        if group_by == "year":
            return [str(year) for year in range(start.year, end.year + 1)]

        periods: list[str] = []
        current = start if group_by == "day" else start.replace(day=1)
        final = end if group_by == "day" else end.replace(day=1)
        date_format = "%Y-%m-%d" if group_by == "day" else "%Y-%m"
        while current <= final:
            periods.append(current.strftime(date_format))
            if group_by == "day":
                current += timedelta(days=1)
            elif current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)
        return periods

    def _revenue_for_period(self, start: datetime, end: datetime) -> Decimal:
        stmt = select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.payment_status == PaymentStatus.PAID.value,
            Order.order_date >= start,
            Order.order_date < end,
        )
        return self._money(self.db.scalar(stmt))

    def _get_revenue_overview(self, now: datetime) -> RevenueOverview:
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today_start + timedelta(days=1)
        week_start = today_start - timedelta(days=today_start.weekday())
        month_start, _ = self._month_bounds(now)
        year_start, year_end = self._year_bounds(now)

        return RevenueOverview(
            today_revenue=self._revenue_for_period(today_start, tomorrow),
            week_revenue=self._revenue_for_period(week_start, tomorrow),
            month_revenue=self._revenue_for_period(month_start, tomorrow),
            year_revenue=self._revenue_for_period(year_start, year_end),
        )

    def _get_order_status_breakdown(self) -> list[OrderStatusCountItem]:
        stmt = select(Order.status, func.count(Order.order_id)).group_by(Order.status)
        counts = {str(status): count for status, count in self.db.execute(stmt).all()}
        return [
            OrderStatusCountItem(status=status, count=counts.get(status.value, 0))
            for status in OrderStatus
        ]

    def _get_payment_breakdown(self) -> list[PaymentMethodCountItem]:
        stmt = (
            select(Order.payment_method, func.count(Order.order_id))
            .group_by(Order.payment_method)
        )
        counts = {
            str(method): count for method, count in self.db.execute(stmt).all()
        }
        return [
            PaymentMethodCountItem(
                payment_method=method,
                count=counts.get(method.value, 0),
            )
            for method in PaymentMethod
        ]

    def get_admin_overview(
        self,
        now: datetime | None = None,
    ) -> AdminOverviewResponse:
        now = now or datetime.now(UTC)
        return AdminOverviewResponse(
            revenue_summary=self._get_revenue_overview(now),
            order_status_stats=self._get_order_status_breakdown(),
            payment_method_stats=self._get_payment_breakdown(),
            low_stock_products=self.get_low_stock_products(),
        )

    def get_overview(
        self,
        now: datetime | None = None,
    ) -> AdminOverviewResponse:
        return self.get_admin_overview(now)

    def get_revenue_statistics(
        self,
        now: datetime | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        group_by: Literal["day", "month", "year"] = "month",
    ) -> RevenueStatisticsResponse:
        now = now or datetime.now(UTC)
        start_date = start_date or date(now.year, 1, 1)
        end_date = end_date or now.date()
        year_start, year_end = self._year_bounds(now)

        monthly_stmt = (
            select(
                func.extract("month", Order.order_date),
                func.sum(Order.total),
            )
            .where(
                Order.payment_status == PaymentStatus.PAID.value,
                Order.order_date >= year_start,
                Order.order_date < year_end,
            )
            .group_by(func.extract("month", Order.order_date))
        )
        monthly_values = {
            int(month): self._money(revenue)
            for month, revenue in self.db.execute(monthly_stmt).all()
        }

        trend_start = datetime.combine(start_date, time.min, tzinfo=UTC)
        trend_end = datetime.combine(end_date + timedelta(days=1), time.min, tzinfo=UTC)
        period = func.date_trunc(group_by, Order.order_date)
        trend_stmt = (
            select(period, func.sum(Order.total))
            .where(
                Order.payment_status == PaymentStatus.PAID.value,
                Order.order_date >= trend_start,
                Order.order_date < trend_end,
            )
            .group_by(period)
        )
        date_format = {"day": "%Y-%m-%d", "month": "%Y-%m", "year": "%Y"}[group_by]
        trend_values = {
            value.strftime(date_format): self._money(revenue)
            for value, revenue in self.db.execute(trend_stmt).all()
        }

        return RevenueStatisticsResponse(
            current_metrics=self._get_revenue_overview(now),
            monthly_revenue=[
                MonthlyRevenueItem(
                    month=month,
                    revenue=monthly_values.get(month, Decimal("0.00")),
                )
                for month in range(1, 13)
            ],
            revenue_trend=[
                RevenueTrendItem(
                    period=value,
                    revenue=trend_values.get(value, Decimal("0.00")),
                )
                for value in self._trend_periods(start_date, end_date, group_by)
            ],
        )

    def get_order_statistics(self) -> OrderStatisticsResponse:
        return OrderStatisticsResponse(
            status_breakdown=self._get_order_status_breakdown(),
            payment_breakdown=self._get_payment_breakdown(),
        )

    def get_low_stock_products(self, limit: int = 5) -> list[ProductInventoryItem]:
        stmt = (
            select(Product)
            .where(Product.quantity <= 5)
            .order_by(Product.quantity, Product.product_id)
            .limit(limit)
        )
        return [
            ProductInventoryItem(
                product_id=product.product_id,
                product_name=product.product_name,
                quantity=product.quantity,
                image_src=product.image_src,
            )
            for product in self.db.scalars(stmt).all()
        ]

    def get_top_selling_products(
        self,
        now: datetime | None = None,
        limit: int = 5,
    ) -> list[TopSellingProductItem]:
        now = now or datetime.now(UTC)
        month_start, month_end = self._month_bounds(now)
        quantity = func.sum(OrderDetail.quantity)
        revenue = func.sum(OrderDetail.quantity * OrderDetail.price)
        stmt = (
            select(
                Product.product_id,
                Product.product_name,
                Product.image_src,
                quantity.label("sold_quantity"),
                revenue.label("revenue"),
            )
            .join(OrderDetail, OrderDetail.product_id == Product.product_id)
            .join(Order, Order.order_id == OrderDetail.order_id)
            .where(
                Order.payment_status == PaymentStatus.PAID.value,
                Order.order_date >= month_start,
                Order.order_date < month_end,
            )
            .group_by(Product.product_id, Product.product_name, Product.image_src)
            .order_by(quantity.desc(), Product.product_id)
            .limit(limit)
        )
        return [
            TopSellingProductItem(
                product_id=row.product_id,
                product_name=row.product_name,
                sold_quantity=int(row.sold_quantity or 0),
                revenue=self._money(row.revenue),
                image_src=row.image_src,
            )
            for row in self.db.execute(stmt).all()
        ]

    def get_product_statistics(
        self,
        now: datetime | None = None,
    ) -> ProductStatisticsResponse:
        return ProductStatisticsResponse(
            top_selling_month=self.get_top_selling_products(now=now),
            low_stock_alerts=self.get_low_stock_products(),
        )

    def get_top_customers(
        self,
        now: datetime | None = None,
        limit: int = 5,
    ) -> list[TopCustomerItem]:
        now = now or datetime.now(UTC)
        month_start, month_end = self._month_bounds(now)
        total_spent = func.sum(Order.total)
        order_count = func.count(Order.order_id)
        stmt = (
            select(
                User.user_id,
                User.name,
                User.username,
                User.email,
                User.avatar_url,
                total_spent.label("total_spent"),
                order_count.label("order_count"),
            )
            .join(Order, Order.user_id == User.user_id)
            .where(
                Order.payment_status == PaymentStatus.PAID.value,
                Order.order_date >= month_start,
                Order.order_date < month_end,
            )
            .group_by(
                User.user_id,
                User.name,
                User.username,
                User.email,
                User.avatar_url,
            )
            .order_by(total_spent.desc(), order_count.desc())
            .limit(limit)
        )
        return [
            TopCustomerItem(
                user_id=row.user_id,
                name=row.name,
                username=row.username,
                email=row.email,
                avatar_url=row.avatar_url,
                total_spent=self._money(row.total_spent),
                order_count=int(row.order_count or 0),
            )
            for row in self.db.execute(stmt).all()
        ]

    def get_customer_statistics(
        self,
        now: datetime | None = None,
    ) -> CustomerStatisticsResponse:
        return CustomerStatisticsResponse(
            top_spenders_month=self.get_top_customers(now=now),
        )
