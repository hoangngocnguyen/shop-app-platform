"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, ShoppingCart } from "lucide-react";
import {
    OrderStats,
    OrderFilters,
    OrderTable,
    OrderBulkToolbar,
    OrderDetailModal,
    OrderCancelModal,
} from "@/features/admin/order/components";
import { useAdminOrderStore } from "@/features/admin/order/stores";
import type {
    AdminOrderSortBy,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
} from "@/features/admin/order/types";

export default function AdminOrdersPage() {
    const {
        fetchOrders,
        fetchStatistics,
        fetchCancellationReasons,
        fetchOrderDetail,
        isLoading,
        selectedStatus,
        selectedPaymentMethod,
        selectedPaymentStatus,
        searchQuery,
        sortBy,
        page,
    } = useAdminOrderStore();

    // Modal states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

    // 1. Đọc URL Query String khi vừa vào trang để khôi phục bộ lọc (Bookmark / Reload)
    useEffect(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        const updates: Record<string, unknown> = {};

        const statusParam = params.get("status");
        if (statusParam) updates.selectedStatus = statusParam as OrderStatus | "ALL";

        const methodParam = params.get("payment_method");
        if (methodParam) updates.selectedPaymentMethod = methodParam as PaymentMethod | "ALL";

        const paymentStatusParam = params.get("payment_status");
        if (paymentStatusParam) updates.selectedPaymentStatus = paymentStatusParam as PaymentStatus | "ALL";

        const searchParam = params.get("search");
        if (searchParam) updates.searchQuery = searchParam;

        const pageParam = Number(params.get("page"));
        if (pageParam && pageParam > 0) updates.page = pageParam;

        const sortParam = params.get("sort_by");
        if (sortParam) updates.sortBy = sortParam as AdminOrderSortBy;

        if (Object.keys(updates).length > 0) {
            useAdminOrderStore.setState(updates);
        }

        // Tải dữ liệu ban đầu
        fetchOrders();
        fetchStatistics();
        fetchCancellationReasons();
    }, [fetchOrders, fetchStatistics, fetchCancellationReasons]);

    // 2. Đồng bộ bộ lọc Zustand lên thanh địa chỉ URL của trình duyệt (URL Sync)
    useEffect(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams();
        if (page > 1) params.set("page", String(page));
        if (selectedStatus !== "ALL") params.set("status", selectedStatus);
        if (selectedPaymentMethod !== "ALL") params.set("payment_method", selectedPaymentMethod);
        if (selectedPaymentStatus !== "ALL") params.set("payment_status", selectedPaymentStatus);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (sortBy !== "order_date_desc") params.set("sort_by", sortBy);

        const queryString = params.toString();
        const newUrl = queryString
            ? `${window.location.pathname}?${queryString}`
            : window.location.pathname;

        // Cập nhật URL trình duyệt tức thì mà không gây giật lag hay reload trang
        window.history.replaceState(null, "", newUrl);
    }, [
        selectedStatus,
        selectedPaymentMethod,
        selectedPaymentStatus,
        searchQuery,
        sortBy,
        page,
    ]);

    const handleRefresh = async () => {
        await Promise.all([fetchOrders(), fetchStatistics()]);
    };

    const handleViewDetail = (orderId: string) => {
        fetchOrderDetail(orderId);
        setIsDetailModalOpen(true);
    };

    const handleOpenCancel = (orderId: string) => {
        setCancelOrderId(orderId);
        setIsCancelModalOpen(true);
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300 pb-16">
            {/* 1. Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-text-main flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary-light text-primary">
                            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span>Quản lý đơn hàng</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-text-muted mt-1">
                        Theo dõi, xác nhận và cập nhật trạng thái đơn hàng theo thời gian thực
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover text-text-main text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                >
                    <RefreshCw
                        className={`w-4 h-4 text-text-muted ${
                            isLoading ? "animate-spin text-primary" : ""
                        }`}
                    />
                    <span>Làm mới</span>
                </button>
            </div>

            {/* 2. Tabs Thống Kê Số Lượng Đơn Theo Trạng Thái */}
            <OrderStats />

            {/* 3. Bộ Lọc Tìm Kiếm & Dropdowns Đa Năng */}
            <OrderFilters />

            {/* 4. Bảng Dữ Liệu Đơn Hàng & Phân Trang */}
            <OrderTable
                onViewDetail={handleViewDetail}
                onCancelOrder={handleOpenCancel}
            />

            {/* 5. Thanh Thao Tác Hàng Loạt Nổi (Bulk Actions Toolbar) */}
            <OrderBulkToolbar />

            {/* 6. Modal Xem Chi Tiết Đơn Hàng & Timeline Nhật Ký */}
            <OrderDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onOpenCancelModal={(orderId) => {
                    setIsDetailModalOpen(false);
                    handleOpenCancel(orderId);
                }}
            />

            {/* 7. Modal Xác Nhận Hủy Đơn Hàng (Kèm Danh Mục Lý Do) */}
            <OrderCancelModal
                isOpen={isCancelModalOpen}
                orderId={cancelOrderId}
                onClose={() => {
                    setIsCancelModalOpen(false);
                    setCancelOrderId(null);
                }}
            />
        </div>
    );
}
