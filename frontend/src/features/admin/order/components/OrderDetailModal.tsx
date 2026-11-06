"use client";

import React from "react";
import Image from "next/image";
import {
    Calendar,
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    PackageCheck,
    Phone,
    ShieldAlert,
    Truck,
    User,
    XCircle,
    Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAdminOrderStore } from "../stores";
import { ORDER_STATUS } from "@/features/orders/types";
import {
    formatMoney,
    getOrderStatusClass,
    getPaymentStatusClass,
    getStatusLabel,
    getPaymentStatusLabel,
} from "@/features/orders/utils/orderStatus";

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenCancelModal: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
    isOpen,
    onClose,
    onOpenCancelModal,
}) => {
    const {
        selectedOrder: order,
        isDetailLoading,
        confirmOrders,
        startShippingOrders,
        completeDeliveryOrders,
        isActionLoading,
    } = useAdminOrderStore();

    if (!isOpen) return null;

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "Chưa cập nhật";
        try {
            return new Intl.DateTimeFormat("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    };

    const handleQuickAction = async (action: "confirm" | "shipping" | "delivered") => {
        if (!order) return;
        if (action === "confirm") {
            await confirmOrders([order.order_id]);
        } else if (action === "shipping") {
            await startShippingOrders([order.order_id]);
        } else if (action === "delivered") {
            await completeDeliveryOrders([order.order_id]);
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={order ? `Chi tiết đơn hàng #${order.order_id}` : "Chi tiết đơn hàng"}
            maxWidth="2xl"
        >
            {isDetailLoading || !order ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-sub">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                    <p className="text-sm">Đang tải toàn bộ thông tin đơn hàng...</p>
                </div>
            ) : (
                <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
                    {/* 1. Header Badges & Thông tin tóm tắt */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-surface-bg border border-surface-border">
                        <div>
                            <span className="text-xs text-text-muted">Ngày đặt đơn</span>
                            <div className="font-semibold text-text-main text-xs sm:text-sm flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                <span>{formatDate(order.created_at)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${getOrderStatusClass(
                                    order.status
                                )}`}
                            >
                                {getStatusLabel(order.status)}
                            </span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${getPaymentStatusClass(
                                    order.payment_status
                                )}`}
                            >
                                {getPaymentStatusLabel(order.payment_status)}
                            </span>
                        </div>
                    </div>

                    {/* 2. Cảnh báo đơn bị hủy (nếu có) */}
                    {order.status === ORDER_STATUS.CANCELLED && (
                        <div className="p-4 rounded-2xl bg-status-error-bg/60 border border-status-error/30 text-status-error space-y-1">
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span>Đơn hàng đã bị hủy</span>
                            </div>
                            <p className="text-xs text-text-sub">
                                <strong className="text-text-main">Lý do:</strong>{" "}
                                {order.cancel_reason || "Không có lý do cụ thể"}
                            </p>
                            <p className="text-xs text-text-sub">
                                <strong className="text-text-main">Người hủy:</strong>{" "}
                                {order.cancelled_by_type || "Hệ thống"} •{" "}
                                {formatDate(order.cancelled_at)}
                            </p>
                        </div>
                    )}

                    {/* 3. Thông tin người nhận & Địa chỉ giao hàng */}
                    <div className="rounded-2xl border border-surface-border bg-surface-card p-4 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                            Thông tin nhận hàng
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                            <div className="space-y-1">
                                <div className="text-text-muted flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    <span>Người nhận:</span>
                                </div>
                                <p className="font-semibold text-text-main">
                                    {order.shipping_recipient_name}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <div className="text-text-muted flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>Số điện thoại:</span>
                                </div>
                                <p className="font-semibold text-text-main">
                                    {order.shipping_phone}
                                </p>
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                                <div className="text-text-muted flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Địa chỉ giao hàng:</span>
                                </div>
                                <p className="font-medium text-text-main">
                                    {order.shipping_address_line},{" "}
                                    {order.shipping_ward_name},{" "}
                                    {order.shipping_province_name}
                                </p>
                            </div>

                            {order.note && (
                                <div className="sm:col-span-2 space-y-1 bg-surface-bg p-2.5 rounded-xl border border-surface-border">
                                    <span className="text-text-muted text-[11px] font-semibold">
                                        Ghi chú từ khách hàng:
                                    </span>
                                    <p className="text-text-main text-xs italic">
                                        &ldquo;{order.note}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Danh sách sản phẩm trong đơn */}
                    <div className="rounded-2xl border border-surface-border bg-surface-card p-4 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                            Danh sách sản phẩm ({order.order_details.length})
                        </h4>
                        <div className="divide-y divide-surface-border">
                            {order.order_details.map((item, idx) => (
                                <div
                                    key={`detail-item-${idx}`}
                                    className="flex items-center justify-between py-3 gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-surface-border bg-surface-bg flex items-center justify-center">
                                            {item.product_image ? (
                                                <Image
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Package className="w-6 h-6 text-text-muted" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-text-main text-xs sm:text-sm line-clamp-1">
                                                {item.product_name}
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                Đơn giá: {formatMoney(item.price)} • Số lượng: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="font-extrabold text-xs sm:text-sm text-text-main">
                                            {formatMoney(item.total_price)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tổng kết tiền */}
                        <div className="border-t border-surface-border pt-3 space-y-1.5 text-xs sm:text-sm">
                            <div className="flex justify-between text-text-sub">
                                <span>Tiền hàng:</span>
                                <span>{formatMoney(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-text-sub">
                                <span>Phí vận chuyển:</span>
                                <span>{formatMoney(order.shipping_fee)}</span>
                            </div>
                            <div className="flex justify-between font-extrabold text-base text-rose-600 dark:text-rose-400 border-t border-dashed border-surface-border pt-2">
                                <span>Tổng thanh toán:</span>
                                <span>{formatMoney(order.total_amount)}</span>
                            </div>
                            <div className="text-[11px] text-text-muted text-right">
                                Phương thức:{" "}
                                <strong>
                                    {order.payment_method === "BANK_TRANSFER"
                                        ? "Chuyển khoản VietQR"
                                        : order.payment_method === "VNPAY"
                                        ? "Cổng VNPAY"
                                        : "Thanh toán khi nhận hàng (COD)"}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* 5. Timeline Nhật ký tiến trình (Order Logs) */}
                    {order.order_logs && order.order_logs.length > 0 && (
                        <div className="rounded-2xl border border-surface-border bg-surface-card p-4 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                Nhật ký trạng thái ({order.order_logs.length})
                            </h4>
                            <div className="relative pl-6 space-y-4 border-l-2 border-surface-border ml-2">
                                {order.order_logs.map((log, index) => (
                                    <div key={`log-${index}`} className="relative text-xs">
                                        <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-surface-card" />
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${getOrderStatusClass(
                                                    log.status
                                                )}`}
                                            >
                                                {getStatusLabel(log.status)}
                                            </span>
                                            <span className="text-[11px] text-text-muted">
                                                {formatDate(log.timestamp)}
                                            </span>
                                        </div>
                                        {log.note && (
                                            <p className="text-text-sub mt-1">
                                                {log.note}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 6. Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border pt-4">
                        <div>
                            {order.status !== ORDER_STATUS.DELIVERED &&
                                order.status !== ORDER_STATUS.COMPLETED &&
                                order.status !== ORDER_STATUS.CANCELLED && (
                                    <button
                                        type="button"
                                        disabled={isActionLoading}
                                        onClick={() => {
                                            onOpenCancelModal(order.order_id);
                                            onClose();
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-status-error hover:bg-status-error-bg rounded-xl border border-status-error/30 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>Hủy đơn này</span>
                                    </button>
                                )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs sm:text-sm font-semibold text-text-sub hover:bg-surface-hover rounded-xl border border-surface-border transition-colors cursor-pointer"
                            >
                                Đóng
                            </button>

                            {order.status === ORDER_STATUS.PENDING && (
                                <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleQuickAction("confirm")}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-status-info hover:bg-status-info/90 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Xác nhận xử lý</span>
                                </button>
                            )}

                            {order.status === ORDER_STATUS.PROCESSING && (
                                <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleQuickAction("shipping")}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <Truck className="w-4 h-4" />
                                    <span>Bắt đầu giao</span>
                                </button>
                            )}

                            {order.status === ORDER_STATUS.SHIPPING && (
                                <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleQuickAction("delivered")}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-status-success hover:bg-status-success/90 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <PackageCheck className="w-4 h-4" />
                                    <span>Đã giao thành công</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
