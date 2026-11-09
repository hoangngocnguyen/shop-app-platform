"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import type {
    RevenueGroupBy,
    RevenueStatisticsQuery,
    RevenueTrendItem,
} from "../types";
import { RevenueDateFilter } from "./RevenueDateFilter";
import { RevenueTrendChart } from "./RevenueTrendChart";

interface RevenueChartProps {
    revenueTrend: RevenueTrendItem[];
    isLoading: boolean;
    initialQuery: RevenueStatisticsQuery;
    onApply: (query: RevenueStatisticsQuery) => void;
}

const groupLabels: Record<RevenueGroupBy, string> = {
    day: "Ngày",
    month: "Tháng",
    year: "Năm",
};

const formatDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
};

export function RevenueChart({
    revenueTrend,
    isLoading,
    initialQuery,
    onApply,
}: RevenueChartProps) {
    const [appliedQuery, setAppliedQuery] = useState(initialQuery);

    const applyQuery = (query: RevenueStatisticsQuery) => {
        setAppliedQuery(query);
        onApply(query);
    };

    return (
        <section className="min-w-0 rounded-2xl border border-surface-border bg-surface-card p-4 sm:p-5 shadow-xs">
            <div className="mb-4">
                <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Doanh thu theo{" "}
                    {groupLabels[appliedQuery.group_by].toLowerCase()}
                </h2>
            </div>

            <RevenueDateFilter
                initialQuery={initialQuery}
                isLoading={isLoading}
                onApply={applyQuery}
            />

            <p className="mb-2 text-[11px] text-text-muted">
                Khoảng thời gian: {formatDate(appliedQuery.start_date)} –{" "}
                {formatDate(appliedQuery.end_date)}
            </p>

            {revenueTrend.length === 0 ? (
                <div className="flex h-[190px] items-center justify-center text-sm text-text-muted">
                    Không có dữ liệu doanh thu trong khoảng thời gian này.
                </div>
            ) : (
                <RevenueTrendChart
                    items={revenueTrend}
                    groupBy={appliedQuery.group_by}
                />
            )}
        </section>
    );
}
