"use client";

import React, { useState, useEffect } from "react";
import { Search, RotateCcw, X, SlidersHorizontal } from "lucide-react";
import {
    PAYMENT_METHOD,
    PAYMENT_STATUS,
    type PaymentMethod,
    type PaymentStatus,
} from "@/features/orders/types";
import { useAdminOrderStore } from "../stores";
import type { AdminOrderSortBy } from "../types";

export const OrderFilters: React.FC = () => {
    const {
        searchQuery,
        selectedPaymentMethod,
        selectedPaymentStatus,
        sortBy,
        setSearchQuery,
        setSelectedPaymentMethod,
        setSelectedPaymentStatus,
        setSortBy,
        resetFilters,
        isLoading,
    } = useAdminOrderStore();

    // Local state cho search input để debounce
    const [localSearch, setLocalSearch] = useState(searchQuery);

    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchQuery) {
                setSearchQuery(localSearch);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [localSearch, searchQuery, setSearchQuery]);

    const hasActiveFilters = Boolean(
        searchQuery.trim() ||
        selectedPaymentMethod !== "ALL" ||
        selectedPaymentStatus !== "ALL" ||
        sortBy !== "order_date_desc"
    );

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface-card p-4 shadow-xs">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* 1. Ô tìm kiếm đa năng */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Tìm theo mã đơn (#OD...), tên khách, SĐT, sản phẩm..."
                        className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-surface-bg border border-surface-border rounded-xl text-text-main placeholder:text-text-muted outline-none hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                    {localSearch && (
                        <button
                            type="button"
                            onClick={() => {
                                setLocalSearch("");
                                setSearchQuery("");
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-main rounded-md transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* 2. Nhóm bộ lọc Dropdowns */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Phương thức thanh toán */}
                    <div className="flex items-center gap-1.5">
                        <select
                            value={selectedPaymentMethod}
                            onChange={(e) =>
                                setSelectedPaymentMethod(
                                    e.target.value as PaymentMethod | "ALL"
                                )
                            }
                            className="px-3 py-2 text-xs sm:text-sm bg-surface-bg border border-surface-border rounded-xl text-text-main outline-none hover:border-primary/50 focus:border-primary cursor-pointer transition-all"
                        >
                            <option value="ALL">Tất cả phương thức</option>
                            <option value={PAYMENT_METHOD.COD}>Thanh toán khi nhận hàng (COD)</option>
                            <option value={PAYMENT_METHOD.BANK_TRANSFER}>Chuyển khoản QR (VietQR)</option>
                            <option value={PAYMENT_METHOD.VNPAY}>Cổng VNPAY</option>
                        </select>
                    </div>

                    {/* Trạng thái thanh toán */}
                    <div className="flex items-center gap-1.5">
                        <select
                            value={selectedPaymentStatus}
                            onChange={(e) =>
                                setSelectedPaymentStatus(
                                    e.target.value as PaymentStatus | "ALL"
                                )
                            }
                            className="px-3 py-2 text-xs sm:text-sm bg-surface-bg border border-surface-border rounded-xl text-text-main outline-none hover:border-primary/50 focus:border-primary cursor-pointer transition-all"
                        >
                            <option value="ALL">Tất cả TT thanh toán</option>
                            <option value={PAYMENT_STATUS.PENDING}>Chờ thanh toán</option>
                            <option value={PAYMENT_STATUS.PAID}>Đã thanh toán</option>
                            <option value={PAYMENT_STATUS.FAILED}>Thất bại</option>
                            <option value={PAYMENT_STATUS.REFUNDED}>Đã hoàn tiền</option>
                        </select>
                    </div>

                    {/* Sắp xếp */}
                    <div className="flex items-center gap-1.5">
                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(e.target.value as AdminOrderSortBy)
                            }
                            className="px-3 py-2 text-xs sm:text-sm bg-surface-bg border border-surface-border rounded-xl text-text-main outline-none hover:border-primary/50 focus:border-primary cursor-pointer transition-all"
                        >
                            <option value="order_date_desc">Ngày đặt: Mới nhất</option>
                            <option value="order_date_asc">Ngày đặt: Cũ nhất</option>
                            <option value="total_desc">Tổng tiền: Cao nhất</option>
                            <option value="total_asc">Tổng tiền: Thấp nhất</option>
                        </select>
                    </div>

                    {/* Nút Đặt lại bộ lọc */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-text-sub hover:text-primary hover:bg-surface-hover rounded-xl border border-surface-border transition-colors cursor-pointer disabled:opacity-50"
                            title="Xóa tất cả bộ lọc"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Đặt lại</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
