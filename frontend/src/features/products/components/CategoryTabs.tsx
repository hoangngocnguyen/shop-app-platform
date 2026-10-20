"use client";

import React, { useEffect } from "react";
import { useCategoryStore } from "@/features/categories/stores";
import { useProductStore } from "@/features/products/stores";

export default function CategoryTabs() {
    const { categories, fetchCategories, isLoading } = useCategoryStore();
    const { filterParams, setFilter } = useProductStore();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSelectCategory = (slug?: string) => {
        setFilter({ category_slug: slug, page: 1 });
    };

    const isAllActive = !filterParams.category_slug;

    return (
        <div className="w-full mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                
                {/* Nút "Tất cả" */}
                <button
                    onClick={() => handleSelectCategory(undefined)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isAllActive
                            ? "bg-primary text-primary-contrast shadow-brand-sm scale-100 font-bold"
                            : "bg-surface-card border border-primary/20 text-text-sub hover:text-text-main hover:bg-primary-light/40"
                    }`}
                >
                    Tất cả
                </button>

                {/* Các danh mục từ Backend */}
                {categories.map((cat) => {
                    const isActive = filterParams.category_slug === cat.slug;
                    return (
                        <button
                            key={cat.category_id}
                            onClick={() => handleSelectCategory(cat.slug)}
                            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                isActive
                                    ? "bg-primary text-primary-contrast shadow-brand-sm font-bold scale-100"
                                    : "bg-surface-card border border-primary/20 text-text-sub hover:text-text-main hover:bg-primary-light/40 font-semibold"
                            }`}
                        >
                            {cat.category_name}
                        </button>
                    );
                })}

                {/* Skeleton khi đang load danh mục */}
                {isLoading && categories.length === 0 && (
                    <>
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="h-9 sm:h-10 w-24 sm:w-28 rounded-xl bg-primary-light/50 animate-pulse shrink-0 border border-primary/10"
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
