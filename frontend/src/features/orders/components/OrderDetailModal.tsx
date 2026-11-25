"use client";

import { CheckCircle2, CreditCard, Loader2, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { OrderDetailResponse } from "@/features/orders/types";
import { OrderHistoryExpandPanel } from "@/features/orders/components/OrderHistoryExpandPanel";
import { canPayOrder } from "@/features/orders/utils/orderStatus";
import { canCancelOrder, canCompleteOrder } from "@/features/orders/utils/orderStatus";

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderDetailResponse | null;
    loading?: boolean;
    onPay?: (orderId: string) => void;
    isPaying?: boolean;
    onCancel?: (orderId: string) => void;
    onComplete?: (orderId: string) => void;
    isCancelling?: boolean;
    isCompleting?: boolean;
}

export function OrderDetailModal({
    isOpen,
    onClose,
    order,
    loading = false,
    onPay,
    isPaying = false,
    onCancel,
    onComplete,
    isCancelling = false,
    isCompleting = false,
}: OrderDetailModalProps) {
    const canPay = order && canPayOrder(order.payment_method, order.payment_status, order.status);
    const canCancel = order && canCancelOrder(order.status);
    const canComplete = order && canCompleteOrder(order.status);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={order ? `Đơn hàng ${order.order_id}` : "Chi tiết đơn hàng"}
            maxWidth="2xl"
        >
            <div className="max-h-[70vh] overflow-y-auto pr-1">
                <OrderHistoryExpandPanel order={order} loading={loading} />
            </div>

            {order && (canPay && onPay || canCancel && onCancel || canComplete && onComplete) && (
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-surface-border pt-4">
                    <div className="flex flex-wrap gap-2">
                    {canCancel && onCancel && <button type="button" onClick={() => onCancel(order.order_id)} disabled={isCancelling} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-status-error/25 bg-status-error-bg px-4 py-2 text-xs sm:text-sm font-medium text-status-error disabled:opacity-50"><XCircle className="h-4 w-4" />{isCancelling ? "Đang hủy..." : "Hủy đơn"}</button>}
                    {canComplete && onComplete && <button type="button" onClick={() => onComplete(order.order_id)} disabled={isCompleting} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-primary-contrast disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />{isCompleting ? "Đang xử lý..." : "Đã nhận hàng"}</button>}
                    {canPay && onPay && <button
                        type="button"
                        onClick={() => onPay(order.order_id)}
                        disabled={isPaying}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs sm:text-sm font-medium text-primary-contrast shadow-xs transition-colors disabled:opacity-50"
                    >
                        {isPaying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CreditCard className="h-4 w-4" />
                        )}
                        {isPaying ? "Đang chuyển hướng..." : "Thanh toán ngay"}
                    </button>}
                    </div>
                </div>
            )}
        </Modal>
    );
}
