import type { OrderStatus } from "@/features/orders/types";
import { ORDER_STATUS_OPTIONS, getStatusLabel } from "@/features/orders/utils/orderStatus";

interface OrderHistoryTabsProps {
    activeStatus: OrderStatus | "ALL";
    onChange: (status: OrderStatus | "ALL") => void;
    counts?: Partial<Record<OrderStatus | "ALL", number>>;
}

export function OrderHistoryTabs({ activeStatus, onChange, counts }: OrderHistoryTabsProps) {
    const tabs: Array<{ value: OrderStatus | "ALL"; label: string }> = [
        { value: "ALL", label: "Tất cả" },
        ...ORDER_STATUS_OPTIONS.map((status) => ({ value: status, label: getStatusLabel(status) })),
    ];

    return (
        <div className="overflow-x-auto scrollbar-none">
            <div className="flex min-w-max items-center gap-1.5 rounded-xl border border-surface-border bg-surface-card p-1.5 shadow-xs">
                {tabs.map((tab) => {
                    const isActive = tab.value === activeStatus;
                    const count = counts?.[tab.value] ?? 0;

                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => onChange(tab.value)}
                            className={[
                                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-contrast shadow-xs"
                                    : "text-text-sub hover:bg-surface-hover hover:text-text-main",
                            ].join(" ")}
                        >
                            <span>{tab.label}</span>
                            {count > 0 && (
                                <span
                                    className={[
                                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                                        isActive ? "bg-white/20 text-white" : "bg-surface-hover text-text-sub",
                                    ].join(" ")}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
