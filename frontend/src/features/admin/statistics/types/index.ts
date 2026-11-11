import type { OrderStatus, PaymentMethod } from "@/features/orders/types";

export type { OrderStatus, PaymentMethod };

export interface RevenueOverview {
    today_revenue: number | string;
    week_revenue: number | string;
    month_revenue: number | string;
    year_revenue: number | string;
}

export interface OrderStatusCountItem {
    status: OrderStatus;
    count: number;
}

export interface PaymentMethodCountItem {
    payment_method: PaymentMethod;
    count: number;
}

export interface ProductInventoryItem {
    product_id: number;
    product_name: string;
    quantity: number;
    image_src: string | null;
}

export interface MonthlyRevenueItem {
    month: number;
    revenue: number | string;
}

export type RevenueGroupBy = "day" | "month" | "year";

export interface RevenueStatisticsQuery {
    start_date: string;
    end_date: string;
    group_by: RevenueGroupBy;
}

export interface AdminOverviewQuery {
    low_stock_limit?: number;
}

export interface ProductStatisticsQuery {
    top_selling_limit?: number;
    low_stock_limit?: number;
}

export interface CustomerStatisticsQuery {
    limit?: number;
}

export interface RevenueTrendItem {
    period: string;
    revenue: number | string;
}

export interface TopSellingProductItem {
    product_id: number;
    product_name: string;
    sold_quantity: number;
    revenue: number | string;
    image_src: string | null;
}

export interface TopCustomerItem {
    user_id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    avatar_url: string | null;
    total_spent: number | string;
    order_count: number;
}

export interface AdminOverviewResponse {
    revenue_summary: RevenueOverview;
    order_status_stats: OrderStatusCountItem[];
    payment_method_stats: PaymentMethodCountItem[];
    low_stock_products: ProductInventoryItem[];
}

export interface RevenueStatisticsResponse {
    current_metrics: RevenueOverview;
    monthly_revenue: MonthlyRevenueItem[];
    revenue_trend: RevenueTrendItem[];
}

export interface OrderStatisticsResponse {
    status_breakdown: OrderStatusCountItem[];
    payment_breakdown: PaymentMethodCountItem[];
}

export interface ProductStatisticsResponse {
    top_selling_month: TopSellingProductItem[];
    low_stock_alerts: ProductInventoryItem[];
}

export interface CustomerStatisticsResponse {
    top_spenders_month: TopCustomerItem[];
}