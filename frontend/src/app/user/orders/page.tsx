"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2, PackageSearch, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { confirm } from "@/common/stores/useConfirmStore";
import { toast } from "@/common/stores/useToastStore";
import { orderApi } from "@/features/orders/api";
import { OrderHistoryCard } from "@/features/orders/components/OrderHistoryCard";
import { OrderHistoryExpandPanel } from "@/features/orders/components/OrderHistoryExpandPanel";
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
        const confirmed = await confirm({
            title: "Xác nhận đã nhận hàng",
            message: "Bạn xác nhận đã nhận đủ hàng và muốn hoàn tất đơn này?",
            confirmText: "Xác nhận",
            cancelText: "Hủy",
            variant: "info",
        });

        if (!confirmed) return;

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

    const handleCancelOrder = useCallback(async (orderId: string) => {
        const confirmed = await confirm({
            title: "Hủy đơn hàng",
            message: "Bạn muốn hủy đơn này? Vui lòng chọn lý do hủy để tiếp tục.",
            confirmText: "Tiếp tục",
            cancelText: "Hủy",
            variant: "danger",
        });

        if (!confirmed) return;

        setIsCancelling(orderId);
        try {
            const cancellationReasons = await orderApi.getCancellationReasons();
            const reason = cancellationReasons.items?.[0];
            if (!reason) {
                toast.error("Không có lý do hủy phù hợp.");
                return;
            }

            await orderApi.cancelOrder(orderId, {
                reason_code: reason.value as CustomerCancelReason,
            });
            toast.success("Đã hủy đơn hàng thành công.");
            setSelectedOrderId((prev) => (prev === orderId ? null : prev));
            router.refresh();
        } catch (err) {
            toast.error(parseErrorMessage(err, "Không thể hủy đơn hàng."));
        } finally {
            setIsCancelling(null);
        }
    }, [router]);

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
        <div className="min-h-screen bg-surface-bg px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between gap-3 rounded-3xl border border-surface-border bg-surface-card p-5 shadow-brand-sm">
                    <div className="flex items-center gap-3">
                        <Link href={ROUTES.HOME} className="rounded-xl border border-surface-border bg-surface-bg p-2 text-text-sub transition hover:text-primary">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-text-main">Lịch sử đơn hàng</h1>
                            <p className="text-sm text-text-sub">Theo dõi đơn hàng, trạng thái giao nhận và các thao tác cần thiết</p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 rounded-xl border border-surface-border bg-surface-bg px-3 py-2 text-sm text-text-sub sm:flex">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        {totalItems} đơn hàng
                    </div>
                </div>

                <OrderHistoryTabs
                    activeStatus={activeStatus}
                    onChange={(status) => setActiveStatus(status)}
                    counts={tabCounts}
                />

                {error && (
                    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}

                {isLoading && orders.length === 0 ? (
                    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-surface-border bg-surface-card">
                        <div className="flex items-center gap-3 text-text-sub">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span>Đang tải lịch sử đơn hàng...</span>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-card px-6 text-center">
                        <PackageSearch className="mb-3 h-10 w-10 text-text-muted" />
                        <h2 className="text-lg font-bold text-text-main">Chưa có đơn hàng nào</h2>
                        <p className="mt-2 max-w-md text-sm text-text-sub">Các đơn hàng bạn đặt sẽ xuất hiện ở đây để bạn theo dõi và quản lý thuận tiện.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.order_id} className="space-y-0 overflow-hidden rounded-2xl">
                                <OrderHistoryCard
                                    order={order}
                                    expanded={selectedOrderId === order.order_id}
                                    onToggle={handleToggleOrder}
                                    onComplete={handleCompleteOrder}
                                    onCancel={handleCancelOrder}
                                    isCompleting={isCompleting === order.order_id}
                                    isCancelling={isCancelling === order.order_id}
                                />
                                {selectedOrderId === order.order_id && (
                                    <OrderHistoryExpandPanel order={selectedOrder} loading={isDetailLoading} />
                                )}
                            </div>
                        ))}

                        <LoadMoreButton hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={loadMore} />
                    </div>
                )}
            </div>
        </div>
    );
}
