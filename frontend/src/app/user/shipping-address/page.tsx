"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Plus, 
  Pencil, 
  Trash2, 
  Home, 
  Check, 
  Loader2, 
  AlertCircle
} from "lucide-react";
import { useShippingAddressStore } from "@/features/shipping-address/stores";
import { ShippingAddressCreate, ShippingAddressResponse, ShippingAddressUpdate } from "@/features/shipping-address/types";
import AddressFormModal from "@/features/shipping-address/components/AddressFormModal";
import { toast } from "@/common/stores/useToastStore";
import { confirm } from "@/common/stores/useConfirmStore";
import { parseErrorMessage } from "@/lib/axios/parseError";

export default function ShippingAddressPage() {
    // GIỮ NGUYÊN 100% STORE HOOKS & STATES
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

    // GIỮ NGUYÊN 100% HÀM XỬ LÝ EVENT
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
        <div className="min-h-screen w-full bg-primary-light py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background hiệu ứng quầng sáng xanh mint mờ */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-primary/15 via-accent/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* HEADER BAR */}
                <div className="group relative flex items-center justify-between bg-surface-card p-6 sm:p-7 rounded-3xl border border-surface-border shadow-brand-md transition-all duration-300 hover:shadow-brand-md hover:border-primary/40">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
                        <div className="absolute -left-6 -top-6 h-28 w-28 animate-pulse rounded-full bg-primary/10 blur-2xl transition-all duration-1000 group-hover:scale-125" />
                    </div>

                    <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                            <MapPin className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
                                Địa chỉ giao hàng
                            </h1>
                            <p className="text-xs text-text-muted mt-0.5">
                                Quản lý danh sách địa chỉ nhận hàng cho các đơn sắm của bạn
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/user/profile"
                        className="relative w-12 h-12 rounded-2xl border border-surface-border bg-surface-bg flex items-center justify-center text-text-sub hover:bg-primary hover:text-primary-contrast hover:border-primary transition-all duration-300 shadow-sm hover:shadow-brand-sm hover:-translate-y-1 active:translate-y-0 group/home"
                        title="Về trang hồ sơ"
                    >
                        <Home className="w-5 h-5 transition-transform duration-200 group-hover/home:scale-110" />
                    </Link>
                </div>

                {/* DANH SÁCH ĐỊA CHỈ */}
                <div className="group relative bg-surface-card rounded-3xl border border-surface-border shadow-brand-md p-6 sm:p-8 space-y-6 transition-all duration-300 hover:shadow-brand-md hover:border-primary/40">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
                        <div className="absolute right-0 top-0 h-40 w-40 animate-pulse rounded-full bg-primary/10 blur-2xl transition-all duration-1000 group-hover:scale-125" />
                    </div>

                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-border">
                        <div>
                            <h2 className="text-lg font-bold text-text-main">
                                Danh sách địa chỉ ({addresses.length})
                            </h2>
                            <p className="text-xs text-text-muted mt-0.5">Thêm hoặc chỉnh sửa thông tin giao nhận hàng</p>
                        </div>
                        <button
                            onClick={handleOpenCreateModal}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-primary-contrast text-sm font-semibold transition-all duration-300 shadow-brand-sm hover:shadow-brand-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        >
                            <Plus className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                            Thêm địa chỉ mới
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-status-error-bg border border-status-error/30 text-status-error text-sm shadow-sm animate-shake">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {isLoading && addresses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                            <p className="text-sm font-medium">Đang tải danh sách địa chỉ...</p>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <MapPin className="w-12 h-12 text-primary/60 mx-auto animate-bounce" />
                            <p className="text-text-sub font-bold text-base">Chưa có địa chỉ giao hàng nào</p>
                            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                                Hãy thêm địa chỉ giao hàng để quá trình mua sắm và thanh toán diễn ra nhanh chóng hơn.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {addresses.map((item) => (
                                <div
                                    key={item.id}
                                    className={`group/item p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row justify-between gap-4 hover:-translate-y-0.5 hover:shadow-brand-sm ${
                                        item.is_default
                                            ? "bg-primary-light/40 border-primary/40 shadow-sm"
                                            : "bg-surface-bg border-surface-border/80 hover:border-primary/40"
                                    }`}
                                >
                                    <div className="space-y-1.5 min-w-0 flex-1">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className="font-extrabold text-text-main text-base truncate max-w-[200px] sm:max-w-none">
                                                {item.recipient_name}
                                            </span>
                                            <span className="text-xs text-text-muted">|</span>
                                            <span className="text-sm text-text-sub font-semibold">
                                                {item.phone}
                                            </span>
                                            {item.is_default && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-contrast shadow-xs shrink-0">
                                                    <Check className="w-3.5 h-3.5" /> Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-text-sub break-words leading-relaxed font-medium">
                                            {item.address_line}
                                        </p>
                                        {(item.ward_name || item.province_name) && (
                                            <p className="text-xs text-text-muted">
                                                {[item.ward_name, item.province_name].filter(Boolean).join(", ")}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-border/40 shrink-0">
                                        <button
                                            onClick={() => handleOpenEditModal(item)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-text-sub hover:text-primary hover:bg-primary-light/50 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                                            title="Chỉnh sửa"
                                        >
                                            <Pencil className="w-4 h-4 text-primary" />
                                            <span>Sửa</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(item.id)}
                                            disabled={deletingId === item.id}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-text-sub hover:text-status-error hover:bg-status-error-bg transition-all duration-200 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5"
                                            title="Xóa"
                                        >
                                            {deletingId === item.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-status-error" />
                                            ) : (
                                                <Trash2 className="w-4 h-4 text-status-error" />
                                            )}
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL FORM PHỤ THUỘC */}
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