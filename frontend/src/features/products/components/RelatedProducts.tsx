"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ProductResponse } from "../types";
import { productApi } from "../api";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

interface RelatedProductsProps {
    productId: number | string;
}

export default function RelatedProducts({ productId }: RelatedProductsProps) {
    const [relatedProducts, setRelatedProducts] = useState<ProductResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchRelated() {
            try {
                setIsLoading(true);
                const data = await productApi.getRelatedProducts(productId, 6);
                if (isMounted) {
                    setRelatedProducts(data);
                }
            } catch {
                if (isMounted) {
                    setRelatedProducts([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        if (productId) {
            fetchRelated();
        }

        return () => {
            isMounted = false;
        };
    }, [productId]);

    if (!isLoading && relatedProducts.length === 0) {
        return null;
    }

    return (
        <section className="mt-10 sm:mt-12 space-y-4">
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-text-main">
                    Sản phẩm tương tự
                </h2>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {relatedProducts.map((item) => (
                        <ProductCard key={item.product_id} product={item} />
                    ))}
                </div>
            )}
        </section>
    );
}
