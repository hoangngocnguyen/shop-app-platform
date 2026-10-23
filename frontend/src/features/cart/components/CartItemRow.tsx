import React from "react";
import { Minus, Plus, Edit3, Trash2, ShoppingBag } from "lucide-react";
import { CartItemResponse } from "../types";
import { formatPrice } from "@/lib/formatPrice";

interface CartItemRowProps {
    item: CartItemResponse;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
    onUpdateQuantity: (id: number, quantity: number) => Promise<void> | void;
    onOpenEditModal: (item: CartItemResponse) => void;
    onDelete: (id: number) => void;
}

export default function CartItemRow({
    item,
    isSelected,
    onToggleSelect,
    onUpdateQuantity,
    onOpenEditModal,
    onDelete,
}: CartItemRowProps) {
    const price = Number(item.price);
    const unitPrice = Number(item.unit_price);
    const discountPercent =
        item.discount_percent && item.discount_percent > 0
            ? Math.round(item.discount_percent)
            : Number.isFinite(price) &&
                Number.isFinite(unitPrice) &&
                price > unitPrice &&
                price > 0
                ? Math.round(((price - unitPrice) / price) * 100)
                : null;

    return (
        <div className="py-5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Checkbox item */}
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.cart_item_id)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0"
                />

                {/* Ảnh sản phẩm kèm nhãn phần trăm giảm giá ở góc trên bên trái */}
                <div className="relative w-20 h-20 bg-surface-bg rounded-xl overflow-hidden border border-surface-border shrink-0 flex items-center justify-center">
                    {discountPercent ? (
                        <span className="absolute top-1 left-1 z-10 px-1.5 py-0.5 text-[10px] font-bold text-white bg-status-error rounded-md shadow-xs leading-none select-none">
                            -{discountPercent}%
                        </span>
                    ) : null}
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

                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs text-text-muted">Đơn giá:</span>
                        <span className="text-sm font-semibold text-text-sub">
                            {formatPrice(item.unit_price)}
                        </span>
                        {Number.isFinite(price) &&
                            Number.isFinite(unitPrice) &&
                            price > unitPrice && (
                                <span className="text-xs text-text-muted line-through">
                                    {formatPrice(item.price)}
                                </span>
                            )}
                        {discountPercent ? (
                            <span className="text-[11px] font-semibold text-status-error bg-status-error-bg px-1.5 py-0.5 rounded-md">
                                -{discountPercent}%
                            </span>
                        ) : null}
                    </div>

                    {/* Nút tăng/giảm nhanh */}
                    <div className="pt-1 flex items-center gap-2">
                        <div className="inline-flex items-center border border-surface-border rounded-xl bg-surface-bg overflow-hidden p-0.5">
                            <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity - 1)}
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
                                onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock_quantity}
                                className="p-1.5 hover:bg-surface-hover text-text-sub rounded-lg text-xs disabled:opacity-30 cursor-pointer transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Nút mở Modal chỉnh sửa */}
                        <button
                            type="button"
                            onClick={() => onOpenEditModal(item)}
                            className="p-1.5 text-text-muted hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-primary-light"
                            title="Chỉnh sửa số lượng"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm font-semibold text-status-error">
                        Thành tiền: {formatPrice(item.subtotal)}
                    </p>
                </div>
            </div>

            {/* Nút xóa item */}
            <button
                type="button"
                onClick={() => onDelete(item.cart_item_id)}
                className="text-text-muted hover:text-status-error p-2 rounded-xl hover:bg-status-error-bg transition-colors cursor-pointer shrink-0"
                title="Xóa sản phẩm"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );
}
