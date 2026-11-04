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

export default function AdminOrdersPage() {
    const {
        fetchOrders,
        fetchStatistics,
        fetchCancellationReasons,
        fetchOrderDetail,
        isLoading,
    } = useAdminOrderStore();

    // Modal states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

    // Fetch initial data
    useEffect(() => {
        fetchOrders();
        fetchStatistics();
        fetchCancellationReasons();
    }, [fetchOrders, fetchStatistics, fetchCancellationReasons]);

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
                    <p className="mt-1 text-xs sm:text-sm text-text-muted">
                        Theo dõi, xác nhận, chuyển vận chuyển và xử lý đơn hàng toàn hệ thống
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-xs sm:text-sm font-semibold text-text-sub shadow-xs transition-all hover:border-primary/40 hover:bg-surface-hover hover:text-primary disabled:opacity-50 cursor-pointer"
                        title="Làm mới dữ liệu đơn hàng"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${isLoading ? "animate-spin text-primary" : ""}`}
                        />
                        <span>Làm mới</span>
                    </button>
                </div>
            </div>

            {/* 2. Tabs trạng thái & Thống kê số lượng */}
            <OrderStats />

            {/* 3. Thanh tìm kiếm & Bộ lọc Dropdowns */}
            <OrderFilters />

            {/* 4. Bảng danh sách đơn hàng & Phân trang */}
            <OrderTable
                onViewDetail={handleViewDetail}
                onCancelOrder={handleOpenCancel}
            />

            {/* 5. Thanh công cụ thao tác hàng loạt (Hiển thị khi chọn >= 1 đơn) */}
            <OrderBulkToolbar />

            {/* 6. Modal xem chi tiết đơn hàng */}
            <OrderDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onOpenCancelModal={handleOpenCancel}
            />

            {/* 7. Modal Quản trị viên hủy đơn hàng */}
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
