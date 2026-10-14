"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    ShoppingBag,
    Home,
    Trash2,
    Plus,
    Minus,
    Edit3,
    Loader2,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useCartStore } from "@/features/cart/stores";
import { CartItemResponse } from "@/features/cart/types";
import CartFormModal from "@/features/cart/components/CartFormModal";
import { confirm } from "@/common/stores/useConfirmStore";
import { toast } from "@/common/stores/useToastStore";
import { parseErrorMessage } from "@/lib/axios/parseError";

export default function CartPage() {
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
            .reduce((acc, cur) => acc + cur.subtotal, 0);
    }, [cart, selectedItemIds]);

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
                <div className="flex items-center justify-between bg-surface-card p-4 sm:p-6 rounded-2xl border border-surface-border shadow-brand-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-text-main">Giỏ hàng</h1>
                            <p className="text-xs text-text-muted">Quản lý các sản phẩm trong giỏ hàng của bạn</p>
                        </div>
                    </div>
                    <Link
                        href={ROUTES.HOME}
                        className="w-10 h-10 rounded-xl border border-surface-border flex items-center justify-center text-text-sub hover:bg-surface-hover hover:text-text-main transition-colors"
                        title="Trang chủ"
                    >
                        <Home className="w-5 h-5" />
                    </Link>
                </div>

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
                    <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-4">
                        <label className="flex items-center gap-3 text-sm font-medium text-text-sub cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                            <span>Chọn tất cả sản phẩm</span>
                        </label>

                        {selectedItemIds.length > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-1.5 text-xs text-status-error hover:underline cursor-pointer font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Xóa các mục đã chọn ({selectedItemIds.length})</span>
                            </button>
                        )}
                    </div>

                    {/* Danh sách item trong giỏ */}
                    {!cart || cart.items.length === 0 ? (
                        <div className="text-center py-16 text-text-muted text-sm space-y-3">
                            <ShoppingBag className="w-12 h-12 mx-auto opacity-30 text-text-sub" />
                            <p className="text-text-main font-medium">Giỏ hàng của bạn đang trống</p>
                            <Link
                                href={ROUTES.HOME}
                                className="inline-block px-4 py-2 bg-primary text-primary-contrast rounded-xl text-xs font-semibold shadow-brand-sm hover:bg-primary-hover transition-colors"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-surface-border">
                            {cart.items.map((item) => {
                                const isSelected = selectedItemIds.includes(item.cart_item_id);
                                return (
                                    <div
                                        key={item.cart_item_id}
                                        className="py-5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* Checkbox item */}
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelectItem(item.cart_item_id)}
                                                className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0"
                                            />

                                            {/* Ảnh sản phẩm */}
                                            <div className="w-20 h-20 bg-surface-bg rounded-xl overflow-hidden border border-surface-border shrink-0 flex items-center justify-center">
                                                {item.product_image ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img
                                                        src={item.product_image}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ShoppingBag className="w-8 h-8 text-text-muted opacity-40" />
                                                )}
                                            </div>

                                            {/* Thông tin sản phẩm & Tăng giảm số lượng */}
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm sm:text-base text-text-main line-clamp-1">
                                                    {item.product_name}
                                                </h3>

                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-base font-bold text-status-error">
                                                        {item.unit_price.toLocaleString("vi-VN")}đ
                                                    </span>
                                                </div>

                                                {/* Nút tăng/giảm nhanh */}
                                                <div className="pt-1 flex items-center gap-2">
                                                    <div className="inline-flex items-center border border-surface-border rounded-xl bg-surface-bg overflow-hidden p-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                await updateCartItem(item.cart_item_id, {
                                                                    quantity: item.quantity - 1,
                                                                });
                                                            }}
                                                            disabled={item.quantity <= 1}
                                                            className="p-1.5 hover:bg-surface-hover text-text-sub rounded-lg text-xs disabled:opacity-30 cursor-pointer transition-colors"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="px-3 text-xs font-semibold text-text-main">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                await updateCartItem(item.cart_item_id, {
                                                                    quantity: item.quantity + 1,
                                                                });
                                                            }}
                                                            disabled={item.quantity >= item.stock_quantity}
                                                            className="p-1.5 hover:bg-surface-hover text-text-sub rounded-lg text-xs disabled:opacity-30 cursor-pointer transition-colors"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    {/* Nút mở Modal chỉnh sửa */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingItem(item);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-text-muted hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-primary-light"
                                                        title="Chỉnh sửa số lượng"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nút xóa item */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteSingleItem(item.cart_item_id)}
                                            className="text-text-muted hover:text-status-error p-2 rounded-xl hover:bg-status-error-bg transition-colors cursor-pointer shrink-0"
                                            title="Xóa sản phẩm"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Bar Thanh toán cố định */}
            <div className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-surface-border shadow-lg py-4 px-4 sm:px-6 z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-text-sub">Tổng cộng:</span>
                            <span className="text-xl font-bold text-status-error">
                                {selectedTotalPrice.toLocaleString("vi-VN")} đ
                            </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">
                            Phí vận chuyển và các chi phí khác sẽ được tính tại bước thanh toán.
                        </p>
                    </div>

                    <button
                        disabled={selectedItemIds.length === 0}
                        className="px-8 py-3 bg-status-error hover:bg-status-error/90 text-white font-bold text-sm rounded-xl transition-all shadow-brand-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                    >
                        <span>Mua ngay</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

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