"use client";

import React from "react";
import { FileText, Shield, Award, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ProductDetailResponse } from "../types";
import { normalizeMarkdown } from "../utils";

interface ProductDescriptionProps {
    product: ProductDetailResponse;
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
    const normalizedDescription = React.useMemo(
        () => normalizeMarkdown(product.description),
        [product.description]
    );
    return (
        <div className="rounded-3xl bg-surface-card border border-primary/20 p-6 sm:p-8 shadow-xs space-y-6">
            {/* TIÊU ĐỀ SECTION */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-primary/15">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-text-main">
                    Mô tả sản phẩm
                </h2>
            </div>

            {/* THÔNG SỐ CƠ BẢN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-primary-light/30 border border-primary/15 flex justify-between">
                    <span className="text-text-sub">Danh mục</span>
                    <span className="font-semibold text-text-main">
                        {product.category?.category_name || "Chung"}
                    </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-primary-light/30 border border-primary/15 flex justify-between">
                    <span className="text-text-sub">Thương hiệu</span>
                    <span className="font-semibold text-text-main">
                        {product.brand || "Chính hãng"}
                    </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-primary-light/30 border border-primary/15 flex justify-between">
                    <span className="text-text-sub">Xuất xứ</span>
                    <span className="font-semibold text-text-main">
                        {product.origin || "Việt Nam"}
                    </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-primary-light/30 border border-primary/15 flex justify-between">
                    <span className="text-text-sub">Kho hàng</span>
                    <span className="font-semibold text-text-main">
                        {product.quantity > 0 ? `${product.quantity} sản phẩm` : "Hết hàng"}
                    </span>
                </div>
            </div>

            {/* NỘI DUNG CHI TIẾT DẠNG MARKDOWN CHUẨN */}
            <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
                    Chi tiết sản phẩm
                </h3>
                {normalizedDescription ? (
                    <div className="text-xs sm:text-sm text-text-sub leading-relaxed space-y-3">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-base sm:text-lg font-bold text-text-main mt-5 mb-2.5 pb-1 border-b border-primary/15">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-sm sm:text-base font-bold text-text-main mt-4 mb-2 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-xs sm:text-sm font-bold text-text-main mt-3 mb-1.5">
                                        {children}
                                    </h3>
                                ),
                                p: ({ children }) => (
                                    <p className="leading-relaxed mb-3 text-text-sub">
                                        {children}
                                    </p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc pl-5 space-y-1.5 my-3 text-text-sub marker:text-primary">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal pl-5 space-y-1.5 my-3 text-text-sub marker:text-primary font-medium">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => (
                                    <li className="leading-relaxed pl-1">{children}</li>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-bold text-text-main">{children}</strong>
                                ),
                                em: ({ children }) => (
                                    <em className="italic text-text-sub">{children}</em>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-primary/40 bg-primary-light/40 pl-4 py-2 italic my-3 rounded-r-xl text-text-sub">
                                        {children}
                                    </blockquote>
                                ),
                                table: ({ children }) => (
                                    <div className="overflow-x-auto my-4 rounded-2xl border border-primary/20 shadow-2xs">
                                        <table className="min-w-full divide-y divide-primary/15 text-xs sm:text-sm">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-primary-light/60 text-text-main font-bold">
                                        {children}
                                    </thead>
                                ),
                                tbody: ({ children }) => (
                                    <tbody className="divide-y divide-primary/15 bg-surface-card">
                                        {children}
                                    </tbody>
                                ),
                                tr: ({ children }) => (
                                    <tr className="hover:bg-primary-light/20 transition-colors">
                                        {children}
                                    </tr>
                                ),
                                th: ({ children }) => (
                                    <th className="px-4 py-3 text-left font-bold text-text-main text-xs uppercase tracking-wider">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="px-4 py-3 text-text-sub whitespace-normal">
                                        {children}
                                    </td>
                                ),
                                hr: () => <hr className="my-4 border-primary/15" />,
                            }}
                        >
                            {normalizedDescription}
                        </ReactMarkdown>
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
