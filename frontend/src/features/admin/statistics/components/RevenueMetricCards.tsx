import type { RevenueOverview } from "../types";
import { formatMoney } from "../utils";

interface RevenueMetricCardsProps {
    revenue: RevenueOverview | null;
}

export function RevenueMetricCards({ revenue }: RevenueMetricCardsProps) {
    const metrics = [
        {
            label: "Doanh thu hôm nay",
            value: formatMoney(revenue?.today_revenue ?? 0),
        },
        {
            label: "Doanh thu tuần này",
            value: formatMoney(revenue?.week_revenue ?? 0),
        },
        {
            label: "Doanh thu tháng này",
            value: formatMoney(revenue?.month_revenue ?? 0),
        },
        {
            label: "Doanh thu năm nay",
            value: formatMoney(revenue?.year_revenue ?? 0),
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {metrics.map((metric) => {
                return (
                    <div
                        key={metric.label}
                        className="rounded-xl border border-surface-border bg-surface-card px-4 py-3 shadow-xs"
                    >
                        <p className="text-xs font-semibold text-text-sub">
                            {metric.label}
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-text-main mt-1">
                            {metric.value}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
