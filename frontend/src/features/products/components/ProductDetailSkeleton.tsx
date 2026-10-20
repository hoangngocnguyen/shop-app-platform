import React from "react";
import { Skeleton } from "@/components/ui";

export default function ProductDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* BREADCRUMB SKELETON */}
            <div className="flex items-center gap-2 py-3">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-36 rounded-md" />
            </div>

            {/* TOP CARD SKELETON (OVERVIEW) */}
            <div className="rounded-3xl bg-surface-card border border-primary/20 p-6 sm:p-8 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* LEFT: IMAGE SKELETON */}
                    <div className="space-y-4">
                        <Skeleton className="aspect-square w-full rounded-3xl" />
                        <div className="grid grid-cols-3 gap-2">
                            <Skeleton className="h-14 rounded-2xl" />
                            <Skeleton className="h-14 rounded-2xl" />
                            <Skeleton className="h-14 rounded-2xl" />
                        </div>
                    </div>

                    {/* RIGHT: INFO SKELETON */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-24 rounded-lg" />
                            <Skeleton className="h-8 w-4/5 rounded-xl" />
                            <Skeleton className="h-4 w-48 rounded-md" />
                        </div>

                        {/* PRICE BOX SKELETON */}
                        <Skeleton className="h-16 w-full rounded-2xl" />

                        {/* QUANTITY SKELETON */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20 rounded-md" />
                            <Skeleton className="h-10 w-36 rounded-xl" />
                        </div>

                        {/* BUTTONS SKELETON */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                            <Skeleton className="h-12 rounded-2xl" />
                            <Skeleton className="h-12 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* DESCRIPTION SKELETON */}
            <div className="rounded-3xl bg-surface-card border border-primary/20 p-6 sm:p-8 space-y-4">
                <Skeleton className="h-6 w-44 rounded-lg" />
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
        </div>
    );
}
