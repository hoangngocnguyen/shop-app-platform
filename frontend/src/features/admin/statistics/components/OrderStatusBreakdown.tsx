import { Package } from "lucide-react";
import type { OrderStatus, OrderStatusCountItem } from "../types";

interface OrderStatusBreakdownProps {
    items: OrderStatusCountItem[];
}

const statusLabels: Record<OrderStatus, string> = {
    PENDING: "Chờ xử lý",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    RETURNED: "Đã trả hàng",
};

const statusColors: Record<OrderStatus, string> = {
    PENDING: "#f59e0b",
    PROCESSING: "#3b82f6",
    SHIPPING: "#0f766e",
    DELIVERED: "#10b981",
    COMPLETED: "#8b5cf6",
    CANCELLED: "#ef4444",
    RETURNED: "#64748b",
};

export function OrderStatusBreakdown({ items }: OrderStatusBreakdownProps) {
    const totalOrders = items.reduce((sum, item) => sum + item.count, 0);

    return (
        <section className="min-w-0 lg:col-span-4 rounded-2xl border border-surface-border bg-surface-card p-3.5 shadow-xs">
            <h2 className="text-xs font-bold text-status-info flex items-center gap-2 mb-3">
                <Package className="w-4 h-4" />
                Trạng thái đơn hàng
            </h2>
            <div className="space-y-2.5">
                {items.map((item) => {
                    const percent = totalOrders
                        ? Math.round((item.count / totalOrders) * 100)
                        : 0;
                    return (
                        <div key={item.status}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[11px] text-text-sub">
                                    {statusLabels[item.status] ?? item.status}
                                </span>
                                <span className="text-[10px] text-text-muted">
                                    {item.count} ({percent}%)
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${percent}%`,
                                        backgroundColor:
                                            statusColors[item.status] ??
                                            "#94a3b8",
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
                {items.length === 0 && (
                    <div className="py-8 text-center text-xs text-text-muted">
                        Chưa có dữ liệu
                    </div>
                )}
            </div>
        </section>
    );
}
