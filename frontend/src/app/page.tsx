"use client";

import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    HeroBanner,
    CategoryTabs,
    ProductFilterBar,
    ProductCard,
    ProductCardSkeleton,
} from "@/features/products/components";
import { useProductStore } from "@/features/products/stores";
import { EmptyState, Button } from "@/components/ui";
import { AlertCircle, ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";

export default function HomePage() {
    const {
        products,
        total,
        page,
        totalPages,
        isLoading,
        error,
        fetchProducts,
        filterParams,
        setFilter,
        resetFilter,
    } = useProductStore();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setFilter({ page: newPage });
            const gridSection = document.getElementById("product-grid-section");
            if (gridSection) {
                gridSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <div className="min-h-screen bg-surface-bg flex flex-col justify-between selection:bg-primary selection:text-primary-contrast">
            {/* THANH ĐIỀU HƯỚNG HEADER */}
            <Header />

            {/* NỘI DUNG CHÍNH */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                
                {/* 1. HERO BANNER */}
                <HeroBanner />

                {/* 2. THANH TAB DANH MỤC */}
                <CategoryTabs />

                {/* 3. THANH CÔNG CỤ LỌC & SẮP XẾP */}
                <ProductFilterBar />

                {/* 4. KHU VỰC DANH SÁCH SẢN PHẨM (VỚI ĐỦ 4 TRẠNG THÁI UI) */}
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

                    {/* B. LOADING STATE (SKELETON) */}
                    {isLoading && products.length === 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                            {Array.from({ length: 12 }).map((_, index) => (
                                <ProductCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        /* C. EMPTY STATE */
                        <div className="py-8 bg-surface-card rounded-3xl border border-surface-border">
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
                        /* D. SUCCESS STATE */
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                                {products.map((product) => (
                                    <ProductCard key={product.product_id} product={product} />
                                ))}
                            </div>

                            {/* THANH PHÂN TRANG (PAGINATION) */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-8 pb-4">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page <= 1 || isLoading}
                                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover text-text-sub text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                                        title="Trang trước"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">Trước</span>
                                    </button>

                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-xs sm:text-sm font-bold text-text-main">
                                        <span>Trang</span>
                                        <span className="text-primary">{page}</span>
                                        <span>/</span>
                                        <span>{totalPages}</span>
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= totalPages || isLoading}
                                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover text-text-sub text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                                        title="Trang sau"
                                    >
                                        <span className="hidden sm:inline">Sau</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                </section>
            </main>

            {/* CHÂN TRANG FOOTER */}
            <Footer />
        </div>
    );
}