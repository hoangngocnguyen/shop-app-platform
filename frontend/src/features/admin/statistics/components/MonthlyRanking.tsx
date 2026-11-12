"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Trophy, UserRound } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { TopCustomerItem, TopSellingProductItem } from "../types";
import { formatMoney } from "../utils";

interface MonthlyRankingProps {
    topProducts: TopSellingProductItem[];
    topCustomers: TopCustomerItem[];
}

export function MonthlyRanking({
    topProducts,
    topCustomers,
}: MonthlyRankingProps) {
    const [rankMode, setRankMode] = useState<"products" | "customers">(
        "products"
    );

    return (
        <section className="rounded-2xl border border-surface-border bg-surface-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-text-main">
                    Bảng xếp hạng tháng
                </h2>
                <Trophy className="w-4 h-4 text-accent" />
            </div>
            <div className="inline-flex w-full rounded-lg bg-surface-bg border border-surface-border p-1 mb-4">
                <button
                    type="button"
                    onClick={() => setRankMode("products")}
                    className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-bold transition-colors ${
                        rankMode === "products"
                            ? "bg-primary text-primary-contrast"
                            : "text-text-muted"
                    }`}
                >
                    Top sản phẩm
                </button>
                <button
                    type="button"
                    onClick={() => setRankMode("customers")}
                    className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-bold transition-colors ${
                        rankMode === "customers"
                            ? "bg-primary text-primary-contrast"
                            : "text-text-muted"
                    }`}
                >
                    Top khách hàng
                </button>
            </div>
            <div className="min-h-28">
                {rankMode === "products" &&
                    topProducts.map((item, index) => (
                        <Link
                            key={item.product_id}
                            href={ROUTES.PRODUCTS.DETAIL(item.product_id)}
                            title={item.product_name}
                            aria-label={`Xem chi tiết sản phẩm ${item.product_name}`}
                            className="flex items-center gap-2 py-1.5 border-b border-surface-border/60 last:border-0 rounded-md hover:bg-surface-hover transition-colors"
                        >
                            <span className="w-5 h-5 rounded-full bg-primary-light text-text-main text-[10px] font-black flex items-center justify-center">
                                {index + 1}
                            </span>
                            <span className="w-8 h-8 rounded-md bg-surface-hover overflow-hidden shrink-0 flex items-center justify-center">
                                {item.image_src ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.image_src}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Package className="w-4 h-4 text-text-muted" />
                                )}
                            </span>
                            <span className="text-xs text-text-main truncate flex-1">
                                {item.product_name}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted">
                                {item.sold_quantity} bán
                            </span>
                        </Link>
                    ))}
                {rankMode === "customers" &&
                    topCustomers.map((item, index) => (
                        <Link
                            key={item.user_id}
                            href={ROUTES.ADMIN.USERS}
                            title={`Quản lý người dùng: ${item.name || item.username || item.email || "khách hàng"}`}
                            className="flex items-center gap-2 py-1.5 border-b border-surface-border/60 last:border-0 rounded-md hover:bg-surface-hover transition-colors"
                        >
                            <span className="w-5 h-5 rounded-full bg-accent-light text-text-main text-[10px] font-black flex items-center justify-center">
                                {index + 1}
                            </span>
                            <span className="w-8 h-8 rounded-full bg-surface-hover overflow-hidden shrink-0 flex items-center justify-center">
                                {item.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.avatar_url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserRound className="w-4 h-4 text-text-muted" />
                                )}
                            </span>
                            <span className="text-xs text-text-main truncate flex-1">
                                {item.name ||
                                    item.username ||
                                    item.email ||
                                    "Khách hàng"}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted">
                                {formatMoney(item.total_spent)}
                            </span>
                        </Link>
                    ))}
                {rankMode === "products" && topProducts.length === 0 && (
                    <div className="h-28 flex items-center justify-center text-xs text-text-muted">
                        Chưa có sản phẩm
                    </div>
                )}
                {rankMode === "customers" && topCustomers.length === 0 && (
                    <div className="h-28 flex items-center justify-center text-xs text-text-muted">
                        Chưa có khách hàng
                    </div>
                )}
            </div>
        </section>
    );
}
