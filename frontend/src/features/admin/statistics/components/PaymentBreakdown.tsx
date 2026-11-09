import { CreditCard } from "lucide-react";
import type { PaymentMethodCountItem } from "../types";

interface PaymentBreakdownProps {
    items: PaymentMethodCountItem[];
}

const paymentColors = ["#0f766e", "#f59e0b", "#3b82f6"];

export function PaymentBreakdown({ items }: PaymentBreakdownProps) {
    const totalPayments = items.reduce((sum, item) => sum + item.count, 0);
    let offset = 0;
    const segments = items.map((item, index) => {
        const length = totalPayments ? item.count / totalPayments : 0;
        const segment = {
            offset,
            length,
            color: paymentColors[index % paymentColors.length],
        };
        offset += length;
        return segment;
    });

    return (
        <section className="min-w-0 lg:col-span-4 rounded-2xl border border-surface-border bg-surface-card p-3.5 shadow-xs">
            <h2 className="text-xs font-bold text-status-success flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4" />
                Thanh toán phổ biến
            </h2>
            <div className="flex items-center justify-center min-h-36">
                <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
                    <circle
                        cx="60"
                        cy="60"
                        r="42"
                        fill="none"
                        stroke="var(--color-surface-hover-val)"
                        strokeWidth="16"
                    />
                    {segments.map((segment, index) => (
                        <circle
                            key={index}
                            cx="60"
                            cy="60"
                            r="42"
                            fill="none"
                            stroke={segment.color}
                            strokeWidth="16"
                            strokeDasharray={`${segment.length * 263.89} 263.89`}
                            strokeDashoffset={-segment.offset * 263.89}
                        />
                    ))}
                </svg>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
                {items.map((item, index) => (
                    <div
                        key={item.payment_method}
                        className="flex items-center gap-2 text-[10px] text-text-sub"
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{
                                backgroundColor:
                                    paymentColors[index % paymentColors.length],
                            }}
                        />
                        <span className="flex-1">{item.payment_method}</span>
                        <span className="font-bold text-text-main">
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
