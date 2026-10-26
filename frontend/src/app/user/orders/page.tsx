"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2, PackageSearch, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/common/stores/useToastStore";
import { orderApi } from "@/features/orders/api";
import { OrderHistoryCard } from "@/features/orders/components/OrderHistoryCard";
import { OrderDetailModal } from "@/features/orders/components/OrderDetailModal";
import { CancelOrderModal } from "@/features/orders/components/CancelOrderModal";
import { OrderHistoryTabs } from "@/features/orders/components/OrderHistoryTabs";
import { LoadMoreButton } from "@/features/orders/components/LoadMoreButton";
import { useOrderHistory } from "@/features/orders/hooks/useOrderHistory";
import type { CustomerCancelReason, OrderDetailResponse, OrderStatus } from "@/features/orders/types";
import { ROUTES } from "@/constants/routes";
import { parseErrorMessage } from "@/lib/axios/parseError";

export default function UserOrdersPage() {
    const router = useRouter();
    const { activeStatus, setActiveStatus, orders, totalItems, isLoading, isLoadingMore, hasMore, error, loadMore } = useOrderHistory();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetailResponse | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isCompleting, setIsCompleting] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState<string | null>(null);

    // --- Cancel modal state ---
    const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    useEffect(() => {
        if (!selectedOrderId) {
            return;
        }

        let isMounted = true;
        const fetchDetail = async () => {
            setIsDetailLoading(true);
            try {
                const detail = await orderApi.getOrderDetail(selectedOrderId);
                if (isMounted) {
                    setSelectedOrder(detail);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) {
                    setSelectedOrder(null);
                }
            } finally {
                if (isMounted) {
                    setIsDetailLoading(false);
                }
            }
        };

        fetchDetail();

        return () => {
            isMounted = false;
        };
    }, [selectedOrderId]);

    const handleToggleOrder = useCallback((orderId: string) => {
        setSelectedOrderId((prev) => {
            const nextValue = prev === orderId ? null : orderId;
            if (!nextValue) {
                setSelectedOrder(null);
            }
            return nextValue;
        });
    }, []);

    const handleCompleteOrder = useCallback(async (orderId: string) => {
        setIsCompleting(orderId);
        try {
            const result = await orderApi.completeOrder(orderId);
            toast.success(result.message || "Xác nhận nhận hàng thành công");
            setSelectedOrderId((prev) => (prev === orderId ? orderId : prev));
            router.refresh();
        } catch (err) {
            toast.error(parseErrorMessage(err, "Không thể xác nhận đã nhận hàng."));
        } finally {
            setIsCompleting(null);
        }
    }, [router]);

    // Mở modal chọn lý do hủy
    const handleCancelOrder = useCallback((orderId: string) => {
        setCancelOrderId(orderId);
        setIsCancelModalOpen(true);
    }, []);

    // Gọi API hủy sau khi user chọn lý do
    const handleConfirmCancel = useCallback(
        async (orderId: string, reasonCode: CustomerCancelReason, customReason?: string) => {
            setIsCancelling(orderId);
            try {
                await orderApi.cancelOrder(orderId, {
                    reason_code: reasonCode,
                    custom_reason: customReason ?? null,
                });
                toast.success("Đã hủy đơn hàng thành công.");
                setIsCancelModalOpen(false);
                setCancelOrderId(null);
                setSelectedOrderId((prev) => (prev === orderId ? null : prev));
                router.refresh();
            } catch (err) {
                toast.error(parseErrorMessage(err, "Không thể hủy đơn hàng."));
            } finally {
                setIsCancelling(null);
            }
        },
        [router]
    );

    const handleCloseCancelModal = useCallback(() => {
        if (isCancelling) return;
        setIsCancelModalOpen(false);
        setCancelOrderId(null);
    }, [isCancelling]);

    const statusOrder: OrderStatus[] = [
        "PENDING",
        "PROCESSING",
        "SHIPPING",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "RETURNED",
    ];

    const tabCounts: Partial<Record<OrderStatus | "ALL", number>> = {
        ALL: totalItems,
        ...Object.fromEntries(statusOrder.map((status) => [status, 0])),
    };

    return (
        <div className="min-h-screen bg-surface-bg px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-4 sm:space-y-5">
                {/* Header Banner */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center gap-3">
                        <Link
                            href={ROUTES.HOME}
                            className="rounded-lg border border-surface-border bg-surface-bg p-2 text-text-sub transition-colors hover:bg-surface-hover hover:text-text-main"
                            title="Về trang chủ"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">Lịch sử đơn hàng</h1>
                            <p className="mt-0.5 text-xs sm:text-sm text-text-sub">Theo dõi đơn hàng, trạng thái giao nhận và quản lý thao tác</p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 rounded-lg border border-surface-border bg-surface-bg px-2.5 py-1.5 text-xs font-medium text-text-sub sm:flex">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        <span>{totalItems} đơn hàng</span>
                    </div>
                </div>

                {/* Status Tabs */}
                <OrderHistoryTabs
                    activeStatus={activeStatus}
                    onChange={(status) => setActiveStatus(status)}
                    counts={tabCounts}
                />

                {/* Error Banner */}
                {error && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-status-error/25 bg-status-error-bg p-3.5 text-xs sm:text-sm text-status-error">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* List state */}
                {isLoading && orders.length === 0 ? (
                    <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-surface-border bg-surface-card p-8">
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-text-sub">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Đang tải lịch sử đơn hàng...</span>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-card p-8 text-center">
                        <PackageSearch className="mb-2.5 h-9 w-9 text-text-muted" />
                        <h2 className="text-base font-semibold text-text-main">Chưa có đơn hàng nào</h2>
                        <p className="mt-1 max-w-sm text-xs sm:text-sm text-text-sub">
                            Các đơn hàng của bạn sẽ xuất hiện ở đây để bạn theo dõi và quản lý.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {orders.map((order) => (
                            <OrderHistoryCard
                                key={order.order_id}
                                order={order}
                                expanded={selectedOrderId === order.order_id}
                                onToggle={handleToggleOrder}
                                onComplete={handleCompleteOrder}
                                onCancel={handleCancelOrder}
                                isCompleting={isCompleting === order.order_id}
                                isCancelling={isCancelling === order.order_id}
                            />
                        ))}

                        <LoadMoreButton hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={loadMore} />
                    </div>
                )}
            </div>

            <OrderDetailModal
                isOpen={Boolean(selectedOrderId)}
                onClose={() => setSelectedOrderId(null)}
                order={selectedOrder}
                loading={isDetailLoading}
            />

            {/* Modal chọn lý do hủy đơn */}
            <CancelOrderModal
                isOpen={isCancelModalOpen}
                orderId={cancelOrderId}
                onClose={handleCloseCancelModal}
                onConfirm={handleConfirmCancel}
                isSubmitting={isCancelling === cancelOrderId}
            />
        </div>
    );
}
