"use client";

import { useState, type FormEvent } from "react";
import { Filter } from "lucide-react";
import type {
    RevenueGroupBy,
    RevenueStatisticsQuery,
} from "../types";

interface RevenueDateFilterProps {
    initialQuery: RevenueStatisticsQuery;
    isLoading: boolean;
    onApply: (query: RevenueStatisticsQuery) => void;
}

export function RevenueDateFilter({
    initialQuery,
    isLoading,
    onApply,
}: RevenueDateFilterProps) {
    const [startDate, setStartDate] = useState(initialQuery.start_date);
    const [endDate, setEndDate] = useState(initialQuery.end_date);
    const [groupBy, setGroupBy] = useState<RevenueGroupBy>(
        initialQuery.group_by
    );
    const invalidRange = Boolean(startDate && endDate && startDate > endDate);

    const submitQuery = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!startDate || !endDate || invalidRange) return;
        onApply({
            start_date: startDate,
            end_date: endDate,
            group_by: groupBy,
        });
    };

    return (
        <form
            onSubmit={submitQuery}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_150px_auto] gap-3 mb-4"
        >
            <label className="text-xs font-semibold text-text-sub">
                Từ ngày
                <input
                    type="date"
                    required
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="mt-1 block w-full rounded-lg border border-surface-border bg-surface-bg px-3 py-2 text-sm text-text-main"
                />
            </label>
            <label className="text-xs font-semibold text-text-sub">
                Đến ngày
                <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="mt-1 block w-full rounded-lg border border-surface-border bg-surface-bg px-3 py-2 text-sm text-text-main"
                />
            </label>
            <label className="text-xs font-semibold text-text-sub">
                Nhóm theo
                <select
                    value={groupBy}
                    onChange={(event) => {
                        const value = event.target.value;
                        if (
                            value === "day" ||
                            value === "month" ||
                            value === "year"
                        ) {
                            setGroupBy(value);
                        }
                    }}
                    className="mt-1 block w-full rounded-lg border border-surface-border bg-surface-bg px-3 py-2 text-sm text-text-main"
                >
                    <option value="day">Ngày</option>
                    <option value="month">Tháng</option>
                    <option value="year">Năm</option>
                </select>
            </label>
            <div className="flex items-end">
                <button
                    type="submit"
                    disabled={isLoading || invalidRange}
                    aria-label="Xem thống kê"
                    title="Xem thống kê"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-contrast hover:bg-primary-hover disabled:opacity-50"
                >
                    <Filter className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
            {invalidRange && (
                <p className="sm:col-span-2 xl:col-span-4 text-xs text-status-error">
                    Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.
                </p>
            )}
        </form>
    );
}
