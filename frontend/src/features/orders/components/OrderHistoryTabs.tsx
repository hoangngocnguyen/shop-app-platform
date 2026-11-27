import { useEffect, useRef } from "react";
import type { OrderStatus } from "@/features/orders/types";
import { ORDER_STATUS_OPTIONS, getStatusLabel } from "@/features/orders/utils/orderStatus";

interface OrderHistoryTabsProps {
    activeStatus: OrderStatus | "ALL";
    onChange: (status: OrderStatus | "ALL") => void;
    counts?: Partial<Record<OrderStatus | "ALL", number>>;
}

export function OrderHistoryTabs({ activeStatus, onChange, counts }: OrderHistoryTabsProps) {
    const tabsScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = tabsScrollRef.current;
        if (!container) return;

        const handleWheel = (event: WheelEvent) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

            event.preventDefault();
            event.stopPropagation();

            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            container.scrollLeft = Math.max(0, Math.min(maxScrollLeft, container.scrollLeft + event.deltaY));
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, []);

    const tabs: Array<{ value: OrderStatus | "ALL"; label: string }> = [
        { value: "ALL", label: "Tất cả" },
        ...ORDER_STATUS_OPTIONS.map((status) => ({ value: status, label: getStatusLabel(status) })),
    ];

    return (
        <div ref={tabsScrollRef} className="overflow-x-auto scrollbar-none">
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
                                "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-error focus-visible:ring-offset-2",
                                isActive
                                    ? "bg-primary text-primary-contrast shadow-xs"
                                    : "text-text-sub hover:bg-surface-hover hover:text-primary",
                            ].join(" ")}
                        >
                            <span>{tab.label}</span>
                            {count > 0 && (
                                <span
                                    className={[
                                        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[9px] font-semibold leading-none tabular-nums",
                                        "bg-status-error text-white",
                                    ].join(" ")}
                                >
                                    {count > 99 ? "99+" : count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
