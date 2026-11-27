"use client";

import { useEffect, useState } from "react";
import { useAdminStatisticsStore } from "@/features/admin/statistics/stores";
import { getDefaultRevenueQuery } from "@/features/admin/statistics/utils";
import {
    LowStockProducts,
    MonthlyRanking,
    OrderStatusBreakdown,
    PaymentBreakdown,
    RevenueChart,
    RevenueMetricCards,
} from "@/features/admin/statistics/components";

export default function AdminStatisticsPage() {
    const [initialRevenueQuery] = useState(getDefaultRevenueQuery);
    const {
        overview,
        revenueStatistics,
        orderStatistics,
        productStatistics,
        customerStatistics,
        isLoading,
        error,
        fetchAll,
        fetchRevenueStatistics,
        clearError,
    } = useAdminStatisticsStore();

    useEffect(() => {
        void fetchAll(initialRevenueQuery);
    }, [fetchAll, initialRevenueQuery]);

    const revenueTrend = revenueStatistics?.revenue_trend ?? [];
    const revenue =
        revenueStatistics?.current_metrics ??
        overview?.revenue_summary ??
        null;
    const orderBreakdown =
        orderStatistics?.status_breakdown ??
        overview?.order_status_stats ??
        [];
    const paymentBreakdown =
        orderStatistics?.payment_breakdown ??
        overview?.payment_method_stats ??
        [];
    const lowStock =
        overview?.low_stock_products ??
        productStatistics?.low_stock_alerts ??
        [];
    const topProducts = productStatistics?.top_selling_month ?? [];
    const topCustomers = customerStatistics?.top_spenders_month ?? [];

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {error && (
                <div className="rounded-xl border border-status-error/20 bg-status-error-bg px-4 py-3 text-sm text-status-error flex items-center justify-between gap-3">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={clearError}
                        className="text-xs font-bold underline underline-offset-2"
                    >
                        Đóng
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-5">
                <RevenueChart
                    revenueTrend={revenueTrend}
                    isLoading={isLoading}
                    initialQuery={initialRevenueQuery}
                    onApply={(query) => void fetchRevenueStatistics(query)}
                />
                <MonthlyRanking
                    topProducts={topProducts}
                    topCustomers={topCustomers}
                />
            </div>

            <RevenueMetricCards revenue={revenue} />

            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-5">
                <LowStockProducts products={lowStock} />
                <OrderStatusBreakdown items={orderBreakdown} />
                <PaymentBreakdown items={paymentBreakdown} />
            </div>
        </div>
    );
}
