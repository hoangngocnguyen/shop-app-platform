"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Pencil, Trash2, Home, Check, Loader2, AlertCircle } from "lucide-react";
import { useShippingAddressStore } from "@/features/shipping-address/stores";
import { ShippingAddressCreate, ShippingAddressResponse, ShippingAddressUpdate } from "@/features/shipping-address/types";
import AddressFormModal from "@/features/shipping-address/components/AddressFormModal";
import { toast } from "@/common/stores/useToastStore";
import { confirm } from "@/common/stores/useConfirmStore";
import { parseErrorMessage } from "@/lib/axios/parseError";

export default function ShippingAddressPage() {
    const {
        addresses,
        isLoading,
        error,
        fetchUserAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
    } = useShippingAddressStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<ShippingAddressResponse | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUserAddresses();
    }, [fetchUserAddresses]);

    const handleOpenCreateModal = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (address: ShippingAddressResponse) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAddress(null);
    };

    const handleSubmitForm = async (data: ShippingAddressCreate | ShippingAddressUpdate) => {
        setIsSubmitting(true);
        try {
            if (editingAddress) {
                await updateAddress(editingAddress.id, data as ShippingAddressUpdate);
                toast.success("Cập nhật địa chỉ giao hàng thành công!");
            } else {
                await createAddress(data as ShippingAddressCreate);
                toast.success("Thêm địa chỉ giao hàng thành công!");
            }

            await fetchUserAddresses();
            handleCloseModal();
        } catch (err) {
            console.error("Lỗi khi lưu địa chỉ:", err);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Xử lý xóa địa chỉ sử dụng helper confirm()
    const handleDeleteAddress = async (id: number) => {
        const isConfirmed = await confirm({
            title: "Xóa địa chỉ giao hàng",
            message: "Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.",
            confirmText: "Xóa địa chỉ",
            cancelText: "Hủy",
            variant: "danger",
        });

        if (!isConfirmed) return;

        setDeletingId(id);
        try {
            await deleteAddress(id);
            toast.success("Xóa địa chỉ thành công!");
            await fetchUserAddresses();
        } catch (err: unknown) {
            console.error("Lỗi khi xóa địa chỉ:", err);
            const errorMessage = parseErrorMessage(err, "Không thể xóa địa chỉ này!");
            toast.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between p-3.5 sm:p-5 rounded-2xl bg-surface-card border border-surface-border/80 shadow-brand-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-xl font-bold text-text-main leading-tight">
                            Địa chỉ giao hàng
                        </h1>
                        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                            Quản lý danh sách địa chỉ nhận hàng của bạn
                        </p>
                    </div>
                </div>

                <Link
                    href="/user/profile"
                    className="p-2 sm:p-2.5 rounded-xl border border-surface-border text-text-sub hover:bg-surface-hover transition-colors shrink-0"
                    title="Về trang hồ sơ"
                >
                    <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
            </div>

            {/* DANH SÁCH ĐỊA CHỈ */}
            <div className="p-3.5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border/80 shadow-brand-sm space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 sm:pb-4 border-b border-surface-border/60">
                    <h2 className="text-sm sm:text-base font-semibold text-text-main">
                        Danh sách địa chỉ ({addresses.length})
                    </h2>
                    <button
                        onClick={handleOpenCreateModal}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-contrast text-xs sm:text-sm font-medium transition-all shadow-brand-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm địa chỉ mới
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 sm:p-3.5 rounded-xl bg-status-error-bg text-status-error text-xs sm:text-sm">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {isLoading && addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-text-muted">
                        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-primary mb-2" />
                        <p className="text-xs sm:text-sm">Đang tải danh sách địa chỉ...</p>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-10 sm:py-12 space-y-2.5 sm:space-y-3">
                        <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-text-disabled mx-auto" />
                        <p className="text-text-sub font-medium text-sm sm:text-base">Chưa có địa chỉ giao hàng nào</p>
                        <p className="text-xs text-text-muted max-w-xs mx-auto">
                            Thêm địa chỉ để quá trình đặt hàng nhanh chóng và thuận tiện hơn.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        {addresses.map((item) => (
                            <div
                                key={item.id}
                                className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 ${item.is_default
                                    ? "bg-primary-light/30 border-primary/40 shadow-brand-sm"
                                    : "bg-surface-bg border-surface-border/60 hover:border-surface-border"
                                    }`}
                            >
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-text-main text-sm sm:text-base truncate max-w-[180px] sm:max-w-none">
                                            {item.recipient_name}
                                        </span>
                                        <span className="text-xs text-text-muted hidden sm:inline">|</span>
                                        <span className="text-xs sm:text-sm text-text-sub font-medium">
                                            {item.phone}
                                        </span>
                                        {item.is_default && (
                                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-primary text-primary-contrast shrink-0">
                                                <Check className="w-3 h-3" /> Mặc định
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-text-sub break-words leading-relaxed">
                                        {item.address_line}
                                    </p>
                                    {(item.ward_name || item.province_name) && (
                                        <p className="text-[11px] sm:text-xs text-text-muted">
                                            {[item.ward_name, item.province_name].filter(Boolean).join(", ")}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-1.5 sm:gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-surface-border/40 shrink-0">
                                    <button
                                        onClick={() => handleOpenEditModal(item)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 sm:p-2 rounded-lg text-xs sm:text-sm text-text-sub hover:text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                                        title="Chỉnh sửa"
                                    >
                                        <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="sm:hidden font-medium">Sửa</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAddress(item.id)}
                                        disabled={deletingId === item.id}
                                        className="flex items-center gap-1 px-2.5 py-1.5 sm:p-2 rounded-lg text-xs sm:text-sm text-text-sub hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer disabled:opacity-50"
                                        title="Xóa"
                                    >
                                        {deletingId === item.id ? (
                                            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        )}
                                        <span className="sm:hidden font-medium">Xóa</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AddressFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingAddress={editingAddress}
                onSubmit={handleSubmitForm}
                isSubmitting={isSubmitting}
                isFirstAddress={addresses.length === 0}
            />
        </div>
    );
}