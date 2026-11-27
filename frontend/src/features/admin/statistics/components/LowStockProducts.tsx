import Link from "next/link";
import { AlertTriangle, ChevronRight, Package } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { ProductInventoryItem } from "../types";

interface LowStockProductsProps {
    products: ProductInventoryItem[];
}

const VISIBLE_PRODUCT_LIMIT = 3;

export function LowStockProducts({ products }: LowStockProductsProps) {
    const visibleProducts = products.slice(0, VISIBLE_PRODUCT_LIMIT);

    return (
        <section className="min-w-0 lg:col-span-4 rounded-2xl border border-surface-border bg-surface-card p-3.5 shadow-xs">
            <h2 className="text-xs font-bold text-status-error flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Sắp hết hàng
                <span className="ml-auto rounded-md bg-status-error/10 text-status-error px-1.5 py-0.5 text-[9px]">
                    {products.length}
                </span>
            </h2>
            <div className="space-y-0.5">
                {visibleProducts.map((item) => (
                    <div
                        key={item.product_id}
                        className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-surface-hover"
                    >
                        <div className="w-9 h-9 rounded-md bg-surface-hover overflow-hidden shrink-0 flex items-center justify-center">
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
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-text-main truncate">
                                {item.product_name}
                            </p>
                            <p className="text-[9px] text-text-muted">
                                Còn {item.quantity} sản phẩm
                            </p>
                        </div>
                    </div>
                ))}
                {products.length === 0 && (
                    <div className="py-8 text-center text-xs text-text-muted">
                        Không có sản phẩm sắp hết hàng
                    </div>
                )}
            </div>
            <Link
                href={ROUTES.ADMIN.PRODUCTS}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-surface-border py-1.5 text-[10px] font-semibold text-text-sub transition-colors hover:border-primary/40 hover:bg-surface-hover hover:text-primary"
            >
                Xem tất cả sản phẩm
                <ChevronRight className="h-3 w-3" />
            </Link>
        </section>
    );
}
