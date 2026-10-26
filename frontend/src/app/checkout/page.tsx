"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    AlertCircle,
    ArrowLeft,
    Banknote,
    Check,
    ChevronDown,
    ChevronRight,
    CreditCard,
    Loader2,
    MapPin,
    PackageCheck,
    ShieldCheck,
    X,
} from "lucide-react";
import { toast } from "@/common/stores/useToastStore";
import AddressFormModal from "@/features/shipping-address/components/AddressFormModal";
import { useShippingAddressStore } from "@/features/shipping-address/stores";
import type { ShippingAddressResponse } from "@/features/shipping-address/types";
import { useOrderStore } from "@/features/orders/stores";
import { PAYMENT_METHOD, type CheckoutPreviewRequest, type CheckoutPreviewResponse, type CheckoutType, type PaymentMethod } from "@/features/orders/types";
import { productApi } from "@/features/products/api";

const formatMoney = (value: number | string) => {
    const numericValue = typeof value === "number" ? value : Number(value ?? 0);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(numericValue);
};

const buildPreviewFromProduct = (productId: number, quantity: number, product: { product_name: string; image_src: string | null; sale_price?: number | string | null; price?: number | string | null }): CheckoutPreviewResponse => {
    const price = Number(product.sale_price ?? product.price ?? 0);
    const totalPrice = price * quantity;

    return {
        items: [
            {
                product_id: productId,
                product_name: product.product_name,
                product_image: product.image_src ?? null,
                price,
                quantity,
                total_price: totalPrice,
            },
        ],
        subtotal: totalPrice,
    };
};

const parsePayloadFromSearch = (searchParams: URLSearchParams): CheckoutPreviewRequest => {
    const checkoutType = (searchParams.get("checkout_type") as CheckoutType | null) ?? "BUY_NOW";

    if (checkoutType === "BUY_NOW") {
        const productId = Number(searchParams.get("product_id") ?? 0);
        const quantity = Number(searchParams.get("quantity") ?? 1);

        return {
            checkout_type: "BUY_NOW",
            buy_now_item: {
                product_id: Number.isFinite(productId) && productId > 0 ? productId : 0,
                quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
            },
        };
    }

    const cartIds = searchParams.get("cart_item_ids");

    return {
        checkout_type: "CART",
        cart_item_ids: cartIds ? cartIds.split(",").map((item) => Number(item.trim())).filter((item) => Number.isFinite(item) && item > 0) : [],
    };
};

