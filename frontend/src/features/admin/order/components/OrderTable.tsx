"use client";

import React from "react";
import Image from "next/image";
import {
    Eye,
    CheckCircle2,
    Truck,
    PackageCheck,
    XCircle,
    Package,
    Calendar,
    Phone,
    MapPin,
    User as UserIcon,
} from "lucide-react";
import { useAdminOrderStore } from "../stores";
import { ORDER_STATUS } from "@/features/orders/types";
import {
    formatMoney,
    getOrderStatusClass,
    getPaymentStatusClass,
    getStatusLabel,
    getPaymentStatusLabel,
} from "@/features/orders/utils/orderStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderPagination } from "./OrderPagination";
import type { AdminOrderSummary } from "../types";

interface OrderTableProps {
    onViewDetail: (orderId: string) => void;
    onCancelOrder: (orderId: string) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
    onViewDetail,
    onCancelOrder,
}) => {
    const {
        orders,
        isLoading,
        total,
        page,
        pageSize,
        totalPages,
        selectedOrderIds,
        toggleSelectOrder,
        selectAllCurrentPage,
        setPage,
        setPageSize,
        confirmOrders,
        startShippingOrders,
        completeDeliveryOrders,
        isActionLoading,
    } = useAdminOrderStore();

    const isAllSelected =
        orders.length > 0 &&
        orders.every((order) => selectedOrderIds.includes(order.order_id));

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "-";
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(date);
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="w-full rounded-2xl border border-surface-border bg-surface-card shadow-xs overflow-hidden">
            {/* Desktop & Tablet Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-surface-border bg-surface-bg/60 text-text-sub text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th scope="col" className="w-10 px-4 py-3.5">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={selectAllCurrentPage}
                                        disabled={isLoading || orders.length === 0}
                                        className="h-4 w-4 rounded border-surface-border text-primary focus:ring-primary cursor-pointer"
                                        aria-label="Chọn tất cả đơn hàng trang này"
                                    />
                                </div>
                            </th>
                            <th scope="col" className="w-36 px-4 py-3.5 whitespace-nowrap">
                                Mã đơn hàng
                            </th>
                            <th scope="col" className="w-56 max-w-[220px] px-4 py-3.5 whitespace-nowrap">
                                Khách hàng & Địa chỉ
                            </th>
                            <th scope="col" className="w-60 max-w-[240px] px-4 py-3.5 whitespace-nowrap">
                                Sản phẩm
                            </th>
                            <th scope="col" className="w-32 px-4 py-3.5 whitespace-nowrap">
                                Ngày đặt
                            </th>
                            <th scope="col" className="w-28 px-4 py-3.5 whitespace-nowrap">
                                Tổng tiền
                            </th>
                            <th scope="col" className="w-32 px-4 py-3.5 whitespace-nowrap">
                                Thanh toán
                            </th>
                            <th scope="col" className="w-32 px-4 py-3.5 whitespace-nowrap">
                                Trạng thái
                            </th>
                            <th scope="col" className="w-28 px-4 py-3.5 text-center whitespace-nowrap">
                                Thao tác
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-surface-border">
                        {/* Loading Skeletons */}
                        {isLoading &&
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={`skeleton-${index}`} className="animate-pulse">
                                    <td className="px-4 py-4">
                                        <Skeleton className="h-4 w-4 rounded" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <Skeleton className="h-4 w-28 rounded" />
                                    </td>
                                    <td className="px-4 py-4 space-y-1.5">
                                        <Skeleton className="h-4 w-32 rounded" />
                                        <Skeleton className="h-3 w-24 rounded" />
                                    </td>
                                    <td className="px-4 py-4 space-y-1.5">
                                        <Skeleton className="h-4 w-36 rounded" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <Skeleton className="h-4 w-24 rounded" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <Skeleton className="h-4 w-20 rounded" />
                                    </td>
                                    <td className="px-4 py-4 space-y-1">
                                        <Skeleton className="h-4 w-16 rounded-full" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <Skeleton className="h-8 w-16 mx-auto rounded-lg" />
                                    </td>
                                </tr>
                            ))}

                        {/* Danh sách đơn hàng */}
                        {!isLoading &&
                            orders.map((order: AdminOrderSummary) => {
                                const isSelected = selectedOrderIds.includes(
                                    order.order_id
                                );
                                const firstItem = order.items[0];

                                return (
                                    <tr
                                        key={order.order_id}
                                        className={`transition-colors hover:bg-surface-hover/60 ${
                                            isSelected ? "bg-primary/5" : ""
                                        }`}
                                    >
                                        {/* Checkbox */}
                                        <td className="px-4 py-3.5">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    toggleSelectOrder(order.order_id)
                                                }
                                                className="h-4 w-4 rounded border-surface-border text-primary focus:ring-primary cursor-pointer"
                                                aria-label={`Chọn đơn ${order.order_id}`}
                                            />
                                        </td>

                                        {/* Mã đơn hàng */}
                                        <td className="px-4 py-3.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onViewDetail(order.order_id)
                                                }
                                                className="font-mono font-bold text-primary hover:underline cursor-pointer block text-left"
                                            >
                                                #{order.order_id}
                                            </button>
                                            <span className="text-[11px] text-text-muted">
                                                {order.total_items} sản phẩm
                                            </span>
                                        </td>

                                        {/* Khách hàng & Địa chỉ */}
                                        <td className="px-4 py-3.5 w-56 max-w-[220px]">
                                            <div className="font-semibold text-text-main flex items-center gap-1.5 truncate" title={order.shipping_recipient_name}>
                                                <UserIcon className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                                <span className="truncate">{order.shipping_recipient_name}</span>
                                            </div>
                                            <div className="text-[11px] text-text-sub flex items-center gap-1 mt-0.5 truncate">
                                                <Phone className="w-3 h-3 text-text-muted shrink-0" />
                                                <span>{order.shipping_phone}</span>
                                            </div>
                                            <div className="text-[11px] text-text-muted truncate max-w-[190px] mt-0.5 flex items-center gap-1" title={`${order.shipping_address_line ? `${order.shipping_address_line}, ` : ""}${order.shipping_ward_name ? `${order.shipping_ward_name}, ` : ""}${order.shipping_province_name}`}>
                                                <MapPin className="w-3 h-3 text-text-muted shrink-0" />
                                                <span className="truncate">
                                                    {order.shipping_ward_name ? `${order.shipping_ward_name}, ` : ""}{order.shipping_province_name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Sản phẩm */}
                                        <td className="px-4 py-3.5 w-60 max-w-[240px]">
                                            {firstItem ? (
                                                <div className="flex items-center gap-2.5 max-w-[220px]">
                                                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-surface-border bg-surface-bg flex items-center justify-center">
                                                        {firstItem.product_image ? (
                                                            <Image
                                                                src={firstItem.product_image}
                                                                alt={firstItem.product_name}
                                                                fill
                                                                sizes="36px"
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="w-4 h-4 text-text-muted" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1 truncate">
                                                        <p className="truncate font-medium text-text-main text-xs" title={firstItem.product_name}>
                                                            {firstItem.product_name}
                                                        </p>
                                                        <p className="text-[11px] text-text-muted truncate">
                                                            {formatMoney(firstItem.price)} x {firstItem.quantity}
                                                            {order.total_items > firstItem.quantity && (
                                                                <span className="ml-1 text-primary font-semibold">
                                                                    (+{order.total_items - firstItem.quantity})
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-text-muted">Không có sản phẩm</span>
                                            )}
                                        </td>

                                        {/* Ngày đặt */}
                                        <td className="px-4 py-3.5 text-text-sub text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                                <span>{formatDate(order.created_at || order.order_date)}</span>
                                            </div>
                                        </td>

                                        {/* Tổng tiền */}
                                        <td className="px-4 py-3.5 font-bold text-text-main whitespace-nowrap">
                                            <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                                                {formatMoney(order.total_amount ?? order.total)}
                                            </span>
                                        </td>

                                        {/* Thanh toán */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-[11px] font-medium text-text-sub">
                                                    {order.payment_method === "BANK_TRANSFER"
                                                        ? "Chuyển khoản QR"
                                                        : order.payment_method === "VNPAY"
                                                        ? "Ví VNPAY"
                                                        : "Thanh toán COD"}
                                                </div>
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getPaymentStatusClass(
                                                        order.payment_status
                                                    )}`}
                                                >
                                                    {getPaymentStatusLabel(order.payment_status)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Trạng thái đơn */}
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <span
                                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getOrderStatusClass(
                                                    order.status
                                                )}`}
                                            >
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>

                                        {/* Thao tác */}
                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1.5">
                                                {/* 1. Nút Xem chi tiết */}
                                                <button
                                                    type="button"
                                                    onClick={() => onViewDetail(order.order_id)}
                                                    className="p-1.5 rounded-lg border border-surface-border text-text-sub hover:text-primary hover:bg-surface-hover hover:border-primary/30 transition-all cursor-pointer"
                                                    title="Xem chi tiết đơn hàng"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {/* 2. Nút Hành động nhanh theo trạng thái */}
                                                {order.status === ORDER_STATUS.PENDING && (
                                                    <button
                                                        type="button"
                                                        disabled={isActionLoading}
                                                        onClick={() =>
                                                            confirmOrders([order.order_id])
                                                        }
                                                        className="p-1.5 rounded-lg bg-status-info-bg text-status-info hover:bg-status-info hover:text-white transition-all cursor-pointer disabled:opacity-50"
                                                        title="Xác nhận xử lý đơn hàng"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {order.status === ORDER_STATUS.PROCESSING && (
                                                    <button
                                                        type="button"
                                                        disabled={isActionLoading}
                                                        onClick={() =>
                                                            startShippingOrders([order.order_id])
                                                        }
                                                        className="p-1.5 rounded-lg bg-primary-light text-primary hover:bg-primary hover:text-white transition-all cursor-pointer disabled:opacity-50"
                                                        title="Bắt đầu giao hàng"
                                                    >
                                                        <Truck className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {order.status === ORDER_STATUS.SHIPPING && (
                                                    <button
                                                        type="button"
                                                        disabled={isActionLoading}
                                                        onClick={() =>
                                                            completeDeliveryOrders([order.order_id])
                                                        }
                                                        className="p-1.5 rounded-lg bg-status-success-bg text-status-success hover:bg-status-success hover:text-white transition-all cursor-pointer disabled:opacity-50"
                                                        title="Xác nhận đã giao hàng thành công"
                                                    >
                                                        <PackageCheck className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* 3. Nút Hủy đơn */}
                                                {order.status !== ORDER_STATUS.DELIVERED &&
                                                    order.status !== ORDER_STATUS.COMPLETED &&
                                                    order.status !== ORDER_STATUS.CANCELLED && (
                                                        <button
                                                            type="button"
                                                            disabled={isActionLoading}
                                                            onClick={() => onCancelOrder(order.order_id)}
                                                            className="p-1.5 rounded-lg border border-surface-border text-text-muted hover:text-status-error hover:bg-status-error-bg hover:border-status-error/30 transition-all cursor-pointer disabled:opacity-50"
                                                            title="Hủy đơn hàng"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {!isLoading && orders.length === 0 && (
                <div className="py-12">
                    <EmptyState
                        title="Không tìm thấy đơn hàng nào"
                        description="Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc đang chọn"
                    />
                </div>
            )}

            {/* Pagination Controls */}
            <OrderPagination
                currentPage={page}
                pageSize={pageSize}
                totalItems={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                isLoading={isLoading}
            />
        </div>
    );
};
