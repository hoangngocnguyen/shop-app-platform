"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "@/common/stores/useToastStore";
import { useOrderStore } from "@/features/orders/stores";
import { orderApi } from "@/features/orders/api";
import { paymentApi } from "@/features/payment/api";
import { PAYMENT_METHOD, type OrderDetailResponse, type PaymentMethod } from "@/features/orders/types";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PAYMENT_METHOD.BANK_TRANSFER]: "Chuyển khoản ngân hàng",
    [PAYMENT_METHOD.VNPAY]: "VNPAY",
    [PAYMENT_METHOD.COD]: "COD",
};

const formatMoney = (value: number | string) => {
    const numericValue = typeof value === "number" ? value : Number(value ?? 0);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(numericValue);
};

const buildFallbackOrderDetail = (orderIdValue: string, createdOrderValue?: { order_id: string; payment_method: OrderDetailResponse["payment_method"]; status: OrderDetailResponse["status"]; total: number | string }): OrderDetailResponse => ({
    order_id: createdOrderValue?.order_id ?? orderIdValue,
    user_id: "",
    payment_method: createdOrderValue?.payment_method ?? "VNPAY",
    payment_status: "PENDING",
    status: createdOrderValue?.status ?? "PENDING",
    address_id: null,
    shipping_recipient_name: "",
    shipping_phone: "",
    shipping_province_name: "",
    shipping_ward_name: "",
    shipping_address_line: "",
    note: null,
    order_details: [],
    order_logs: [],
    subtotal: createdOrderValue?.total ?? 0,
    shipping_fee: 0,
    total_amount: createdOrderValue?.total ?? 0,
    created_at: new Date().toISOString(),
    estimated_delivery_date: null,
    delivered_at: null,
    cancel_reason: null,
    cancelled_by_type: null,
    cancelled_by_id: null,
    cancelled_at: null,
});

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface-bg px-4 text-sm text-text-sub">Đang tải kết quả đơn hàng...</div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}

function OrderSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id") ?? "";
    const { createdOrder, selectedOrder, setSelectedOrder, fetchOrderById, isLoading } = useOrderStore();
    const [detail, setDetail] = useState<OrderDetailResponse | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        if (!orderId) {
            router.replace("/");
            return;
        }

        const loadOrder = async () => {
            let result: OrderDetailResponse | null = null;

            if (selectedOrder?.order_id === orderId) {
                result = selectedOrder;
            } else if (createdOrder && createdOrder.order_id === orderId) {
                result = buildFallbackOrderDetail(orderId, createdOrder);
            } else {
                result = await fetchOrderById(orderId);
            }

            if (result) {
                setDetail(result);
                setSelectedOrder(result);
            } else {
                setDetail(buildFallbackOrderDetail(orderId));
            }
        };

        loadOrder();
    }, [createdOrder, fetchOrderById, orderId, router, selectedOrder, setSelectedOrder]);

    const paymentMethodLabel = useMemo(() => {
        if (!detail) return "VNPAY";
        return PAYMENT_METHOD_LABELS[detail.payment_method];
    }, [detail]);

    const canPayNow = detail?.payment_method === PAYMENT_METHOD.VNPAY && (detail.payment_status === "PENDING" || !detail.payment_status);

    const handlePayNow = async () => {
        if (!orderId) return;
        setIsPaying(true);

        try {
            const payment = await paymentApi.createPayment({ order_id: orderId });
            if (!payment?.payment_url) {
                toast.error("Không thể tạo URL thanh toán. Vui lòng thử lại.");
                return;
            }
            window.location.href = payment.payment_url;
        } catch {
            toast.error("Có lỗi xảy ra khi chuyển hướng thanh toán.");
        } finally {
            setIsPaying(false);
        }
    };

    const renderState = detail ?? {
        order_id: orderId || "#ORD-UNKNOWN",
        payment_method: "VNPAY" as const,
        payment_status: "PENDING" as const,
        status: "PENDING" as const,
        total_amount: 0,
    };

    if (isLoading && !detail) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-surface-bg px-4">
                <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-card px-5 py-4 text-sm font-medium text-text-sub shadow-brand-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    Đang tải thông tin đơn hàng...
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-surface-bg px-4 py-8 sm:px-6">
            <div className="w-full max-w-2xl rounded-3xl border border-surface-border bg-surface-card p-6 shadow-brand-md sm:p-8">
                <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-success-bg text-status-success shadow-brand-sm">
                        <CheckCircle2 className="h-9 w-9" />
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-black tracking-tight text-text-main sm:text-3xl">Đặt hàng thành công</h1>
                    <p className="mt-2 text-sm text-text-sub">Đơn hàng của bạn đã được tạo và đang chờ xử lý.</p>
                </div>

                <div className="mt-6 rounded-2xl border border-surface-border bg-surface-bg p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Mã đơn hàng</p>
                            <p className="mt-1 text-base font-bold text-text-main">#{renderState.order_id}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Tổng tiền</p>
                            <p className="mt-1 text-base font-bold text-text-main">{formatMoney(renderState.total_amount)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Thanh toán</p>
                            <p className="mt-1 text-base font-bold text-text-main">{paymentMethodLabel}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Trạng thái</p>
                            <p className="mt-1 text-base font-bold text-text-main">{renderState.status}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {canPayNow ? (
                        <button
                            type="button"
                            onClick={handlePayNow}
                            disabled={isPaying}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-contrast shadow-brand-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-border disabled:text-text-muted"
                        >
                            {isPaying ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang chuyển tới cổng thanh toán...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4" />
                                    Thanh toán ngay
                                </>
                            )}
                        </button>
                    ) : null}

                    <Link
                        href="/"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-surface-border bg-surface-bg px-4 py-3.5 text-sm font-bold text-text-main transition hover:border-primary/40 hover:text-primary"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </main>
    );
}
