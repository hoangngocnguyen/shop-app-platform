"use client";

import { Modal } from "@/components/ui/Modal";
import type { OrderDetailResponse } from "@/features/orders/types";
import { OrderHistoryExpandPanel } from "@/features/orders/components/OrderHistoryExpandPanel";

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderDetailResponse | null;
    loading?: boolean;
}

export function OrderDetailModal({
    isOpen,
    onClose,
    order,
    loading = false,
}: OrderDetailModalProps) {
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
        </Modal>
    );
}
