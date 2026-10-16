import React from "react";
import { FileText, Shield, Award, CheckCircle2 } from "lucide-react";
import { ProductDetailResponse } from "../types";

interface ProductDescriptionProps {
    product: ProductDetailResponse;
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
    return (
        <div className="rounded-3xl bg-surface-card border border-surface-border p-6 sm:p-8 shadow-xs space-y-6">
            {/* TIÊU ĐỀ SECTION */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-surface-border">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-text-main">
                    Mô tả sản phẩm
                </h2>
            </div>

            {/* THÔNG SỐ CƠ BẢN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-surface-hover/40 border border-surface-border flex justify-between">
                    <span className="text-text-sub">Danh mục</span>
                    <span className="font-semibold text-text-main">
                        {product.category?.category_name || "Chung"}
                    </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface-hover/40 border border-surface-border flex justify-between">
                    <span className="text-text-sub">Thương hiệu</span>
                    <span className="font-semibold text-text-main">
                        {product.brand || "Chính hãng"}
                    </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface-hover/40 border border-surface-border flex justify-between">
                    <span className="text-text-sub">Xuất xứ</span>
                    <span className="font-semibold text-text-main">
                        {product.origin || "Việt Nam"}
                    </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface-hover/40 border border-surface-border flex justify-between">
                    <span className="text-text-sub">Kho hàng</span>
                    <span className="font-semibold text-text-main">
                        {product.quantity > 0 ? `${product.quantity} sản phẩm` : "Hết hàng"}
                    </span>
                </div>
            </div>

            {/* NỘI DUNG CHI TIẾT */}
            <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
                    Chi tiết sản phẩm
                </h3>
                {product.description ? (
                    <div className="text-xs sm:text-sm text-text-sub leading-relaxed whitespace-pre-line space-y-3">
                        {product.description}
                    </div>
                ) : (
                    <p className="text-xs sm:text-sm text-text-muted italic">
                        Thông tin chi tiết của sản phẩm đang được cập nhật thêm.
                    </p>
                )}
            </div>

            {/* CAM KẾT HOANGSHOP */}
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>Cam kết bán hàng tại HOANGSHOP</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-text-main">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Sản phẩm 100% chính hãng, có nguồn gốc rõ ràng</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Bảo hành theo tiêu chuẩn chính hãng của nhà sản xuất</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Hỗ trợ kỹ thuật và chăm sóc khách hàng 24/7</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary shrink-0" />
                        <span>Cam kết hoàn tiền 100% nếu phát hiện hàng giả</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
