"use client";

import Image from "next/image";
import { CalendarClock, MapPin, Package2, Truck, XCircle } from "lucide-react";
import { ORDER_STATUS, type OrderDetailResponse } from "@/features/orders/types";
import { formatDateTime, formatMoney, getPaymentStatusClass, getPaymentStatusLabel, getStatusLabel } from "@/features/orders/utils/orderStatus";

interface OrderHistoryExpandPanelProps {
    order: OrderDetailResponse | null;
    loading?: boolean;
}

export function OrderHistoryExpandPanel({ order, loading = false }: OrderHistoryExpandPanelProps) {
    if (!order) return null;

    const isCancelled = order.status === "CANCELLED";

    return (
        <div className="bg-surface-card">
            {loading ? (
                <div className="rounded-xl border border-dashed border-surface-border bg-surface-bg/50 p-6 text-center text-xs sm:text-sm text-text-sub">
                    Đang tải chi tiết đơn hàng...
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-3.5 sm:grid-cols-2">
                        {/* Địa chỉ nhận hàng */}
                        <div className="rounded-xl border border-surface-border bg-surface-bg/40 p-3.5 sm:p-4">
                            <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-sub">
                                <MapPin className="h-4 w-4 text-primary" />
                                Địa chỉ nhận hàng
                            </div>
                            <div className="space-y-1.5 text-xs sm:text-sm text-text-sub">
                                <p className="font-semibold text-text-main">
                                    {order.shipping_recipient_name}
                                    {order.shipping_phone && ` (${order.shipping_phone})`}
                                </p>
                                <p className="leading-relaxed">
                                    {[
                                        order.shipping_address_line,
                                        order.shipping_ward_name,
                                        order.shipping_province_name,
                                    ]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                                {order.note && (
                                    <p className="mt-2 rounded-lg bg-surface-card border border-surface-border/60 px-3 py-1.5 text-xs italic text-text-muted">
                                        Ghi chú: {order.note}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Tình trạng đơn hàng */}
                        <div className="rounded-xl border border-surface-border bg-surface-bg/40 p-3.5 sm:p-4">
                            <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-sub">
                                <Truck className="h-4 w-4 text-primary" />
                                Tình trạng đơn hàng
                            </div>
                            <div className="space-y-2 text-xs sm:text-sm text-text-sub">
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-surface-border/50 bg-surface-card px-3 py-1.5">
                                    <span className="text-text-muted">Trạng thái</span>
                                    <span className="rounded-full px-2 py-0.5 text-xs font-medium">
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-surface-border/50 bg-surface-card px-3 py-1.5">
                                    <span className="text-text-muted">Thanh toán</span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentStatusClass(order.payment_status)}`}>
                                        {getPaymentStatusLabel(order.payment_status)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-surface-border/50 bg-surface-card px-3 py-1.5">
                                    <span className="text-text-muted">Ngày đặt</span>
                                    <span className="font-medium text-text-main">{formatDateTime(order.created_at)}</span>
                                </div>
                                {order.estimated_delivery_date && (
                                    <div className="flex items-center justify-between gap-2 rounded-lg border border-surface-border/50 bg-surface-card px-3 py-1.5">
                                        <span className="text-text-muted">Dự kiến giao</span>
                                        <span className="font-medium text-text-main">{formatDateTime(order.estimated_delivery_date)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lý do hủy đơn nếu có */}
                    {isCancelled && order.cancel_reason && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-status-error/25 bg-status-error-bg p-3.5 text-xs sm:text-sm text-status-error">
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                                <p className="font-semibold">Lý do hủy đơn</p>
                                <p className="mt-0.5 text-status-error/90">{order.cancel_reason}</p>
                            </div>
                        </div>
                    )}

                    {/* Danh sách sản phẩm */}
                    <div className="rounded-xl border border-surface-border bg-surface-bg/40 p-3.5 sm:p-4">
                        <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-sub">
                            <Package2 className="h-4 w-4 text-primary" />
                            Sản phẩm trong đơn
                        </div>
                        <div className="space-y-2.5">
                            {order.order_details.map((item) => (
                                <div key={`${order.order_id}-${item.product_id}`} className="flex gap-3 rounded-lg border border-surface-border/60 bg-surface-card p-3">
                                    <div className="flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-border/50 bg-surface-bg">
                                        {item.product_image ? (
                                            <Image
                                                src={item.product_image}
                                                alt={item.product_name}
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
                                        <p className="text-xs sm:text-sm font-medium text-text-main">{item.product_name}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-sub">
                                            <span>Số lượng: {item.quantity}</span>
                                            <span className="text-text-disabled">•</span>
                                            <span>Đơn giá: {formatMoney(item.price)}</span>
                                        </div>
                                        <div className="mt-1.5 text-xs sm:text-sm font-semibold text-price">
                                            Thành tiền: {formatMoney(item.total_price)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nhật ký trạng thái */}
                    {order.order_logs?.length > 0 && (
                        <div className="rounded-xl border border-surface-border bg-surface-bg/40 p-3.5 sm:p-4">
                            <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-sub">
                                <CalendarClock className="h-4 w-4 text-primary" />
                                Nhật ký trạng thái
                            </div>
                            <div className="space-y-2">
                                {order.order_logs.map((log, index) => {
                                    const isPaymentSuccess = log.note?.includes("Thanh toán thành công");
                                    const isPaymentFailed = log.note?.includes("Thanh toán") && log.note?.includes("không thành công");
                                    const displayLabel = isPaymentSuccess
                                        ? "Thanh toán thành công"
                                        : isPaymentFailed
                                            ? "Thanh toán thất bại"
                                            : getStatusLabel(log.status);

                                    return (
                                        <div key={`${log.timestamp}-${index}`} className="rounded-lg border border-surface-border/50 bg-surface-card p-2.5 text-xs sm:text-sm">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`font-medium ${isPaymentSuccess ? "text-status-success font-semibold" : isPaymentFailed ? "text-status-error font-semibold" : "text-text-main"}`}>
                                                    {displayLabel}
                                                </span>
                                                <span className="text-[11px] text-text-muted">{formatDateTime(log.timestamp)}</span>
                                            </div>
                                            {log.note && (
                                                <p className="mt-1 text-xs text-text-sub">
                                                    {log.status === ORDER_STATUS.CANCELLED ? order.cancel_reason : log.note}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
