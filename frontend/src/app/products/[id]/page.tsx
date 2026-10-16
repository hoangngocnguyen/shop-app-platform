"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    ProductBreadcrumb,
    ProductImageGallery,
    ProductInfo,
    ProductDescription,
    RelatedProducts,
    ProductDetailSkeleton,
} from "@/features/products/components";
import { ProductDetailResponse } from "@/features/products/types";
import { productApi } from "@/features/products/api";
import { EmptyState } from "@/components/ui";
import { AlertCircle, PackageSearch } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [product, setProduct] = useState<ProductDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProductDetail = useCallback(async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            setError(null);
            const data = await productApi.getProductDetail(id);
            setProduct(data);
        } catch (err: unknown) {
            const errorMessage =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Không thể tải thông tin sản phẩm."
                    : "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
            setError(errorMessage);
            setProduct(null);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProductDetail();
    }, [fetchProductDetail]);

    return (
        <div className="min-h-screen bg-surface-bg flex flex-col justify-between selection:bg-primary selection:text-primary-contrast">
            {/* THANH ĐIỀU HƯỚNG HEADER */}
            <Header />

            {/* NỘI DUNG CHÍNH */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                
                {/* 1. TRẠNG THÁI LOADING (SKELETON) */}
                {isLoading ? (
                    <ProductDetailSkeleton />
                ) : error ? (
                    /* 2. TRẠNG THÁI LỖI (ERROR STATE) */
                    <div className="py-12">
                        <div className="max-w-md mx-auto p-6 rounded-3xl bg-surface-card border border-surface-border text-center space-y-4 shadow-xs">
                            <div className="w-12 h-12 rounded-2xl bg-status-error-bg border border-status-error/30 text-status-error flex items-center justify-center mx-auto">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-text-main">
                                    Đã xảy ra lỗi
                                </h3>
                                <p className="text-xs text-text-sub leading-relaxed">
                                    {error}
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-3 pt-2">
                                <button
                                    onClick={() => router.push(ROUTES.HOME)}
                                    className="px-4 py-2 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover text-xs font-semibold text-text-sub transition-colors cursor-pointer"
                                >
                                    Về trang chủ
                                </button>
                                <button
                                    onClick={fetchProductDetail}
                                    className="px-4 py-2 rounded-xl bg-primary text-primary-contrast text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                                >
                                    Thử lại
                                </button>
                            </div>
                        </div>
                    </div>
                ) : !product ? (
                    /* 3. TRẠNG THÁI RỖNG / KHÔNG TÌM THẤY (EMPTY STATE) */
                    <div className="py-16 bg-surface-card rounded-3xl border border-surface-border shadow-xs">
                        <EmptyState
                            icon={PackageSearch}
                            title="Không tìm thấy sản phẩm"
                            description="Sản phẩm bạn đang tìm kiếm có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác."
                            action={{
                                label: "Quay về trang chủ mua sắm",
                                onClick: () => router.push(ROUTES.HOME),
                            }}
                        />
                    </div>
                ) : (
                    /* 4. TRẠNG THÁI THÀNH CÔNG (SUCCESS STATE) */
                    <div className="space-y-6">
                        {/* THANH BREADCRUMB */}
                        <ProductBreadcrumb
                            categoryName={product.category?.category_name}
                            productName={product.product_name}
                        />

                        {/* CARD TỔNG QUAN SẢN PHẨM (ẢNH BÊN TRÁI + THÔNG TIN BÊN PHẢI) */}
                        <div className="rounded-3xl bg-surface-card border border-surface-border p-6 sm:p-8 lg:p-10 shadow-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                                {/* CỘT TRÁI: GALLERY ẢNH */}
                                <ProductImageGallery
                                    imageSrc={product.image_src}
                                    productName={product.product_name}
                                    discountPercent={product.discount_percent}
                                />

                                {/* CỘT PHẢI: THÔNG TIN CHI TIẾT VÀ HÀNH ĐỘNG */}
                                <ProductInfo product={product} />
                            </div>
                        </div>

                        {/* CARD MÔ TẢ CHI TIẾT */}
                        <ProductDescription product={product} />

                        {/* SẢN PHẨM TƯƠNG TỰ CÙNG DANH MỤC */}
                        <RelatedProducts productId={product.product_id} />
                    </div>
                )}

            </main>

            {/* CHÂN TRANG FOOTER */}
            <Footer />
        </div>
    );
}
