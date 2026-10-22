"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingCart, Sparkles, Zap } from "lucide-react";

const scenarios = [
    {
        key: "BUY_NOW",
        title: "🛒 Mua ngay",
        description: "Product ID = 6, Quantity = 3",
        payload: { checkout_type: "BUY_NOW", buy_now_item: { product_id: 6, quantity: 3 } },
    },
    {
        key: "CART",
        title: "🛍️ Từ giỏ hàng",
        description: "Cart item IDs = [5, 6, 7]",
        payload: { checkout_type: "CART", cart_item_ids: [5, 6, 7] },
    },
] as const;

export default function CheckoutTestPage() {
    const router = useRouter();
    const [productId, setProductId] = useState("6");
    const [quantity, setQuantity] = useState("3");
    const [cartIds, setCartIds] = useState("5, 6, 7");

    const defaultQuery = useMemo(() => {
        const parsed = cartIds.split(",").map((item) => Number(item.trim())).filter((item) => Number.isFinite(item));
        return {
            checkout_type: "CART",
            cart_item_ids: parsed.length ? parsed.join(",") : "5,6,7",
        };
    }, [cartIds]);

    const startWithScenario = (payload: (typeof scenarios)[number]["payload"]) => {
        const query = new URLSearchParams();
        if (payload.checkout_type === "BUY_NOW") {
            query.set("checkout_type", "BUY_NOW");
            query.set("product_id", String(payload.buy_now_item?.product_id ?? 6));
            query.set("quantity", String(payload.buy_now_item?.quantity ?? 3));
        } else {
            query.set("checkout_type", "CART");
            query.set("cart_item_ids", String((payload.cart_item_ids ?? [5, 6, 7]).join(",")));
        }

        router.push(`/checkout?${query.toString()}`);
    };

    const startCustomScenario = () => {
        const customProductId = Number(productId) || 6;
        const customQuantity = Number(quantity) || 1;
        const customCartIds = cartIds
            .split(",")
            .map((item) => Number(item.trim()))
            .filter((item) => Number.isFinite(item));

        const query = new URLSearchParams();
        query.set("checkout_type", customCartIds.length ? "CART" : "BUY_NOW");

        if (customCartIds.length) {
            query.set("cart_item_ids", customCartIds.join(","));
        } else {
            query.set("product_id", String(customProductId));
            query.set("quantity", String(customQuantity));
        }

        router.push(`/checkout?${query.toString()}`);
    };

    return (
        <main className="min-h-screen bg-surface-bg px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 rounded-3xl border border-surface-border bg-surface-card p-6 shadow-brand-md">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Test Flow</p>
                            <h1 className="mt-1 text-3xl font-black tracking-tight text-text-main">Checkout Test</h1>
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    {scenarios.map((scenario) => (
                        <button
                            key={scenario.key}
                            type="button"
                            onClick={() => startWithScenario(scenario.payload)}
                            className="group rounded-3xl border border-surface-border bg-surface-card p-5 text-left shadow-brand-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-brand-md"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-2.5 py-1 text-xs font-bold text-primary">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Scenario
                                </div>
                                <ArrowRight className="h-4 w-4 text-text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
                            </div>

                            <h2 className="text-xl font-black text-text-main">{scenario.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-text-sub">{scenario.description}</p>
                        </button>
                    ))}
                </div>

                <div className="mt-8 rounded-3xl border border-surface-border bg-surface-card p-6 shadow-brand-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-main">Kịch bản tùy chỉnh</h2>
                            <p className="text-xs text-text-muted">Điền dữ liệu bạn muốn test nhanh</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">Product ID</span>
                            <input
                                value={productId}
                                onChange={(event) => setProductId(event.target.value)}
                                className="w-full rounded-2xl border border-surface-border bg-surface-bg px-3 py-2.5 text-sm text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                placeholder="6"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">Quantity</span>
                            <input
                                value={quantity}
                                onChange={(event) => setQuantity(event.target.value)}
                                className="w-full rounded-2xl border border-surface-border bg-surface-bg px-3 py-2.5 text-sm text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                placeholder="3"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">Cart item IDs</span>
                            <input
                                value={cartIds}
                                onChange={(event) => setCartIds(event.target.value)}
                                className="w-full rounded-2xl border border-surface-border bg-surface-bg px-3 py-2.5 text-sm text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                placeholder="5, 6, 7"
                            />
                        </label>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={startCustomScenario}
                            className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-contrast shadow-brand-sm transition hover:bg-primary-hover"
                        >
                            Khởi chạy flow
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push(`/checkout?${new URLSearchParams(defaultQuery).toString()}`)}
                            className="rounded-2xl border border-surface-border bg-surface-bg px-4 py-2.5 text-sm font-semibold text-text-main transition hover:border-primary/40 hover:text-primary"
                        >
                            Dùng giỏ hàng mặc định
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
