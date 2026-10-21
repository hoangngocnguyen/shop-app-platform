"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    AlertCircle,
    ArrowLeft,
    Banknote,
    Check,
    ChevronRight,
    CreditCard,
    Loader2,
    MapPin,
    PackageCheck,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
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

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-surface-bg px-4 py-8 text-center text-sm text-text-sub">Đang tải thông tin checkout...</div>}>
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
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("VNPAY");
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

    useEffect(() => {
        if (!addresses.length) return;

        const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0];
        if (!selectedAddress || selectedAddress.id !== defaultAddress.id) {
            setSelectedAddress(defaultAddress);
        }
    }, [addresses, selectedAddress, setSelectedAddress]);

    const subtotal = useMemo(() => Number(previewData?.subtotal ?? 0), [previewData]);
    const shippingFee = 0;
    const total = subtotal + shippingFee;

    const submitOrder = async () => {
        if (submitRequestLockRef.current) {
            return;
        }

        if (!selectedAddress) {
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
                address_id: selectedAddress.id,
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
        <main className="min-h-screen bg-surface-bg px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <Link href="/user/cart" className="inline-flex items-center gap-2 text-sm font-medium text-text-sub hover:text-primary">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại giỏ hàng
                    </Link>
                    <div className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-card px-3 py-1.5 text-xs font-semibold text-text-sub shadow-brand-sm">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Preview đơn hàng
                    </div>
                </div>

                <div className="mb-6 rounded-3xl border border-surface-border bg-surface-card p-6 shadow-brand-md">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Thanh toán</p>
                            <h1 className="mt-2 text-2xl font-black tracking-tight text-text-main sm:text-3xl">Xác nhận đơn hàng</h1>
                        </div>
                        <div className="rounded-2xl border border-primary/20 bg-primary-light px-3 py-2 text-sm font-semibold text-primary">
                            {payload.checkout_type === "BUY_NOW" ? "Mua ngay" : "Từ giỏ hàng"}
                        </div>
                    </div>
                </div>

                {orderError ? (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-status-error/20 bg-status-error-bg p-4 text-sm text-status-error">
                        <AlertCircle className="h-5 w-5" />
                        <span>{orderError}</span>
                    </div>
                ) : null}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_340px]">
                    <section className="space-y-6">
                        <div className="rounded-3xl border border-surface-border bg-surface-card p-5 shadow-brand-sm sm:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-text-main">Danh sách sản phẩm</h2>
                                    <p className="text-xs text-text-muted">Danh sách sản phẩm đang được kiểm tra và xác nhận trước khi đặt hàng</p>
                                </div>
                            </div>

                            {isFetchingPreview ? (
                                <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-text-sub">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    Đang tải preview đơn hàng...
                                </div>
                            ) : previewData && previewData.items.length > 0 ? (
                                <div className="space-y-4">
                                    {previewData.items.map((item) => (
                                        <div key={`${item.product_id}-${item.quantity}`} className="flex items-center gap-4 rounded-2xl border border-surface-border bg-surface-bg p-3 sm:p-4">
                                            <div className="h-16 w-16 overflow-hidden rounded-xl border border-surface-border bg-white">
                                                {item.product_image ? (
                                                    <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-primary-light text-xs font-bold text-primary">IMG</div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-text-main sm:text-base">{item.product_name}</p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-sub">
                                                    <span>Đơn giá: {formatMoney(item.price)}</span>
                                                    <span className="text-text-muted">•</span>
                                                    <span>Số lượng: {item.quantity}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-text-sub">Thành tiền</p>
                                                <p className="mt-1 text-base font-extrabold text-text-main">{formatMoney(item.total_price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-surface-border bg-surface-bg p-6 text-center text-sm text-text-sub">
                                    Không có dữ liệu preview đơn hàng.
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-surface-border bg-surface-card p-5 shadow-brand-sm sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-text-main">Địa chỉ giao hàng</h2>
                                    <p className="text-xs text-text-muted">Chỉ định nơi nhận hàng cho đơn mua</p>
                                </div>
                            </div>

                            {selectedAddress ? (
                                <div className="rounded-2xl border border-primary/20 bg-primary-light/30 p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <span className="text-sm font-bold text-text-main">{selectedAddress.recipient_name}</span>
                                                {selectedAddress.is_default ? (
                                                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-contrast">Mặc định</span>
                                                ) : null}
                                            </div>
                                            <p className="text-sm font-medium text-text-sub">{selectedAddress.phone}</p>
                                            <p className="mt-1 text-sm leading-6 text-text-main">{selectedAddress.address_line}</p>
                                            {selectedAddress.ward_name || selectedAddress.province_name ? (
                                                <p className="text-xs text-text-muted">{[selectedAddress.ward_name, selectedAddress.province_name].filter(Boolean).join(", ")}</p>
                                            ) : null}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsAddressPickerOpen(true)}
                                            className="rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm font-semibold text-text-sub transition hover:border-primary/40 hover:text-primary"
                                        >
                                            Thay đổi
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsAddressFormOpen(true)}
                                    className="w-full rounded-2xl border border-dashed border-primary/40 bg-primary-light/30 px-4 py-6 text-sm font-semibold text-primary"
                                >
                                    + Thêm địa chỉ giao hàng
                                </button>
                            )}
                        </div>

                        <div className="rounded-3xl border border-surface-border bg-surface-card p-5 shadow-brand-sm sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-text-main">Phương thức thanh toán</h2>
                                    <p className="text-xs text-text-muted">Chọn cách thanh toán cho đơn hàng</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { value: PAYMENT_METHOD.VNPAY, label: "Thanh toán VNPAY", description: "Thanh toán qua cổng VNPAY an toàn, nhanh chóng", icon: CreditCard },
                                    { value: PAYMENT_METHOD.COD, label: "Thanh toán khi nhận hàng (COD)", description: "Thanh toán trực tiếp khi người giao hàng đến", icon: Banknote },
                                ].map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = paymentMethod === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setPaymentMethod(option.value as PaymentMethod)}
                                            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${isSelected ? "border-primary bg-primary-light/30 shadow-brand-sm" : "border-surface-border bg-surface-bg hover:border-primary/40"
                                                }`}
                                        >
                                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isSelected ? "bg-primary text-primary-contrast" : "bg-surface-card text-text-sub"}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-text-main">{option.label}</span>
                                                    {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                                                </div>
                                                <p className="mt-1 text-xs text-text-sub">{option.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-surface-border bg-surface-card p-5 shadow-brand-sm sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                    <PackageCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-text-main">Ghi chú đơn hàng</h2>
                                    <p className="text-xs text-text-muted">Tùy chọn, giúp người giao hàng thuận tiện hơn</p>
                                </div>
                            </div>

                            <textarea
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                rows={4}
                                placeholder="Ghi chú cho đơn hàng (ví dụ: giao giờ hành chính...)"
                                className="w-full rounded-2xl border border-surface-border bg-surface-bg px-4 py-3 text-sm text-text-main placeholder:text-text-muted outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </section>

                    <aside className="lg:sticky lg:top-4 lg:h-fit">
                        <div className="rounded-3xl border border-surface-border bg-surface-card p-5 shadow-brand-md sm:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-text-main">Tóm tắt đơn hàng</h2>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-text-sub">
                                <div className="flex items-center justify-between">
                                    <span>Tạm tính</span>
                                    <span className="font-semibold text-text-main">{formatMoney(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-medium text-text-sub">{shippingFee === 0 ? "Tính khi giao" : formatMoney(shippingFee)}</span>
                                </div>
                                <div className="my-3 h-px bg-surface-border" />
                                <div className="flex items-center justify-between text-base font-black text-primary">
                                    <span>Tổng cộng</span>
                                    <span>{formatMoney(total)}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={!selectedAddress || !previewData || previewData.items.length === 0 || isSubmittingOrder || orderLoading}
                                onClick={submitOrder}
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-contrast shadow-brand-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-border disabled:text-text-muted"
                            >
                                {isSubmittingOrder || orderLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang đặt hàng...
                                    </>
                                ) : (
                                    <>
                                        Đặt hàng
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            {isAddressPickerOpen ? (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-surface-border bg-surface-card p-5 shadow-brand-md">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-text-main">Chọn địa chỉ giao hàng</h3>
                            <button type="button" onClick={() => setIsAddressPickerOpen(false)} className="rounded-xl p-2 text-text-muted hover:bg-surface-bg hover:text-text-main">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3">
                            {addresses.length > 0 ? (
                                addresses.map((address) => (
                                    <button
                                        key={address.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedAddress(address);
                                            setIsAddressPickerOpen(false);
                                        }}
                                        className={`w-full rounded-2xl border p-4 text-left transition ${selectedAddress?.id === address.id ? "border-primary bg-primary-light/30" : "border-surface-border bg-surface-bg hover:border-primary/40"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="font-bold text-text-main">{address.recipient_name}</span>
                                                    {address.is_default ? <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Mặc định</span> : null}
                                                </div>
                                                <p className="text-sm text-text-sub">{address.phone}</p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-text-main">{address.address_line}</p>
                                    </button>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-surface-border bg-surface-bg p-4 text-sm text-text-sub">
                                    Bạn chưa có địa chỉ nào. Hãy thêm mới để tiếp tục đặt hàng.
                                </div>
                            )}
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                onClick={() => handleFormOpen()}
                                className="flex-1 rounded-2xl border border-surface-border bg-surface-bg px-4 py-3 text-sm font-semibold text-text-main hover:border-primary/40 hover:text-primary"
                            >
                                + Thêm địa chỉ mới
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddressPickerOpen(false)}
                                className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-contrast"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

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
