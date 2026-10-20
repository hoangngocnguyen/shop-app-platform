"use client";

import React, { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    CategoryTabs,
    ProductFilterBar,
    ProductCard,
    ProductCardSkeleton,
} from "@/features/products/components";
import { useProductStore } from "@/features/products/stores";
import { EmptyState, Button } from "@/components/ui";
import { AlertCircle, ChevronDown, CheckCircle2, PackageSearch } from "lucide-react";

export default function HomePage() {
    const {
        products,
        page,
        total,
        pageSize,
        totalPages,
        isLoading,
        isLoadingMore,
        error,
        fetchProducts,
        loadMoreProducts,
        filterParams,
        resetFilter,
    } = useProductStore();

    const observerTarget = useRef<HTMLDivElement>(null);

    // Fetch dữ liệu ban đầu
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Cơ chế phân trang cuộn tự động (Infinite Scroll) khi lướt xuống cuối danh sách
    useEffect(() => {
        const target = observerTarget.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && page < totalPages && !isLoadingMore && !isLoading) {
                    loadMoreProducts();
                }
            },
            { threshold: 0.1, rootMargin: "150px" }
        );

        observer.observe(target);
        return () => {
            observer.disconnect();
        };
    }, [page, totalPages, isLoadingMore, isLoading, loadMoreProducts]);

    const remainingCount = Math.max(0, total - products.length);

    return (
        <div className="min-h-screen bg-surface-bg flex flex-col justify-between selection:bg-primary selection:text-primary-contrast">
            {/* THANH ĐIỀU HƯỚNG HEADER */}
            <Header />

            {/* NỘI DUNG CHÍNH */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                
                {/* 1. THANH TAB DANH MỤC (Đã bỏ banner theo yêu cầu) */}
                <CategoryTabs />

                {/* 2. THANH CÔNG CỤ LỌC & SẮP XẾP */}
                <ProductFilterBar />

                {/* 3. KHU VỰC DANH SÁCH SẢN PHẨM (VỚI ĐỦ 4 TRẠNG THÁI UI) */}
                <section id="product-grid-section" className="space-y-6">
                    
                    {/* A. ERROR STATE */}
                    {error && (
                        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-status-error-bg border border-status-error/30 text-status-error text-sm shadow-sm mb-6">
                            <div className="flex items-center gap-2.5">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                            <button
                                onClick={() => fetchProducts()}
                                className="px-3.5 py-1.5 rounded-xl bg-status-error text-white font-medium hover:opacity-90 transition-opacity shrink-0 cursor-pointer text-xs"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* B. LOADING STATE (SKELETON KHI CHƯA CÓ SẢN PHẨM) */}
                    {isLoading && products.length === 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                            {Array.from({ length: 12 }).map((_, index) => (
                                <ProductCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        /* C. EMPTY STATE */
                        <div className="py-12 bg-surface-card rounded-3xl border border-surface-border">
                            <EmptyState
                                icon={PackageSearch}
                                title="Không tìm thấy sản phẩm nào"
                                description={
                                    filterParams.search || filterParams.category_slug || filterParams.price_option
                                        ? "Không có sản phẩm nào phù hợp với bộ lọc hiện tại. Bạn vui lòng thử lại với từ khóa khác."
                                        : "Cửa hàng hiện đang cập nhật thêm sản phẩm mới. Vui lòng quay lại sau."
                                }
                                action={
                                    filterParams.search || filterParams.category_slug || filterParams.price_option ? (
                                        <Button
                                            onClick={resetFilter}
                                            size="sm"
                                            className="shadow-brand-sm"
                                        >
                                            Xóa tất cả bộ lọc
                                        </Button>
                                    ) : undefined
                                }
                            />
                        </div>
                    ) : (
                        /* D. SUCCESS STATE & PHÂN TRANG LOAD MORE DẠNG CUỘN */
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                                {products.map((product) => (
                                    <ProductCard key={product.product_id} product={product} />
                                ))}
                            </div>

                            {/* KHU VỰC PHÂN TRANG DẠNG CUỘN / TẢI THÊM (LOAD MORE) */}
                            <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-3">
                                {page < totalPages ? (
                                    <div className="flex flex-col items-center gap-2.5">
                                        <Button
                                            onClick={() => loadMoreProducts()}
                                            isLoading={isLoadingMore}
                                            variant="outline"
                                            size="lg"
                                            className="px-8 py-3 rounded-2xl bg-surface-card hover:bg-surface-hover border-surface-border text-text-main text-xs sm:text-sm font-bold shadow-brand-sm hover:border-primary transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                                        >
                                            <ChevronDown className="w-4 h-4 text-primary group-hover:translate-y-0.5 transition-transform" />
                                            <span>
                                                Xem thêm {Math.min(remainingCount, pageSize)} sản phẩm
                                            </span>
                                            <span className="text-[11px] font-normal text-text-sub">
                                                (Còn {remainingCount} sản phẩm)
                                            </span>
                                        </Button>
                                        <span className="text-xs text-text-sub font-medium">
                                            Đang hiển thị {products.length} / {total} sản phẩm
                                        </span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-card border border-surface-border text-xs text-text-sub shadow-2xs font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                        <span>Bạn đã xem hết toàn bộ {total} sản phẩm</span>
                                    </div>
                                )}

                                {/* Sentinel div kích hoạt tải trang dạng cuộn tự động */}
                                <div ref={observerTarget} className="h-2 w-full pointer-events-none" />
                            </div>
                        </>
                    )}

                </section>
            </main>

            {/* CHÂN TRANG FOOTER */}
            <Footer />
        </div>
    );
}
