"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { orderApi } from "@/features/orders/api";
import type { OrderListResponse, OrderStatus, OrderSummaryResponse } from "@/features/orders/types";

const DEFAULT_LIMIT = 5;

type ActiveOrderStatus = OrderStatus | "ALL";

export function useOrderHistory() {
    const [activeStatus, setActiveStatus] = useState<ActiveOrderStatus>("ALL");
    const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(
        async (nextPage = 1, shouldAppend = false) => {
            try {
                if (nextPage === 1) {
                    setIsLoading(true);
                } else {
                    setIsLoadingMore(true);
                }
                setError(null);

                const response: OrderListResponse = await orderApi.getOrders({
                    page: nextPage,
                    limit: DEFAULT_LIMIT,
                    orderStatus: activeStatus === "ALL" ? undefined : activeStatus,
                });

                const nextOrders = response.items ?? [];
                setTotalItems(response.total_items ?? 0);
                setTotalPages(response.total_pages ?? 0);
                setOrders((prev) => (shouldAppend ? [...prev, ...nextOrders] : nextOrders));
                setPage(nextPage);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Không thể tải lịch sử đơn hàng.";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [activeStatus],
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchOrders(1, false);
    }, [activeStatus, fetchOrders]);

    const hasMore = useMemo(() => page < totalPages, [page, totalPages]);

    const loadMore = useCallback(async () => {
        const nextPage = page + 1;
        if (!hasMore) return;
        await fetchOrders(nextPage, true);
    }, [fetchOrders, hasMore, page]);

    const refresh = useCallback(() => {
        fetchOrders(1, false);
    }, [fetchOrders]);

    return {
        activeStatus,
        setActiveStatus,
        orders,
        page,
        totalItems,
        totalPages,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        loadMore,
        refresh,
    };
}
