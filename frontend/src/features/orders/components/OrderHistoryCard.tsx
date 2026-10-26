"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp, Package2, CheckCircle2, XCircle, RotateCcw, CreditCard, Loader2 } from "lucide-react";
import type { OrderSummaryResponse } from "@/features/orders/types";
import { OrderStatusBadge, PaymentStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { canCancelOrder, canCompleteOrder, canPayOrder, formatDateTime, formatMoney } from "@/features/orders/utils/orderStatus";

interface OrderHistoryCardProps {
    order: OrderSummaryResponse;
    expanded: boolean;
    onToggle: (orderId: string) => void;
    onComplete: (orderId: string) => void;
    onCancel: (orderId: string) => void;
    onPay?: (orderId: string) => void;
    isCompleting: boolean;
    isCancelling: boolean;
    isPaying?: boolean;
}

export function OrderHistoryCard({
    order,
    expanded,
    onToggle,
    onComplete,
    onCancel,
    onPay,
    isCompleting,
    isCancelling,
    isPaying = false,
}: OrderHistoryCardProps) {
    const firstItem = order.items?.[0];
    const canUserCancel = canCancelOrder(order.status);
    const canUserComplete = canCompleteOrder(order.status);
    const canUserPay = canPayOrder(order.payment_method, order.payment_status, order.status);

    const extraItemsCount = Math.max((order.items?.length ?? 0) - 1, 0);

    return (
        <div className="rounded-xl border border-surface-border bg-surface-card shadow-xs transition-colors hover:border-surface-border/80">
            <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-text-muted">Đơn hàng</span>
                            <span className="font-mono text-xs sm:text-sm font-semibold text-text-main">#{order.order_id}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-text-sub">{formatDateTime(order.created_at)}</span>
                            <span className="text-text-disabled">•</span>
                            <OrderStatusBadge status={order.status} />
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-1.5 sm:items-end">
                        <div className="text-left sm:text-right">
                            <div className="text-[11px] font-medium text-text-muted">Tổng thanh toán</div>
                            <div className="text-base sm:text-lg font-bold text-price">{formatMoney(order.total_amount)}</div>
                        </div>
                        <PaymentStatusBadge status={order.payment_status} />
                    </div>
                </div>

                <div className="mt-3.5 rounded-lg border border-surface-border/60 bg-surface-bg/50 p-2.5 sm:p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-border/50 bg-surface-card">
                            {firstItem?.product_image ? (
                                <Image
                                    src={firstItem.product_image}
                                    alt={firstItem.product_name}
                                    width={56}
                                    height={56}
                                    unoptimized
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Package2 className="h-5 w-5 text-text-muted" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-xs sm:text-sm font-medium text-text-main">{firstItem?.product_name ?? "Sản phẩm"}</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-sub">
                                        <span>SL: {firstItem?.quantity ?? 0}</span>
                                        <span className="text-text-disabled">•</span>
                                        <span>{firstItem ? formatMoney(firstItem.price) : "--"}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onToggle(order.order_id)}
                                    aria-label={expanded ? "Thu gọn chi tiết" : "Xem chi tiết"}
                                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-surface-border bg-surface-card text-text-sub transition-colors hover:bg-surface-hover hover:text-text-main"
                                >
                                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                            </div>

                            {extraItemsCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => onToggle(order.order_id)}
                                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                                >
                                    {expanded ? "Thu gọn" : `+${extraItemsCount} sản phẩm khác`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-3.5 flex justify-end">
                    <div className="flex flex-wrap justify-end gap-2">
                        {canUserPay && onPay && (
                            <button
                                type="button"
                                onClick={() => onPay(order.order_id)}
                                disabled={isPaying}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-contrast shadow-xs transition-colors disabled:opacity-50"
                            >
                                {isPaying ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CreditCard className="h-4 w-4" />
                                )}
                                {isPaying ? "Đang xử lý..." : "Thanh toán ngay"}
                            </button>
                        )}

                        {canUserComplete && (
                            <button
                                type="button"
                                onClick={() => onComplete(order.order_id)}
                                disabled={isCompleting}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-contrast shadow-xs transition-colors disabled:opacity-50"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {isCompleting ? "Đang xử lý..." : "Đã nhận hàng"}
                            </button>
                        )}

                        {canUserCancel && (
                            <button
                                type="button"
                                onClick={() => onCancel(order.order_id)}
                                disabled={isCancelling}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-status-error/25 bg-status-error-bg hover:bg-status-error-bg/80 px-3 py-1.5 text-xs sm:text-sm font-medium text-status-error transition-colors disabled:opacity-50"
                            >
                                <XCircle className="h-4 w-4" />
                                {isCancelling ? "Đang hủy..." : "Hủy đơn"}
                            </button>
                        )}

                        {order.status === "COMPLETED" && (
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-hover px-3 py-1.5 text-xs sm:text-sm font-medium text-text-main transition-colors"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Mua lại
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
