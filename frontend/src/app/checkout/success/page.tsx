"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ClipboardList, CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "@/common/stores/useToastStore";
import { useOrderStore } from "@/features/orders/stores";
import { paymentApi } from "@/features/payment/api";
import {
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    PAYMENT_METHOD,
    PAYMENT_STATUS,
    type OrderDetailResponse,
    type PaymentMethod,
} from "@/features/orders/types";

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
    payment_method: createdOrderValue?.payment_method ?? PAYMENT_METHOD.VNPAY,
    payment_status: PAYMENT_STATUS.PENDING,
    status: createdOrderValue?.status ?? ORDER_STATUS.PENDING,
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
        <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center bg-surface-bg px-4 text-xs sm:text-sm text-text-sub">Đang tải kết quả đơn hàng...</div>}>
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

    const canPayNow = detail?.payment_method === PAYMENT_METHOD.VNPAY && (detail.payment_status === PAYMENT_STATUS.PENDING || !detail.payment_status);

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
        payment_method: PAYMENT_METHOD.VNPAY,
        payment_status: PAYMENT_STATUS.PENDING,
        status: ORDER_STATUS.PENDING,
        total_amount: 0,
    };

    if (isLoading && !detail) {
        return (
            <main className="flex min-h-[80vh] items-center justify-center bg-surface-bg px-4">
                <div className="flex items-center gap-2.5 rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-xs sm:text-sm font-medium text-text-sub shadow-xs">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Đang tải thông tin đơn hàng...
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-[80vh] items-center justify-center bg-surface-bg px-4 py-8 sm:px-6">
            <div className="w-full max-w-lg rounded-xl border border-surface-border bg-surface-card p-5 sm:p-7 shadow-xs">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-status-success-bg text-status-success">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                </div>

                <div className="text-center space-y-1">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">Đặt hàng thành công</h1>
                    <p className="text-xs sm:text-sm text-text-sub">Đơn hàng của bạn đã được tạo và đang chờ xử lý.</p>
                </div>

                <div className="mt-5 rounded-xl border border-surface-border bg-surface-bg/50 p-4 sm:p-5">
                    <div className="grid gap-3.5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium text-text-muted">Mã đơn hàng</p>
                            <p className="mt-0.5 font-mono text-sm sm:text-base font-semibold text-text-main">#{renderState.order_id}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-muted">Tổng thanh toán</p>
                            <p className="mt-0.5 text-sm sm:text-base font-bold text-price">{formatMoney(renderState.total_amount)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-muted">Phương thức thanh toán</p>
                            <p className="mt-0.5 text-xs sm:text-sm font-medium text-text-main">{paymentMethodLabel}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-muted">Trạng thái đơn hàng</p>
                            <p className="mt-0.5 text-xs sm:text-sm font-medium text-text-main">{ORDER_STATUS_LABELS[renderState.status] ?? renderState.status}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 space-y-2">
                    {canPayNow ? (
                        <button
                            type="button"
                            onClick={handlePayNow}
                            disabled={isPaying}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-sm font-semibold text-primary-contrast shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isPaying ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Đang chuyển tới cổng thanh toán...</span>
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4" />
                                    <span>Thanh toán ngay</span>
                                </>
                            )}
                        </button>
                    ) : null}

                    <Link
                        href="/user/orders"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-hover px-4 py-2.5 text-sm font-medium text-text-main transition-colors"
                    >
                        <ClipboardList className="h-4 w-4" />
                        <span>Xem lịch sử đơn hàng</span>
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-hover px-4 py-2.5 text-sm font-medium text-text-main transition-colors"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Tiếp tục mua sắm</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