function ProductListCard({ previewData, isFetchingPreview }: { previewData: CheckoutPreviewResponse | null; isFetchingPreview: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isFetchingPreview) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-bg/50 px-3 py-3 text-xs sm:text-sm text-text-sub">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Đang tải thông tin sản phẩm...</span>
            </div>
        );
    }

    if (!previewData || previewData.items.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-surface-border bg-surface-bg/50 px-4 py-4 text-center text-xs sm:text-sm text-text-sub">
                Không có sản phẩm nào trong đơn hàng.
            </div>
        );
    }

    const visibleItems = isExpanded ? previewData.items : previewData.items.slice(0, 3);

    return (
        <div className="space-y-2.5">
            {visibleItems.map((item) => (
                <div key={`${item.product_id}-${item.product_name}`} className="flex gap-2.5 rounded-lg border border-surface-border/60 bg-surface-bg/40 p-2.5 sm:gap-3 sm:p-3 transition-colors hover:bg-surface-bg/70">
                    <div className="h-13 w-13 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg border border-surface-border/50 bg-surface-card">
                        {item.product_image ? (
                            <Image src={item.product_image} alt={item.product_name} width={56} height={56} unoptimized className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-text-muted sm:text-xs">
                                SP
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs sm:text-sm font-medium text-text-main">{item.product_name}</p>
                        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-text-sub">
                            <span>
                                {item.quantity} × {formatMoney(item.price)}
                            </span>
                            <span className="font-semibold text-price">{formatMoney(item.total_price)}</span>
                        </div>
                    </div>
                </div>
            ))}

            {previewData.items.length > 3 ? (
                <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs sm:text-sm font-medium text-text-sub transition-colors hover:border-primary/40 hover:text-primary"
                >
                    <span>{isExpanded ? "Thu gọn bớt" : `Xem thêm ${previewData.items.length - 3} sản phẩm`}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </button>
            ) : null}
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center bg-surface-bg px-4 text-xs sm:text-sm text-text-sub">Đang tải thông tin đơn hàng...</div>}>
            <CheckoutPageContent />
        </Suspense>
    );
}

function CheckoutPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const payloadKey = searchParams.toString();
    const payload = useMemo(() => parsePayloadFromSearch(new URLSearchParams(payloadKey)), [payloadKey]);

    const {
        previewCheckout,
        createOrder,
        isLoading: orderLoading,
        error: orderError,
    } = useOrderStore();

    const {
        addresses,
        selectedAddress,
        fetchUserAddresses,
        setSelectedAddress,
        createAddress,
        updateAddress,
    } = useShippingAddressStore();

    const [previewData, setPreviewData] = useState<CheckoutPreviewResponse | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.COD);
    const [note, setNote] = useState("");
    const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<ShippingAddressResponse | null>(null);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [isFetchingPreview, setIsFetchingPreview] = useState(true);
    const submitRequestLockRef = useRef(false);

    useEffect(() => {
        fetchUserAddresses();
    }, [fetchUserAddresses]);

    useEffect(() => {
        let isMounted = true;

        const loadPreview = async () => {
            setIsFetchingPreview(true);

            try {
                const result = await previewCheckout(payload);

                if (isMounted) {
                    if (result) {
                        setPreviewData(result);
                    } else if (payload.checkout_type === "BUY_NOW" && payload.buy_now_item && payload.buy_now_item.product_id > 0) {
                        const product = await productApi.getProductDetail(payload.buy_now_item.product_id);
                        setPreviewData(buildPreviewFromProduct(payload.buy_now_item.product_id, payload.buy_now_item.quantity, product));
                    } else {
                        setPreviewData(null);
                    }
                }
            } catch {
                if (isMounted) {
                    setPreviewData(null);
                }
            } finally {
                if (isMounted) {
                    setIsFetchingPreview(false);
                }
            }
        };

        loadPreview();

        return () => {
            isMounted = false;
        };
    }, [payload, previewCheckout]);

    const defaultAddress = useMemo(
        () => addresses.find((address) => address.is_default) ?? addresses[0] ?? null,
        [addresses],
    );
    const currentSelectedAddress = selectedAddress ?? defaultAddress;

    const subtotal = useMemo(() => Number(previewData?.subtotal ?? 0), [previewData]);
    const shippingFee = 0;
    const total = subtotal + shippingFee;

    const submitOrder = async () => {
        if (submitRequestLockRef.current) {
            return;
        }

        if (!currentSelectedAddress) {
            toast.error("Vui lòng chọn địa chỉ giao hàng trước khi đặt hàng.");
            return;
        }

        if (!previewData || previewData.items.length === 0) {
            toast.error("Không có sản phẩm nào trong đơn hàng để thanh toán.");
            return;
        }

        submitRequestLockRef.current = true;
        setIsSubmittingOrder(true);

        try {
            const result = await createOrder({
                items: previewData.items.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                expected_subtotal: previewData.subtotal,
                address_id: currentSelectedAddress.id,
                payment_method: paymentMethod,
                note: note.trim() || null,
            });

            if (!result) {
                toast.error("Đặt hàng thất bại, vui lòng thử lại.");
                return;
            }

            router.push(`/checkout/success?order_id=${encodeURIComponent(result.order_id)}`);
        } catch {
            toast.error("Có lỗi xảy ra trong quá trình đặt hàng.");
        } finally {
            submitRequestLockRef.current = false;
            setIsSubmittingOrder(false);
        }
    };

    const saveAddress = async (data: Parameters<typeof createAddress>[0] | Parameters<typeof updateAddress>[0]) => {
        try {
            if (editingAddress) {
                const updated = await updateAddress(editingAddress.id, data as Parameters<typeof updateAddress>[1]);
                if (updated) {
                    await fetchUserAddresses();
                    setSelectedAddress(updated);
                    toast.success("Cập nhật địa chỉ thành công!");
                }
            } else {
                const created = await createAddress(data as Parameters<typeof createAddress>[0]);
                if (created) {
                    await fetchUserAddresses();
                    setSelectedAddress(created);
                    toast.success("Thêm địa chỉ thành công!");
                }
            }
            setIsAddressFormOpen(false);
            setEditingAddress(null);
        } catch {
            toast.error("Không thể lưu địa chỉ, vui lòng thử lại.");
        }
    };

    const handleFormOpen = (address?: ShippingAddressResponse) => {
        setEditingAddress(address ?? null);
        setIsAddressFormOpen(true);
        setIsAddressPickerOpen(false);
    };

    return (
        <main className="min-h-screen bg-surface-bg px-4 pb-24 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-4 sm:space-y-5">
                {/* Back button & Breadcrumb */}
                <div className="flex items-center justify-between gap-3">
                    <Link
                        href="/user/cart"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-text-sub transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Quay lại giỏ hàng</span>
                    </Link>
                </div>

                {/* Header Banner */}
                <div className="rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5 shadow-xs">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">Xác nhận đơn hàng</h1>
                    <p className="mt-0.5 text-xs sm:text-sm text-text-sub">Kiểm tra lại thông tin nhận hàng và phương thức thanh toán</p>
                </div>

                {orderError ? (
                    <div className="flex items-center gap-2.5 rounded-lg border border-status-error/25 bg-status-error-bg p-3.5 text-xs sm:text-sm text-status-error">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{orderError}</span>
                    </div>
                ) : null}

                <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.6fr)_360px]">
                    <section className="space-y-4 sm:space-y-5">
                        {/* 1. Địa chỉ giao hàng */}
                        <div className="rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5 shadow-xs">
                            <div className="mb-3.5 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm sm:text-base font-semibold text-text-main">Địa chỉ giao hàng</h2>
                            </div>

                            {currentSelectedAddress ? (
                                <div className="rounded-lg border border-primary/25 bg-primary-light/20 p-3.5 sm:p-4">
                                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-semibold text-text-main">{currentSelectedAddress.recipient_name}</span>
                                                <span className="text-xs text-text-sub font-medium">{currentSelectedAddress.phone}</span>
                                                {currentSelectedAddress.is_default ? (
                                                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-contrast">
                                                        Mặc định
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="mt-1 text-xs sm:text-sm text-text-main leading-relaxed">{currentSelectedAddress.address_line}</p>
                                            {currentSelectedAddress.ward_name || currentSelectedAddress.province_name ? (
                                                <p className="mt-0.5 text-xs text-text-muted">
                                                    {[currentSelectedAddress.ward_name, currentSelectedAddress.province_name].filter(Boolean).join(", ")}
                                                </p>
                                            ) : null}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsAddressPickerOpen(true)}
                                            className="w-full sm:w-auto rounded-lg border border-surface-border bg-surface-card px-3 py-1.5 text-xs sm:text-sm font-medium text-text-sub transition-colors hover:border-primary/40 hover:text-primary"
                                        >
                                            Thay đổi
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsAddressFormOpen(true)}
                                    className="w-full rounded-lg border border-dashed border-primary/40 bg-primary-light/20 p-4 text-xs sm:text-sm font-medium text-primary transition-colors hover:bg-primary-light/35"
                                >
                                    + Thêm địa chỉ giao hàng
                                </button>
                            )}
                        </div>

                        {/* 2. Ghi chú đơn hàng */}
                        <div className="rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5 shadow-xs">
                            <div className="mb-3.5 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                                    <PackageCheck className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm sm:text-base font-semibold text-text-main">Ghi chú đơn hàng</h2>
                            </div>

                            <textarea
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                rows={2}
                                placeholder="Ghi chú thêm cho người bán hoặc đơn vị vận chuyển (tùy chọn)..."
                                className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs sm:text-sm text-text-main placeholder:text-text-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                            />
                        </div>

                        {/* 3. Danh sách sản phẩm */}
                        <div className="rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5 shadow-xs">
                            <div className="mb-3.5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                                        <PackageCheck className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm sm:text-base font-semibold text-text-main">Sản phẩm đặt mua</h2>
                                </div>
                                <span className="rounded-full bg-surface-bg px-2.5 py-0.5 text-xs font-medium text-text-sub border border-surface-border/60">
                                    {previewData?.items.length ?? 0} món
                                </span>
                            </div>

                            <ProductListCard key={payloadKey} previewData={previewData} isFetchingPreview={isFetchingPreview} />
                        </div>

                        {/* 4. Phương thức thanh toán */}
                        <div className="rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5 shadow-xs">
                            <div className="mb-3.5 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm sm:text-base font-semibold text-text-main">Phương thức thanh toán</h2>
                            </div>

                            <div className="space-y-2.5">
                                {[
                                    { value: PAYMENT_METHOD.COD, label: "Thanh toán khi nhận hàng (COD)", description: "Thanh toán tiền mặt khi giao hàng tận nơi", icon: Banknote },
                                    { value: PAYMENT_METHOD.VNPAY, label: "Cổng thanh toán VNPAY", description: "Thanh toán online bảo mật qua thẻ ATM, QR Code hoặc ví điện tử", icon: CreditCard },
                                ].map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = paymentMethod === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setPaymentMethod(option.value as PaymentMethod)}
                                            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors sm:p-3.5 ${
                                                isSelected
                                                    ? "border-primary bg-primary-light/20 ring-1 ring-primary/30"
                                                    : "border-surface-border bg-surface-bg/40 hover:bg-surface-card hover:border-surface-border/80"
                                            }`}
                                        >
                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                isSelected ? "bg-primary text-primary-contrast" : "border border-surface-border bg-surface-card text-text-sub"
                                            }`}>
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs sm:text-sm font-medium text-text-main">{option.label}</span>
                                                    {isSelected ? <Check className="h-4 w-4 text-primary ml-auto" /> : null}
                                                </div>
                                                <p className="mt-0.5 text-xs text-text-sub">{option.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Tóm tắt đơn hàng (Desktop Aside) */}
                    <aside className="hidden lg:sticky lg:top-4 lg:block lg:h-fit">
                        <div className="rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5 shadow-xs">
                            <div className="mb-3.5 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm sm:text-base font-semibold text-text-main">Tóm tắt đơn hàng</h2>
                            </div>

                            <div className="space-y-2.5 text-xs sm:text-sm text-text-sub">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Tạm tính</span>
                                    <span className="font-medium text-text-main">{formatMoney(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-medium text-text-main">{shippingFee === 0 ? "Miễn phí" : formatMoney(shippingFee)}</span>
                                </div>
                                <div className="my-2.5 border-t border-surface-border" />
                                <div className="flex items-center justify-between gap-3 text-sm sm:text-base font-bold text-text-main">
                                    <span>Tổng thanh toán</span>
                                    <span className="text-base sm:text-lg text-price">{formatMoney(total)}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={!currentSelectedAddress || !previewData || previewData.items.length === 0 || isSubmittingOrder || orderLoading}
                                onClick={submitOrder}
                                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-sm font-semibold text-primary-contrast shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmittingOrder || orderLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Đang xử lý đơn...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Đặt hàng</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Mobile Bottom Fixed Bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-border bg-surface-card/95 px-4 py-2.5 shadow-lg backdrop-blur-sm lg:hidden">
                <div className="mx-auto flex max-w-md items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium text-text-muted">Tổng thanh toán</p>
                        <p className="text-base font-bold text-price">{formatMoney(total)}</p>
                    </div>

                    <button
                        type="button"
                        disabled={!currentSelectedAddress || !previewData || previewData.items.length === 0 || isSubmittingOrder || orderLoading}
                        onClick={submitOrder}
                        className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs sm:text-sm font-semibold text-primary-contrast shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmittingOrder || orderLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                <span>Đang đặt...</span>
                            </>
                        ) : (
                            <span>Đặt hàng</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Modal Chọn địa chỉ giao hàng */}
            {isAddressPickerOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-xl border border-surface-border bg-surface-card p-5 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-text-main">Chọn địa chỉ giao hàng</h3>
                            <button
                                type="button"
                                onClick={() => setIsAddressPickerOpen(false)}
                                className="rounded-lg border border-surface-border p-1 text-text-muted hover:bg-surface-hover hover:text-text-main transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
                            {addresses.length > 0 ? (
                                addresses.map((address) => (
                                    <button
                                        key={address.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedAddress(address);
                                            setIsAddressPickerOpen(false);
                                        }}
                                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                                            currentSelectedAddress?.id === address.id
                                                ? "border-primary bg-primary-light/20 ring-1 ring-primary/30"
                                                : "border-surface-border bg-surface-bg/40 hover:bg-surface-card hover:border-surface-border/80"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs sm:text-sm font-semibold text-text-main">{address.recipient_name}</span>
                                                <span className="text-xs text-text-sub font-medium">{address.phone}</span>
                                            </div>
                                            {address.is_default ? (
                                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                    Mặc định
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="mt-1 text-xs text-text-main leading-relaxed">{address.address_line}</p>
                                    </button>
                                ))
                            ) : (
                                <div className="rounded-lg border border-dashed border-surface-border bg-surface-bg/50 p-4 text-center text-xs sm:text-sm text-text-sub">
                                    Bạn chưa có địa chỉ nào đã lưu.
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={() => handleFormOpen()}
                                className="flex-1 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-hover px-4 py-2 text-xs sm:text-sm font-medium text-text-main transition-colors"
                            >
                                + Thêm địa chỉ mới
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddressPickerOpen(false)}
                                className="rounded-lg bg-surface-hover px-4 py-2 text-xs sm:text-sm font-medium text-text-sub hover:text-text-main transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Modal Thêm / Chỉnh sửa địa chỉ */}
            {isAddressFormOpen ? (
                <AddressFormModal
                    isOpen={isAddressFormOpen}
                    onClose={() => {
                        setIsAddressFormOpen(false);
                        setEditingAddress(null);
                    }}
                    editingAddress={editingAddress}
                    onSubmit={saveAddress}
                    isSubmitting={false}
                    isFirstAddress={addresses.length === 0}
                />
            ) : null}
        </main>
    );
}
