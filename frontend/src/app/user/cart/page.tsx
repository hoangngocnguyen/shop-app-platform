"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useCartStore } from "@/features/cart/stores";
import { CartItemResponse } from "@/features/cart/types";
import {
    CartHeader,
    CartToolbar,
    CartEmptyState,
    CartItemRow,
    CartBottomBar,
    CartFormModal,
} from "@/features/cart/components";
import { confirm } from "@/common/stores/useConfirmStore";
import { toast } from "@/common/stores/useToastStore";
import { parseErrorMessage } from "@/lib/axios/parseError";
import { ROUTES } from "@/constants/routes";

export default function CartPage() {
    const router = useRouter();
    const {
        cart,
        isLoading,
        error,
        fetchCart,
        updateCartItem,
        deleteCartItem,
        deleteMultipleCartItems,
    } = useCartStore();

    // State quản lý danh sách id sản phẩm được chọn
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

    // State quản lý Modal chỉnh sửa số lượng chi tiết
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CartItemResponse | null>(null);
    const [isSubmittingModal, setIsSubmittingModal] = useState(false);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Kiểm tra trạng thái "Chọn tất cả"
    const isAllSelected = useMemo(() => {
        return Boolean(
            cart?.items &&
            cart.items.length > 0 &&
            selectedItemIds.length === cart.items.length
        );
    }, [cart, selectedItemIds]);

    const toggleSelectAll = () => {
        if (!cart) return;
        if (isAllSelected) {
            setSelectedItemIds([]);
        } else {
            setSelectedItemIds(cart.items.map((i) => i.cart_item_id));
        }
    };

    const toggleSelectItem = (id: number) => {
        setSelectedItemIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    // Xử lý xóa nhiều sản phẩm đã chọn dùng helper confirm() và toast()
    const handleDeleteSelected = async () => {
        if (selectedItemIds.length === 0) return;

        const isConfirmed = await confirm({
            title: "Xóa sản phẩm đã chọn",
            message: "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn khỏi giỏ hàng không?",
            confirmText: "Xóa tất cả",
            cancelText: "Hủy",
            variant: "danger",
        });

        if (!isConfirmed) return;

        try {
            await deleteMultipleCartItems({ cart_item_ids: selectedItemIds });
            toast.success("Đã xóa các sản phẩm đã chọn khỏi giỏ hàng!");
            setSelectedItemIds([]);
        } catch (err: unknown) {
            console.error("Lỗi khi xóa nhiều sản phẩm:", err);
            const errorMessage = parseErrorMessage(err, "Không thể xóa các sản phẩm này!");
            toast.error(errorMessage);
        }
    };

    // Xử lý xóa đơn lẻ một sản phẩm dùng helper confirm() và toast()
    const handleDeleteSingleItem = async (cartItemId: number) => {
        const isConfirmed = await confirm({
            title: "Xóa sản phẩm",
            message: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
            confirmText: "Xóa",
            cancelText: "Hủy",
            variant: "danger",
        });

        if (!isConfirmed) return;

        try {
            await deleteCartItem(cartItemId);
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
            setSelectedItemIds((prev) => prev.filter((id) => id !== cartItemId));
        } catch (err: unknown) {
            console.error("Lỗi khi xóa sản phẩm:", err);
            const errorMessage = parseErrorMessage(err, "Không thể xóa sản phẩm này!");
            toast.error(errorMessage);
        }
    };

    // Tính tổng tiền các sản phẩm ĐƯỢC CHỌN
    const selectedTotalPrice = useMemo(() => {
        if (!cart?.items) return 0;
        return cart.items
            .filter((item) => selectedItemIds.includes(item.cart_item_id))
            .reduce((total, item) => {
                const subtotal = Number(item.subtotal);
                const unitPrice = Number(item.unit_price);
                const itemTotal = Number.isFinite(subtotal)
                    ? subtotal
                    : Number.isFinite(unitPrice)
                        ? unitPrice * item.quantity
                        : 0;

                return total + itemTotal;
            }, 0);
    }, [cart, selectedItemIds]);

    const handleCheckout = () => {
        if (selectedItemIds.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
            return;
        }

        const params = new URLSearchParams({
            checkout_type: "CART",
            cart_item_ids: selectedItemIds.join(","),
        });

        router.push(`${ROUTES.CHECKOUT}?${params.toString()}`);
    };

    if (isLoading && !cart) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-bg">
                <div className="flex items-center gap-3 text-text-sub">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm font-medium">Đang tải giỏ hàng...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-bg py-8 px-4 sm:px-6 lg:px-8 pb-36">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Bar */}
                <CartHeader />

                {/* Thông báo lỗi nếu có */}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-status-error-bg border border-status-error/20 text-status-error text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Main Content Card */}
                <div className="bg-surface-card rounded-2xl border border-surface-border shadow-brand-sm p-6">
                    {/* Thanh công cụ: Chọn tất cả & Xóa mục chọn */}
                    <CartToolbar
                        isAllSelected={isAllSelected}
                        onToggleSelectAll={toggleSelectAll}
                        selectedCount={selectedItemIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />

                    {/* Danh sách item trong giỏ hoặc giao diện giỏ hàng trống */}
                    {!cart || cart.items.length === 0 ? (
                        <CartEmptyState />
                    ) : (
                        <div className="divide-y divide-surface-border">
                            {cart.items.map((item) => (
                                <CartItemRow
                                    key={item.cart_item_id}
                                    item={item}
                                    isSelected={selectedItemIds.includes(item.cart_item_id)}
                                    onToggleSelect={toggleSelectItem}
                                    onUpdateQuantity={async (cartItemId, quantity) => {
                                        await updateCartItem(cartItemId, { quantity });
                                    }}
                                    onOpenEditModal={(itemToEdit) => {
                                        setEditingItem(itemToEdit);
                                        setIsModalOpen(true);
                                    }}
                                    onDelete={handleDeleteSingleItem}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Bar Thanh toán cố định */}
            <CartBottomBar
                totalPrice={selectedTotalPrice}
                selectedCount={selectedItemIds.length}
                onCheckout={handleCheckout}
            />

            {/* Modal cập nhật số lượng */}
            <CartFormModal
                isOpen={isModalOpen}
                item={editingItem}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                onSubmit={async (cartItemId, quantity) => {
                    try {
                        setIsSubmittingModal(true);
                        await updateCartItem(cartItemId, { quantity });
                        toast.success("Cập nhật số lượng thành công!");
                    } catch (err: unknown) {
                        console.error("Lỗi cập nhật số lượng:", err);
                        const errorMessage = parseErrorMessage(err, "Không thể cập nhật số lượng!");
                        toast.error(errorMessage);
                    } finally {
                        setIsSubmittingModal(false);
                    }
                }}
                isSubmitting={isSubmittingModal}
            />
        </div>
    );
}