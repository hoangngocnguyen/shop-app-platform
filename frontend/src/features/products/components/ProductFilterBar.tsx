"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useProductStore } from "@/features/products/stores";

export default function ProductFilterBar() {
    const {
        filterParams,
        setFilter,
        resetFilter,
        priceOptions,
        fetchPriceOptions,
    } = useProductStore();

    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);

    const sortRef = useRef<HTMLDivElement>(null);
    const priceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchPriceOptions();
    }, [fetchPriceOptions]);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setIsSortOpen(false);
            }
            if (priceRef.current && !priceRef.current.contains(e.target as Node)) {
                setIsPriceOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sortOptions: Array<{
        label: string;
        value: "newest" | "price_asc" | "price_desc" | "best_seller";
    }> = [
        { label: "Mặc định", value: "newest" },
        { label: "Giá tăng dần", value: "price_asc" },
        { label: "Giá giảm dần", value: "price_desc" },
        { label: "Bán chạy nhất", value: "best_seller" },
    ];

    const currentSortLabel =
        sortOptions.find((opt) => opt.value === filterParams.sort_by)?.label || "Mặc định";

    const currentPriceLabel =
        priceOptions.find((opt) => opt.key === filterParams.price_option)?.label || "Mức giá";

    const hasActiveFilters = Boolean(
        filterParams.search ||
        filterParams.price_option ||
        filterParams.category_slug ||
        (filterParams.sort_by && filterParams.sort_by !== "newest")
    );

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            
            {/* Bộ lọc Dropdowns */}
            <div className="flex items-center gap-2.5">
                
                {/* DROPDOWN SẮP XẾP */}
                <div className="relative" ref={sortRef}>
                    <button
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-primary/20 bg-surface-card hover:bg-primary-light/40 text-text-main text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-xs"
                    >
                        <span className="text-text-muted">Sắp xếp:</span>
                        <span className="font-bold">{currentSortLabel}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                    </button>

                    {isSortOpen && (
                        <div className="absolute left-0 mt-1.5 w-44 bg-surface-card rounded-xl border border-primary/20 shadow-brand-md py-1 z-30 animate-in fade-in duration-150">
                            {sortOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        setFilter({ sort_by: opt.value });
                                        setIsSortOpen(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                                        filterParams.sort_by === opt.value
                                            ? "bg-primary-light text-primary font-bold"
                                            : "text-text-sub hover:text-text-main hover:bg-primary-light/40"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* DROPDOWN MỨC GIÁ */}
                <div className="relative" ref={priceRef}>
                    <button
                        onClick={() => setIsPriceOpen(!isPriceOpen)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-colors cursor-pointer shadow-xs text-xs sm:text-sm ${
                            filterParams.price_option
                                ? "border-primary bg-primary-light text-primary font-bold shadow-xs"
                                : "border-primary/20 bg-surface-card hover:bg-primary-light/40 text-text-main font-medium"
                        }`}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted" />
                        <span>{currentPriceLabel}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                    </button>

                    {isPriceOpen && (
                        <div className="absolute left-0 mt-1.5 w-52 bg-surface-card rounded-xl border border-primary/20 shadow-brand-md py-1 z-30 animate-in fade-in duration-150">
                            <button
                                onClick={() => {
                                    setFilter({ price_option: undefined });
                                    setIsPriceOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                                    !filterParams.price_option
                                        ? "bg-primary-light text-primary font-bold"
                                        : "text-text-sub hover:text-text-main hover:bg-primary-light/40"
                                }`}
                            >
                                Tất cả mức giá
                            </button>
                            {priceOptions.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => {
                                        setFilter({ price_option: opt.key });
                                        setIsPriceOpen(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                                        filterParams.price_option === opt.key
                                            ? "bg-primary-light text-primary font-bold"
                                            : "text-text-sub hover:text-text-main hover:bg-primary-light/40"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* NÚT RESET BỘ LỌC (nếu đang lọc) */}
                {hasActiveFilters && (
                    <button
                        onClick={resetFilter}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs text-status-error hover:bg-status-error-bg rounded-xl border border-transparent hover:border-status-error/20 transition-colors cursor-pointer"
                        title="Xóa tất cả bộ lọc"
                    >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Xóa bộ lọc</span>
                    </button>
                )}
            </div>

            {/* Thông báo kết quả tìm kiếm nếu có search */}
            {filterParams.search && (
                <div className="text-xs text-text-muted">
                    Kết quả tìm kiếm cho: <span className="font-bold text-text-main">&quot;{filterParams.search}&quot;</span>
                </div>
            )}
        </div>
    );
}
