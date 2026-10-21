"use client";

import Image from "next/image";
import { MapPin, Package2, Truck, CalendarClock } from "lucide-react";
import type { OrderDetailResponse } from "@/features/orders/types";
import { formatDateTime, formatMoney, getPaymentStatusClass, getStatusLabel } from "@/features/orders/utils/orderStatus";

interface OrderHistoryExpandPanelProps {
    order: OrderDetailResponse | null;
    loading?: boolean;
}

export function OrderHistoryExpandPanel({ order, loading = false }: OrderHistoryExpandPanelProps) {
    if (!order) return null;

    return (
        <div className="border-t border-surface-border bg-surface-bg p-4 sm:p-5">
            {loading ? (
                <div className="rounded-xl border border-dashed border-surface-border bg-white p-6 text-sm text-text-sub">
                    Đang tải chi tiết đơn hàng...
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-surface-border bg-white p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-main">
                                <MapPin className="h-4 w-4 text-primary" />
                                Địa chỉ nhận hàng
                            </div>
                            <div className="space-y-2 text-sm text-text-sub">
                                <p className="font-semibold text-text-main">{order.shipping_recipient_name}</p>
                                <p>{order.shipping_phone}</p>
                                <p>{order.shipping_province_name}</p>
                                <p>{order.shipping_ward_name}</p>
                                <p>{order.shipping_address_line}</p>
                                {order.note && <p className="mt-2 italic text-text-muted">Ghi chú: {order.note}</p>}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-surface-border bg-white p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-main">
                                <Truck className="h-4 w-4 text-primary" />
                                Tình trạng đơn hàng
                            </div>
                            <div className="space-y-3 text-sm text-text-sub">
                                <div className="flex items-center justify-between gap-2">
                                    <span>Trạng thái</span>
                                    <span className="rounded-full border border-surface-border bg-surface-bg px-2 py-1 text-xs font-semibold text-text-main">
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span>Thanh toán</span>
                                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getPaymentStatusClass(order.payment_status)}`}>
                                        {order.payment_status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span>Ngày đặt</span>
                                    <span>{formatDateTime(order.created_at)}</span>
                                </div>
                                {order.estimated_delivery_date && (
                                    <div className="flex items-center justify-between gap-2">
                                        <span>Dự kiến giao</span>
                                        <span>{formatDateTime(order.estimated_delivery_date)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-surface-border bg-white p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-main">
                            <Package2 className="h-4 w-4 text-primary" />
                            Sản phẩm trong đơn
                        </div>
                        <div className="space-y-3">
                            {order.order_details.map((item) => (
                                <div key={`${order.order_id}-${item.product_id}`} className="flex gap-3 rounded-xl border border-surface-border bg-surface-bg p-3">
                                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-surface-border">
                                        {item.product_image ? (
                                            <Image
                                                src={item.product_image}
                                                alt={item.product_name}
                                                width={64}
                                                height={64}
                                                unoptimized
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Package2 className="h-6 w-6 text-text-muted" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-text-main">{item.product_name}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-sub">
                                            <span>Số lượng: {item.quantity}</span>
                                            <span>•</span>
                                            <span>Đơn giá: {formatMoney(item.price)}</span>
                                        </div>
                                        <div className="mt-2 text-sm font-semibold text-text-main">Thành tiền: {formatMoney(item.total_price)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {order.order_logs?.length > 0 && (
                        <div className="rounded-2xl border border-surface-border bg-white p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-main">
                                <CalendarClock className="h-4 w-4 text-primary" />
                                Nhật ký trạng thái
                            </div>
                            <div className="space-y-3">
                                {order.order_logs.map((log, index) => (
                                    <div key={`${log.timestamp}-${index}`} className="rounded-xl border border-surface-border bg-surface-bg p-3 text-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium text-text-main">{getStatusLabel(log.status)}</span>
                                            <span className="text-xs text-text-muted">{formatDateTime(log.timestamp)}</span>
                                        </div>
                                        {log.note && <p className="mt-1 text-text-sub">{log.note}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
