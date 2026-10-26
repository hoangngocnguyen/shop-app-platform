import {
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    PAYMENT_METHOD,
    PAYMENT_STATUS,
    PAYMENT_STATUS_LABELS,
    type OrderStatus,
    type PaymentStatus,
} from "@/features/orders/types";

export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS) as OrderStatus[];
export const PAYMENT_STATUS_OPTIONS = Object.values(PAYMENT_STATUS) as PaymentStatus[];

export const STATUS_STYLES: Record<OrderStatus, string> = {
    [ORDER_STATUS.PENDING]: "border border-status-warning/25 bg-status-warning-bg text-status-warning",
    [ORDER_STATUS.PROCESSING]: "border border-status-info/25 bg-status-info-bg text-status-info",
    [ORDER_STATUS.SHIPPING]: "border border-status-info/35 bg-status-info-bg text-status-info",
    [ORDER_STATUS.DELIVERED]: "border border-primary/25 bg-primary-light text-primary",
    [ORDER_STATUS.COMPLETED]: "border border-status-success/25 bg-status-success-bg text-status-success",
    [ORDER_STATUS.CANCELLED]: "border border-status-error/25 bg-status-error-bg text-status-error",
    [ORDER_STATUS.RETURNED]: "border border-surface-border bg-surface-hover text-text-sub",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
    [PAYMENT_STATUS.PENDING]: "border border-status-warning/25 bg-status-warning-bg text-status-warning",
    [PAYMENT_STATUS.PAID]: "border border-status-success/25 bg-status-success-bg text-status-success",
    [PAYMENT_STATUS.FAILED]: "border border-status-error/25 bg-status-error-bg text-status-error",
    [PAYMENT_STATUS.REFUNDED]: "border border-surface-border bg-surface-hover text-text-sub",
};

export function getStatusLabel(status?: string | null): string {
    if (!status) return "Không xác định";
    if (status in PAYMENT_STATUS_LABELS) {
        return PAYMENT_STATUS_LABELS[status as PaymentStatus];
    }
    return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}

export function getPaymentStatusLabel(status?: string | null): string {
    if (!status) return "Không xác định";
    return PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? status;
}

export function getOrderStatusClass(status?: string | null): string {
    if (!status) return "border border-surface-border bg-surface-hover text-text-sub";
    if (status in PAYMENT_STATUS_STYLES) {
        return PAYMENT_STATUS_STYLES[status as PaymentStatus];
    }
    return STATUS_STYLES[status as OrderStatus] ?? "border border-surface-border bg-surface-hover text-text-sub";
}

export function getPaymentStatusClass(status?: string | null): string {
    if (!status) return "border border-surface-border bg-surface-hover text-text-sub";
    return PAYMENT_STATUS_STYLES[status as PaymentStatus] ?? "border border-surface-border bg-surface-hover text-text-sub";
}

export function formatMoney(value: number | string | null | undefined): string {
    const numericValue = typeof value === "number" ? value : Number(String(value ?? 0).replace(/[^0-9.-]+/g, ""));
    if (Number.isNaN(numericValue)) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(numericValue);
}

export function formatDateTime(dateValue?: string | null): string {
    if (!dateValue) return "--";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function canCancelOrder(status?: string | null): boolean {
    if (!status) return false;
    return ([ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING] as OrderStatus[]).includes(
        status as OrderStatus,
    );
}

export function canCompleteOrder(status?: string | null): boolean {
    if (!status) return false;
    return ([ORDER_STATUS.SHIPPING, ORDER_STATUS.DELIVERED] as OrderStatus[]).includes(
        status as OrderStatus,
    );
}

export function canPayOrder(
    paymentMethod?: string | null,
    paymentStatus?: string | null,
    orderStatus?: string | null
): boolean {
    if (!paymentMethod || !orderStatus) return false;

    // 1. Chỉ các phương thức thanh toán Online mới cho phép thanh toán lại (tránh COD)
    const ONLINE_PAYMENT_METHODS = [PAYMENT_METHOD.VNPAY]; // Sau này có thể thêm MOMO, ZALOPAY...
    const isOnlinePayment = ONLINE_PAYMENT_METHODS.includes(paymentMethod.toUpperCase() as any);

    // 2. Kiểm tra trạng thái thanh toán (Chưa trả tiền và Chưa bị hoàn tiền)
    const isPaid = paymentStatus?.toUpperCase() === PAYMENT_STATUS.PAID;
    const isRefunded = paymentStatus?.toUpperCase() === PAYMENT_STATUS.REFUNDED;

    // 3. Các trạng thái đơn hàng KHÔNG ĐƯỢC PHÉP thanh toán lại nữa
    const BLOCKED_ORDER_STATUSES: string[] = [
        ORDER_STATUS.CANCELLED,
        ORDER_STATUS.COMPLETED,
        ORDER_STATUS.RETURNED,
        ORDER_STATUS.SHIPPING,
        ORDER_STATUS.PROCESSING
    ];

    const isBlockedStatus = BLOCKED_ORDER_STATUSES.includes(orderStatus.toUpperCase());

    return isOnlinePayment && !isPaid && !isRefunded && !isBlockedStatus;
}
