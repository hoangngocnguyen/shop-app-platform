"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { orderApi } from "@/features/orders/api";
import type { CancellationReasonOption, CustomerCancelReason } from "@/features/orders/types";

interface CancelOrderModalProps {
    isOpen: boolean;
    orderId: string | null;
    onClose: () => void;
    onConfirm: (orderId: string, reasonCode: CustomerCancelReason, customReason?: string) => Promise<void>;
    isSubmitting: boolean;
}

export function CancelOrderModal({
    isOpen,
    orderId,
    onClose,
    onConfirm,
    isSubmitting,
}: CancelOrderModalProps) {
    const [reasons, setReasons] = useState<CancellationReasonOption<CustomerCancelReason>[]>([]);
    const [isLoadingReasons, setIsLoadingReasons] = useState(false);
    const [selectedReason, setSelectedReason] = useState<CustomerCancelReason | "">("");
    const [customReason, setCustomReason] = useState("");
    const [error, setError] = useState<string | null>(null);

    const prevIsOpenRef = useRef(false);

    useEffect(() => {
        const wasOpen = prevIsOpenRef.current;
        prevIsOpenRef.current = isOpen;

        if (!isOpen || wasOpen) return;

        setSelectedReason("");
        setCustomReason("");
        setError(null);
        setReasons([]);

        let cancelled = false;
        setIsLoadingReasons(true);

        orderApi
            .getCancellationReasons()
            .then((catalog) => {
                if (!cancelled) setReasons(catalog.items ?? []);
            })
            .catch(() => {
                if (!cancelled) setError("Không thể tải danh sách lý do hủy. Vui lòng thử lại.");
            })
            .finally(() => {
                if (!cancelled) setIsLoadingReasons(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen]);

    const selectedOption = reasons.find((r) => r.value === selectedReason);
    const needsCustomReason = selectedOption?.requires_custom_reason ?? false;

    const handleSubmit = async () => {
        if (!orderId) return;
        if (!selectedReason) {
            setError("Vui lòng chọn lý do hủy đơn.");
            return;
        }
        if (needsCustomReason && !customReason.trim()) {
            setError("Vui lòng nhập lý do cụ thể.");
            return;
        }
        setError(null);
        await onConfirm(
            orderId,
            selectedReason as CustomerCancelReason,
            needsCustomReason ? customReason.trim() : undefined,
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Hủy đơn hàng" maxWidth="md">
            <div className="space-y-4">
                {/* Warning banner */}
                <div className="flex items-start gap-2.5 rounded-lg border border-status-error/25 bg-status-error-bg p-3 text-xs sm:text-sm text-status-error">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Sau khi hủy, đơn hàng sẽ không thể khôi phục. Bạn có thể đặt lại nếu muốn.</span>
                </div>

                {/* Reason list */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-sub">
                        Lý do hủy đơn <span className="text-status-error">*</span>
                    </p>

                    {isLoadingReasons ? (
                        <div className="flex items-center gap-2 py-4 text-xs sm:text-sm text-text-sub">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Đang tải danh sách lý do...</span>
                        </div>
                    ) : reasons.length === 0 ? (
                        <p className="py-3 text-xs sm:text-sm text-text-muted">Không có lý do nào khả dụng.</p>
                    ) : (
                        <div className="space-y-1.5">
                            {reasons.map((reason) => (
                                <label
                                    key={reason.value}
                                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs sm:text-sm transition-colors ${selectedReason === reason.value
                                            ? "border-status-error/40 bg-status-error-bg/30 text-text-main"
                                            : "border-surface-border bg-surface-bg/40 text-text-sub hover:bg-surface-hover hover:text-text-main"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="cancel-reason"
                                        value={reason.value}
                                        checked={selectedReason === reason.value}
                                        onChange={() => {
                                            setSelectedReason(reason.value);
                                            setCustomReason("");
                                            setError(null);
                                        }}
                                        className="h-4 w-4 accent-status-error"
                                    />
                                    <span>{reason.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Custom reason textarea */}
                {needsCustomReason && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-text-sub">
                            Lý do cụ thể <span className="text-status-error">*</span>
                        </label>
                        <textarea
                            value={customReason}
                            onChange={(e) => {
                                setCustomReason(e.target.value);
                                setError(null);
                            }}
                            placeholder="Nhập lý do hủy cụ thể của bạn..."
                            rows={3}
                            className="w-full resize-none rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs sm:text-sm text-text-main placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                    </div>
                )}

                {/* Error message */}
                {error && <p className="text-xs sm:text-sm text-status-error">{error}</p>}

                {/* Actions */}
                <div className="flex justify-end gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-lg border border-surface-border bg-surface-card hover:bg-surface-hover px-4 py-2 text-xs sm:text-sm font-medium text-text-main transition-colors disabled:opacity-50"
                    >
                        Quay lại
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isLoadingReasons || !selectedReason}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-status-error hover:bg-status-error/90 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang hủy...
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4" />
                                Xác nhận hủy đơn
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
