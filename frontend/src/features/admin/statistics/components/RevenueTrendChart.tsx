"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import type {
    RevenueGroupBy,
    RevenueTrendItem,
} from "../types";
import { formatMoney, formatShortMoney } from "../utils";

interface RevenueTrendChartProps {
    items: RevenueTrendItem[];
    groupBy: RevenueGroupBy;
}

const ApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
    loading: () => <div className="h-[190px]" />,
});

const formatPeriodLabel = (period: string, groupBy: RevenueGroupBy) => {
    if (groupBy === "day") {
        const [, month, day] = period.split("-");
        return `${day}/${month}`;
    }
    if (groupBy === "month") {
        const [, month] = period.split("-");
        return `T${Number(month)}`;
    }
    return period;
};

export function RevenueTrendChart({ items, groupBy }: RevenueTrendChartProps) {
    const { categories, values } = useMemo(() => {
        const chartValues = items.map((item) => {
            const value = typeof item.revenue === "string"
                ? Number(item.revenue)
                : item.revenue;
            return Number.isFinite(value) ? value : 0;
        });
        return {
            categories: items.map((item) =>
                formatPeriodLabel(item.period, groupBy)
            ),
            values: chartValues,
        };
    }, [groupBy, items]);

    const options = useMemo<ApexOptions>(
        () => ({
            chart: {
                type: "area",
                height: 190,
                toolbar: { show: false },
                zoom: { enabled: false },
                fontFamily: "inherit",
                foreColor: "var(--color-text-muted-val)",
            },
            colors: ["#0f766e"],
            dataLabels: { enabled: false },
            stroke: {
                curve: "smooth",
                width: 2.5,
            },
            fill: {
                type: "gradient",
                gradient: {
                    opacityFrom: 0.18,
                    opacityTo: 0.02,
                    stops: [0, 100],
                },
            },
            grid: {
                borderColor: "var(--color-surface-border-val)",
                strokeDashArray: 0,
            },
            markers: {
                size: 4,
                strokeWidth: 2,
                strokeColors: "#ffffff",
                hover: { size: 5 },
            },
            xaxis: {
                categories,
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    rotate: 0,
                    hideOverlappingLabels: true,
                },
            },
            yaxis: {
                labels: {
                    formatter: (value) => formatShortMoney(value ?? 0),
                },
            },
            tooltip: {
                y: {
                    formatter: (value) => formatMoney(value ?? 0),
                },
            },
        }),
        [categories]
    );

    return (
        <div
            className="w-full min-w-0"
            role="img"
            aria-label={`Biểu đồ doanh thu theo ${groupBy}`}
        >
            <ApexChart
                type="area"
                height={190}
                options={options}
                series={[{ name: "Doanh thu", data: values }]}
            />
        </div>
    );
}
