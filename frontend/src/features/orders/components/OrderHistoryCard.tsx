"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp, Package2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import type { OrderSummaryResponse } from "@/features/orders/types";
import { OrderStatusBadge, PaymentStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { canCancelOrder, canCompleteOrder, formatDateTime, formatMoney } from "@/features/orders/utils/orderStatus";

interface OrderHistoryCardProps {
    order: OrderSummaryResponse;
    expanded: boolean;
    onToggle: (orderId: string) => void;
    onComplete: (orderId: string) => void;
    onCancel: (orderId: string) => void;
    isCompleting: boolean;
    isCancelling: boolean;
}

export function OrderHistoryCard({
    order,
    expanded,
    onToggle,
    onComplete,
    onCancel,
    isCompleting,
    isCancelling,
}: OrderHistoryCardProps) {
    const firstItem = order.items?.[0];
    const canUserCancel = canCancelOrder(order.status);
    const canUserComplete = canCompleteOrder(order.status);

    return (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-sm">
            <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Đơn hàng</span>
                            <span className="text-sm font-semibold text-text-main">{order.order_id}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-text-sub">{formatDateTime(order.created_at)}</span>
                            <span className="text-text-muted">•</span>
                            <OrderStatusBadge status={order.status} />
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:items-end">
                        <div className="text-right">
                            <div className="text-xs text-text-muted">Tổng tiền</div>
                            <div className="text-lg font-bold text-text-main">{formatMoney(order.total_amount)}</div>
                        </div>
                        <PaymentStatusBadge status={order.payment_status} />
                    </div>
                </div>

                <div className="mt-4 rounded-2xl border border-surface-border bg-surface-bg p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-surface-border">
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
                                <Package2 className="h-6 w-6 text-text-muted" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-text-main">{firstItem?.product_name ?? "Sản phẩm"}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-sub">
                                <span>SL: {firstItem?.quantity ?? 0}</span>
                                <span>•</span>
                                <span>{firstItem ? formatMoney(firstItem.price) : "--"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {canUserComplete && (
                            <button
                                type="button"
                                onClick={() => onComplete(order.order_id)}
                                disabled={isCompleting}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
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
                                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                            >
                                <XCircle className="h-4 w-4" />
                                {isCancelling ? "Đang hủy..." : "Hủy đơn"}
                            </button>
                        )}

                        {order.status === "COMPLETED" && (
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface-bg px-3 py-2 text-sm font-semibold text-text-main transition hover:bg-surface-bg"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Mua lại
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => onToggle(order.order_id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-bg px-3 py-2 text-sm font-semibold text-text-main transition hover:bg-surface-hover"
                    >
                        {expanded ? "Thu gọn" : "Xem chi tiết"}
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
