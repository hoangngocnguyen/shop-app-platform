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

    // Track lần mở để reset state và fetch lại
    const prevIsOpenRef = useRef(false);

    useEffect(() => {
        const wasOpen = prevIsOpenRef.current;
        prevIsOpenRef.current = isOpen;

        // Chỉ hành động khi modal vừa mở (false → true)
        if (!isOpen || wasOpen) return;

        // Reset form
        setSelectedReason("");
        setCustomReason("");
        setError(null);
        setReasons([]);

        // Fetch danh sách lý do
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
            <div className="space-y-5">
                {/* Warning banner */}
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Sau khi hủy, đơn hàng sẽ không thể khôi phục. Bạn có thể đặt lại nếu muốn.</span>
                </div>

                {/* Reason list */}
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-text-main">
                        Lý do hủy đơn <span className="text-rose-500">*</span>
                    </p>

                    {isLoadingReasons ? (
                        <div className="flex items-center gap-2 py-6 text-sm text-text-sub">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Đang tải danh sách lý do...</span>
                        </div>
                    ) : reasons.length === 0 ? (
                        <p className="py-4 text-sm text-text-muted">Không có lý do nào khả dụng.</p>
                    ) : (
                        <div className="space-y-2">
                            {reasons.map((reason) => (
                                <label
                                    key={reason.value}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${selectedReason === reason.value
                                            ? "border-rose-400 bg-rose-50"
                                            : "border-surface-border bg-surface-bg hover:border-rose-200 hover:bg-rose-50/40"
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
                                        className="h-4 w-4 accent-rose-600"
                                    />
                                    <span className="text-sm text-text-main">{reason.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Custom reason textarea */}
                {needsCustomReason && (
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-text-main">
                            Lý do cụ thể <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            value={customReason}
                            onChange={(e) => {
                                setCustomReason(e.target.value);
                                setError(null);
                            }}
                            placeholder="Nhập lý do hủy cụ thể của bạn..."
                            rows={3}
                            className="w-full resize-none rounded-xl border border-surface-border bg-surface-bg px-4 py-3 text-sm text-text-main placeholder:text-text-muted transition focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        />
                    </div>
                )}

                {/* Error message */}
                {error && <p className="text-sm text-rose-600">{error}</p>}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl border border-surface-border bg-surface-bg px-4 py-2.5 text-sm font-semibold text-text-main transition hover:bg-surface-hover disabled:opacity-60"
                    >
                        Quay lại
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isLoadingReasons || !selectedReason}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
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
