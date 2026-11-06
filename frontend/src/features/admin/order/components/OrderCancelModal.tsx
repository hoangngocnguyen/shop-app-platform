"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAdminOrderStore } from "../stores";
import type { AdminCancelReason } from "../types";

interface OrderCancelModalProps {
    isOpen: boolean;
    orderId: string | null;
    onClose: () => void;
}

export const OrderCancelModal: React.FC<OrderCancelModalProps> = ({
    isOpen,
    orderId,
    onClose,
}) => {
    const {
        cancellationReasons,
        fetchCancellationReasons,
        cancelOrder,
        isActionLoading,
    } = useAdminOrderStore();

    const [reasonCode, setReasonCode] = useState<AdminCancelReason | "">("");
    const [detail, setDetail] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setReasonCode("");
            setDetail("");
            setValidationError(null);
            if (cancellationReasons.length === 0) {
                fetchCancellationReasons();
            }
        }
    }, [isOpen, cancellationReasons.length, fetchCancellationReasons]);

    if (!isOpen || !orderId) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reasonCode) {
            setValidationError("Vui lòng chọn một lý do hủy đơn hàng");
            return;
        }

        const success = await cancelOrder(orderId, {
            reason_code: reasonCode,
            detail: detail.trim() || undefined,
        });

        if (success) {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Hủy đơn hàng #${orderId}`}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Cảnh báo */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-status-error-bg/60 border border-status-error/20 text-status-error text-xs">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Lưu ý quan trọng</p>
                        <p className="text-text-sub mt-0.5">
                            Sau khi hủy, đơn hàng sẽ không thể khôi phục lại trạng thái xử lý hoặc giao hàng.
                        </p>
                    </div>
                </div>

                {/* Chọn lý do hủy từ catalog */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-sub">
                        Lý do hủy đơn <span className="text-status-error">*</span>
                    </label>
                    <select
                        value={reasonCode}
                        onChange={(e) => {
                            setReasonCode(e.target.value as AdminCancelReason);
                            setValidationError(null);
                        }}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-bg border border-surface-border rounded-xl text-text-main outline-none hover:border-primary/50 focus:border-primary cursor-pointer transition-all"
                    >
                        <option value="">-- Chọn lý do phù hợp --</option>
                        {cancellationReasons.length > 0 ? (
                            cancellationReasons.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))
                        ) : (
                            <>
                                <option value="OUT_OF_STOCK">Hết hàng trong kho</option>
                                <option value="WRONG_PRICE_OR_INFO">Sai thông tin giá / mô tả sản phẩm</option>
                                <option value="CUSTOMER_REQUESTED">Khách hàng yêu cầu hủy</option>
                                <option value="SUSPICIOUS_ORDER">Đơn hàng có dấu hiệu ảo / gian lận</option>
                                <option value="OTHER">Lý do khác</option>
                            </>
                        )}
                    </select>
                    {validationError && (
                        <p className="text-xs text-status-error font-medium">
                            {validationError}
                        </p>
                    )}
                </div>

                {/* Ghi chú chi tiết */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-sub">
                        Ghi chú bổ sung
                    </label>
                    <textarea
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                        placeholder="Nhập thông tin chi tiết (ví dụ: liên hệ khách xác nhận hết màu, khách hẹn giao dịp khác...)"
                        rows={3}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-bg border border-surface-border rounded-xl text-text-main placeholder:text-text-muted outline-none hover:border-primary/50 focus:border-primary transition-all resize-none"
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isActionLoading}
                        className="px-4 py-2 text-xs sm:text-sm font-semibold text-text-sub hover:bg-surface-hover rounded-xl border border-surface-border transition-colors cursor-pointer"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={isActionLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-status-error hover:bg-status-error/90 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isActionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <XCircle className="w-4 h-4" />
                        )}
                        <span>{isActionLoading ? "Đang xử lý..." : "Xác nhận hủy đơn"}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
};
