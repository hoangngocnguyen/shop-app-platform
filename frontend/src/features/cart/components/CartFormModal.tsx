"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, Plus, Minus } from "lucide-react";
import { CartItemResponse } from "../types";

// Schema & Types validate số lượng sản phẩm giỏ hàng
const cartItemSchema = z.object({
    quantity: z.coerce
        .number({ message: "Số lượng không hợp lệ" })
        .int("Số lượng phải là số nguyên")
        .min(1, "Số lượng tối thiểu là 1"),
});

type CartItemInput = z.input<typeof cartItemSchema>;
type CartItemOutput = z.output<typeof cartItemSchema>;

interface CartFormModalProps {
    isOpen: boolean;
    item: CartItemResponse | null;
    onClose: () => void;
    onSubmit: (cartItemId: number, quantity: number) => Promise<void>;
    isSubmitting?: boolean;
}

export default function CartFormModal({
    isOpen,
    item,
    onClose,
    onSubmit,
    isSubmitting = false,
}: CartFormModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        setError,
        formState: { errors },
    } = useForm<CartItemInput, unknown, CartItemOutput>({
        resolver: zodResolver(cartItemSchema),
        defaultValues: {
            quantity: 1,
        },
    });

    // Theo dõi giá trị số lượng thay đổi bằng useWatch
    const currentQuantity = useWatch({
        control,
        name: "quantity",
        defaultValue: 1,
    });

    // Reset form dữ liệu mỗi khi mở modal hoặc thay đổi sản phẩm đang sửa
    useEffect(() => {
        if (isOpen && item) {
            reset({
                quantity: item.quantity,
            });
        }
    }, [isOpen, item, reset]);

    if (!isOpen || !item) return null;

    const handleFormSubmit = async (data: CartItemOutput) => {
        // Kiểm tra số lượng tồn kho trực tiếp trước khi gửi
        if (data.quantity > item.stock_quantity) {
            setError("quantity", {
                type: "manual",
                message: `Chỉ còn ${item.stock_quantity} sản phẩm trong kho`,
            });
            return;
        }

        await onSubmit(item.cart_item_id, data.quantity);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-md bg-surface-card rounded-2xl border border-surface-border shadow-brand-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Modal */}
                <div className="flex items-center justify-between p-4 border-b border-surface-border">
                    <h3 className="text-base font-bold text-text-main">
                        Cập nhật số lượng
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 sm:p-5 space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-text-main line-clamp-1 mb-1">
                            {item.product_name}
                        </p>
                        <label className="block text-xs text-text-sub mb-3">
                            Số lượng tồn kho: <span className="font-semibold text-text-main">{item.stock_quantity}</span>
                        </label>

                        {/* Bộ điều khiển tăng/giảm số lượng */}
                        <div className="flex items-center border border-surface-border rounded-xl overflow-hidden bg-surface-bg p-1">
                            <button
                                type="button"
                                onClick={() =>
                                    setValue(
                                        "quantity",
                                        Math.max(1, (Number(currentQuantity) || 1) - 1)
                                    )
                                }
                                disabled={Number(currentQuantity) <= 1}
                                className="p-2 text-text-main hover:bg-surface-hover rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                            >
                                <Minus className="w-4 h-4" />
                            </button>

                            <input
                                {...register("quantity")}
                                type="number"
                                className="w-full text-center bg-transparent focus:outline-none font-semibold text-text-main text-sm"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setValue(
                                        "quantity",
                                        Math.min(
                                            item.stock_quantity,
                                            (Number(currentQuantity) || 1) + 1
                                        )
                                    )
                                }
                                disabled={Number(currentQuantity) >= item.stock_quantity}
                                className="p-2 text-text-main hover:bg-surface-hover rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {errors.quantity && (
                            <p className="text-xs text-status-error mt-1.5">
                                {errors.quantity.message}
                            </p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-text-sub hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-contrast text-sm font-medium transition-all shadow-brand-sm cursor-pointer disabled:opacity-60"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}