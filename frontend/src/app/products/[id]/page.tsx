"use client";

import React, { useEffect, useState } from "react";
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
import { EmptyState, Button } from "@/components/ui";
import { AlertCircle, PackageSearch } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [product, setProduct] = useState<ProductDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        if (!id) return;

        async function loadProduct() {
            try {
                const data = await productApi.getProductDetail(id);
                if (isMounted) {
                    setProduct(data);
                    setError(null);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    const errorMessage =
                        err && typeof err === "object" && "response" in err
                            ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Không thể tải thông tin sản phẩm."
                            : "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
                    setError(errorMessage);
                    setProduct(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadProduct();

        return () => {
            isMounted = false;
        };
    }, [id, retryCount]);

    const handleRetry = () => {
        setIsLoading(true);
        setError(null);
        setRetryCount((c) => c + 1);
    };

    return (
        <div className="min-h-screen bg-primary-light/40 flex flex-col justify-between selection:bg-primary selection:text-primary-contrast">
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
                        <div className="max-w-md mx-auto p-6 rounded-3xl bg-surface-card border border-primary/20 text-center space-y-4 shadow-xs">
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
                                    className="px-4 py-2 rounded-xl border border-primary/20 bg-surface-card hover:bg-primary-light/40 text-xs font-semibold text-text-sub transition-colors cursor-pointer"
                                >
                                    Về trang chủ
                                </button>
                                <button
                                    onClick={handleRetry}
                                    className="px-4 py-2 rounded-xl bg-primary text-primary-contrast text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                                >
                                    Thử lại
                                </button>
                            </div>
                        </div>
                    </div>
                ) : !product ? (
                    /* 3. TRẠNG THÁI RỖNG / KHÔNG TÌM THẤY (EMPTY STATE) */
                    <div className="py-16 bg-surface-card rounded-3xl border border-primary/20 shadow-xs">
                        <EmptyState
                            icon={PackageSearch}
                            title="Không tìm thấy sản phẩm"
                            description="Sản phẩm bạn đang tìm kiếm có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác."
                            action={
                                <Button
                                    onClick={() => router.push(ROUTES.HOME)}
                                    size="sm"
                                    className="shadow-brand-sm"
                                >
                                    Quay về trang chủ mua sắm
                                </Button>
                            }
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
                        <div className="rounded-3xl bg-surface-card border border-primary/20 p-6 sm:p-8 lg:p-10 shadow-xs">
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
