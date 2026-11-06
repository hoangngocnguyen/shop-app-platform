"use client";

import React from "react";
import {
    ShoppingCart,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    Package,
} from "lucide-react";
import type { OrderStatus } from "@/features/orders/types";
import { ORDER_STATUS } from "@/features/orders/types";
import { useAdminOrderStore } from "../stores";

interface StatTabItem {
    id: OrderStatus | "ALL";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    activeClass: string;
    badgeBg: string;
}

const STAT_TABS: StatTabItem[] = [
    {
        id: "ALL",
        label: "Tất cả đơn",
        icon: ShoppingCart,
        colorClass: "text-text-main",
        activeClass: "bg-primary text-primary-contrast shadow-brand-sm",
        badgeBg: "bg-surface-hover text-text-sub",
    },
    {
        id: ORDER_STATUS.PENDING,
        label: "Chờ xác nhận",
        icon: Clock,
        colorClass: "text-status-warning",
        activeClass: "bg-status-warning text-white shadow-xs",
        badgeBg: "bg-status-warning-bg text-status-warning",
    },
    {
        id: ORDER_STATUS.PROCESSING,
        label: "Đang xử lý",
        icon: Package,
        colorClass: "text-status-info",
        activeClass: "bg-status-info text-white shadow-xs",
        badgeBg: "bg-status-info-bg text-status-info",
    },
    {
        id: ORDER_STATUS.SHIPPING,
        label: "Đang giao",
        icon: Truck,
        colorClass: "text-primary",
        activeClass: "bg-primary text-white shadow-xs",
        badgeBg: "bg-primary-light text-primary",
    },
    {
        id: ORDER_STATUS.DELIVERED,
        label: "Đã giao",
        icon: CheckCircle2,
        colorClass: "text-status-success",
        activeClass: "bg-status-success text-white shadow-xs",
        badgeBg: "bg-status-success-bg text-status-success",
    },
    {
        id: ORDER_STATUS.CANCELLED,
        label: "Đã hủy",
        icon: XCircle,
        colorClass: "text-status-error",
        activeClass: "bg-status-error text-white shadow-xs",
        badgeBg: "bg-status-error-bg text-status-error",
    },
];

export const OrderStats: React.FC = () => {
    const { statistics, selectedStatus, setSelectedStatus } =
        useAdminOrderStore();

    // Map số lượng từ mảng statistics
    const countMap: Record<string, number> = {};
    statistics.forEach((item) => {
        countMap[item.status] = item.count;
    });

    return (
        <div className="w-full space-y-3">
            {/* Thanh cuộn ngang các Tabs trạng thái */}
            <div className="overflow-x-auto pb-1 scrollbar-none">
                <div className="inline-flex min-w-full items-center gap-1.5 rounded-2xl border border-surface-border bg-surface-card p-1.5 shadow-xs">
                    {STAT_TABS.map((tab) => {
                        const isActive = selectedStatus === tab.id;
                        const count = countMap[tab.id] ?? 0;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSelectedStatus(tab.id)}
                                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                    isActive
                                        ? tab.activeClass
                                        : "text-text-sub hover:bg-surface-hover hover:text-text-main"
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{tab.label}</span>
                                <span
                                    className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${
                                        isActive
                                            ? "bg-white/25 text-white"
                                            : tab.badgeBg
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
