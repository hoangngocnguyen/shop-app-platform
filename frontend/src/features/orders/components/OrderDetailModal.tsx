"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { OrderDetailResponse } from "@/features/orders/types";
import { OrderHistoryExpandPanel } from "@/features/orders/components/OrderHistoryExpandPanel";
import { canPayOrder } from "@/features/orders/utils/orderStatus";

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderDetailResponse | null;
    loading?: boolean;
    onPay?: (orderId: string) => void;
    isPaying?: boolean;
}

export function OrderDetailModal({
    isOpen,
    onClose,
    order,
    loading = false,
    onPay,
    isPaying = false,
}: OrderDetailModalProps) {
    const canPay = order && canPayOrder(order.payment_method, order.payment_status, order.status);

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

            {canPay && onPay && (
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-surface-border pt-4">
                    <div className="text-xs text-text-sub text-center sm:text-left">
                        Đơn hàng chưa hoàn tất thanh toán qua cổng VNPAY.
                    </div>
                    <button
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
                    </button>
                </div>
            )}
        </Modal>
    );
}
