import type { RevenueStatisticsQuery } from "./types";

export type StatisticsMoney = number | string;

export const getDefaultRevenueQuery = (): RevenueStatisticsQuery => {
    const today = new Date().toISOString().slice(0, 10);
    return {
        start_date: `${today.slice(0, 4)}-01-01`,
        end_date: today,
        group_by: "month",
    };
};

export const formatMoney = (value: StatisticsMoney) => {
    const amount = typeof value === "string" ? Number(value) : value;
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
};

export const formatShortMoney = (value: StatisticsMoney) => {
    const amount = typeof value === "string" ? Number(value) : value;
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(0)}K`;
    }
    return String(amount || 0);
};
