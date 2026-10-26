import type { OrderStatus, PaymentStatus } from "@/features/orders/types";
import { getOrderStatusClass, getPaymentStatusClass, getStatusLabel, getPaymentStatusLabel } from "@/features/orders/utils/orderStatus";

interface OrderStatusBadgeProps {
    status?: string | null;
    className?: string;
}

export function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
    const resolvedClassName = getOrderStatusClass(status);

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${resolvedClassName} ${className}`.trim()}
        >
            {getStatusLabel(status)}
        </span>
    );
}

interface PaymentStatusBadgeProps {
    status?: string | null;
    className?: string;
}

export function PaymentStatusBadge({ status, className = "" }: PaymentStatusBadgeProps) {
    const resolvedClassName = getPaymentStatusClass(status);

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${resolvedClassName} ${className}`.trim()}
        >
            {getPaymentStatusLabel(status)}
        </span>
    );
}

export type { OrderStatus, PaymentStatus };
