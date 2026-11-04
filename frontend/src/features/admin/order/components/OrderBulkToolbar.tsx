"use client";

import React, { useState } from "react";
import { CheckCircle2, Truck, PackageCheck, X, AlertTriangle } from "lucide-react";
import { useAdminOrderStore } from "../stores";
import { ORDER_STATUS } from "@/features/orders/types";

export const OrderBulkToolbar: React.FC = () => {
    const {
        selectedOrderIds,
        selectedStatus,
        clearSelection,
        confirmOrders,
        startShippingOrders,
        completeDeliveryOrders,
        isActionLoading,
    } = useAdminOrderStore();

    const [confirmAction, setConfirmAction] = useState<
        "confirm" | "shipping" | "delivered" | null
    >(null);

    if (selectedOrderIds.length === 0) return null;

    const count = selectedOrderIds.length;

    const handleExecuteAction = async () => {
        if (!confirmAction) return;

        if (confirmAction === "confirm") {
            await confirmOrders(selectedOrderIds);
        } else if (confirmAction === "shipping") {
            await startShippingOrders(selectedOrderIds);
        } else if (confirmAction === "delivered") {
            await completeDeliveryOrders(selectedOrderIds);
        }
        setConfirmAction(null);
    };

    return (
        <>
            {/* Thanh công cụ nổi dính phía dưới màn hình */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-surface-card border-2 border-primary/30 rounded-2xl shadow-brand-lg backdrop-blur-md">
                    {/* Thông tin số lượng */}
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-contrast font-black text-xs">
                            {count}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-text-main">
                            đơn hàng được chọn
                        </span>
                    </div>

                    {/* Nhóm nút hành động */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Nút Xác nhận đơn hàng (PENDING hoặc ALL) */}
                        {(selectedStatus === "ALL" ||
                            selectedStatus === ORDER_STATUS.PENDING) && (
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => setConfirmAction("confirm")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-status-info hover:bg-status-info/90 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Xác nhận ({count})</span>
                            </button>
                        )}

                        {/* 2. Nút Bắt đầu giao (PROCESSING hoặc ALL) */}
                        {(selectedStatus === "ALL" ||
                            selectedStatus === ORDER_STATUS.PROCESSING) && (
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => setConfirmAction("shipping")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                                <Truck className="w-4 h-4" />
                                <span>Giao hàng ({count})</span>
                            </button>
                        )}

                        {/* 3. Nút Đã giao (SHIPPING hoặc ALL) */}
                        {(selectedStatus === "ALL" ||
                            selectedStatus === ORDER_STATUS.SHIPPING) && (
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => setConfirmAction("delivered")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-status-success hover:bg-status-success/90 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                                <PackageCheck className="w-4 h-4" />
                                <span>Đã giao ({count})</span>
                            </button>
                        )}

                        {/* Nút Hủy chọn */}
                        <button
                            type="button"
                            onClick={clearSelection}
                            disabled={isActionLoading}
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-text-sub hover:text-text-main hover:bg-surface-hover rounded-xl border border-surface-border transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Bỏ chọn</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal xác nhận thao tác hàng loạt */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface-card p-6 shadow-brand-lg animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-status-warning mb-4">
                            <div className="p-2.5 rounded-xl bg-status-warning-bg">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-text-main">
                                    Xác nhận thao tác hàng loạt
                                </h3>
                                <p className="text-xs text-text-muted">
                                    Thao tác này sẽ áp dụng cho {count} đơn hàng đã chọn
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-text-sub mb-6">
                            {confirmAction === "confirm" &&
                                "Bạn có chắc chắn muốn xác nhận xử lý cho các đơn hàng này? Đối với các đơn chuyển khoản VietQR, hệ thống sẽ tự động cập nhật thanh toán thành công."}
                            {confirmAction === "shipping" &&
                                "Bạn có chắc chắn muốn chuyển các đơn hàng này sang trạng thái đang vận chuyển?"}
                            {confirmAction === "delivered" &&
                                "Bạn có chắc chắn muốn chuyển các đơn hàng này sang trạng thái đã giao thành công? Các đơn COD sẽ tự động cập nhật thành đã thanh toán."}
                        </p>

                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setConfirmAction(null)}
                                disabled={isActionLoading}
                                className="px-4 py-2 text-xs sm:text-sm font-semibold text-text-sub hover:bg-surface-hover rounded-xl border border-surface-border transition-colors cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteAction}
                                disabled={isActionLoading}
                                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isActionLoading ? "Đang xử lý..." : "Xác nhận thực hiện"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
