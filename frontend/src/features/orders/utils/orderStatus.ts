import {
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    PAYMENT_STATUS,
    PAYMENT_STATUS_LABELS,
    type OrderStatus,
    type PaymentStatus,
} from "@/features/orders/types";

export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS) as OrderStatus[];
export const PAYMENT_STATUS_OPTIONS = Object.values(PAYMENT_STATUS) as PaymentStatus[];

export const STATUS_STYLES: Record<OrderStatus, string> = {
    [ORDER_STATUS.PENDING]: "border border-amber-200 bg-amber-50 text-amber-700",
    [ORDER_STATUS.PROCESSING]: "border border-sky-200 bg-sky-50 text-sky-700",
    [ORDER_STATUS.SHIPPING]: "border border-indigo-200 bg-indigo-50 text-indigo-700",
    [ORDER_STATUS.DELIVERED]: "border border-teal-200 bg-teal-50 text-teal-700",
    [ORDER_STATUS.COMPLETED]: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    [ORDER_STATUS.CANCELLED]: "border border-rose-200 bg-rose-50 text-rose-700",
    [ORDER_STATUS.RETURNED]: "border border-slate-200 bg-slate-100 text-slate-700",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
    [PAYMENT_STATUS.PENDING]: "border border-amber-200 bg-amber-50 text-amber-700",
    [PAYMENT_STATUS.PAID]: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    [PAYMENT_STATUS.FAILED]: "border border-rose-200 bg-rose-50 text-rose-700",
    [PAYMENT_STATUS.REFUNDED]: "border border-slate-200 bg-slate-100 text-slate-700",
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
    if (!status) return "border border-slate-200 bg-slate-100 text-slate-700";
    if (status in PAYMENT_STATUS_STYLES) {
        return PAYMENT_STATUS_STYLES[status as PaymentStatus];
    }
    return STATUS_STYLES[status as OrderStatus] ?? "border border-slate-200 bg-slate-100 text-slate-700";
}

export function getPaymentStatusClass(status?: string | null): string {
    if (!status) return "border border-slate-200 bg-slate-100 text-slate-700";
    return PAYMENT_STATUS_STYLES[status as PaymentStatus] ?? "border border-slate-200 bg-slate-100 text-slate-700";
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
