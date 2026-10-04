"use client";

import React, { useEffect } from "react";
// 1. Import thêm useWatch và Control
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import { ShippingAddressCreate, ShippingAddressResponse, ShippingAddressUpdate } from "../types";
import { useLocationStore } from "@/features/location/stores";

// Schema & Types giữ nguyên...
const addressSchema = z.object({
    recipient_name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    phone: z
        .string()
        .min(10, "Số điện thoại không hợp lệ")
        .max(11, "Số điện thoại không hợp lệ")
        .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không đúng định dạng"),
    province_code: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
    ward_code: z.string().min(1, "Vui lòng chọn Phường/Xã"),
    address_line: z.string().min(5, "Địa chỉ chi tiết phải từ 5 ký tự trở lên"),
    is_default: z.boolean().default(false),
});

type AddressFormInput = z.input<typeof addressSchema>;
type AddressFormOutput = z.output<typeof addressSchema>;

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingAddress: ShippingAddressResponse | null;
    onSubmit: (data: ShippingAddressCreate | ShippingAddressUpdate) => Promise<void>;
    isSubmitting: boolean;
    isFirstAddress?: boolean;
}

export default function AddressFormModal({
    isOpen,
    onClose,
    editingAddress,
    onSubmit,
    isSubmitting,
    isFirstAddress = false,
}: AddressFormModalProps) {
    const {
        provinces,
        wards,
        isLoadingProvinces,
        isLoadingWards,
        fetchProvinces,
        fetchWardsByProvince,
        clearWards,
    } = useLocationStore();

    const {
        register,
        handleSubmit,
        reset,
        control, // 2. Lấy control từ useForm
        setValue,
        formState: { errors },
    } = useForm<AddressFormInput, unknown, AddressFormOutput>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            recipient_name: "",
            phone: "",
            province_code: "",
            ward_code: "",
            address_line: "",
            is_default: false,
        },
    });

    // 3. Sử dụng useWatch thay vì watch() 
    const selectedProvinceCode = useWatch({
        control,
        name: "province_code",
    });

    // Fetch Tỉnh/Thành phố khi mở modal
    useEffect(() => {
        if (isOpen) {
            fetchProvinces();
        }
    }, [isOpen, fetchProvinces]);

    // Khi chọn/thay đổi Tỉnh/Thành phố -> fetch danh sách Phường/Xã tương ứng
    useEffect(() => {
        if (selectedProvinceCode) {
            fetchWardsByProvince(selectedProvinceCode);
        } else {
            clearWards();
        }
    }, [selectedProvinceCode, fetchWardsByProvince, clearWards]);

    // Reset form dữ liệu mỗi khi mở modal hoặc thay đổi địa chỉ đang sửa
    useEffect(() => {
        if (isOpen) {
            if (editingAddress) {
                reset({
                    recipient_name: editingAddress.recipient_name,
                    phone: editingAddress.phone,
                    province_code: editingAddress.province_code,
                    ward_code: editingAddress.ward_code,
                    address_line: editingAddress.address_line,
                    is_default: editingAddress.is_default,
                });
            } else {
                reset({
                    recipient_name: "",
                    phone: "",
                    province_code: "",
                    ward_code: "",
                    address_line: "",
                    is_default: isFirstAddress,
                });
            }
        }
    }, [isOpen, editingAddress, isFirstAddress, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-surface-card rounded-2xl border border-surface-border shadow-brand-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Modal */}
                <div className="flex items-center justify-between p-4 border-b border-surface-border">
                    <h3 className="text-base font-bold text-text-main">
                        {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ giao hàng"}
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
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-4">
                    {/* Họ tên & Số điện thoại */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">
                                Họ và tên người nhận <span className="text-status-error">*</span>
                            </label>
                            <input
                                {...register("recipient_name")}
                                type="text"
                                placeholder="Nguyễn Văn A"
                                className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-surface-bg text-text-main focus:outline-none focus:border-ring-brand focus:ring-1 focus:ring-ring-brand transition-all"
                            />
                            {errors.recipient_name && (
                                <p className="text-xs text-status-error mt-1">
                                    {errors.recipient_name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">
                                Số điện thoại <span className="text-status-error">*</span>
                            </label>
                            <input
                                {...register("phone")}
                                type="text"
                                placeholder="0912345678"
                                className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-surface-bg text-text-main focus:outline-none focus:border-ring-brand focus:ring-1 focus:ring-ring-brand transition-all"
                            />
                            {errors.phone && (
                                <p className="text-xs text-status-error mt-1">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tỉnh/Thành phố & Phường/Xã Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Dropdown Tỉnh / Thành */}
                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">
                                Tỉnh / Thành phố <span className="text-status-error">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    {...register("province_code", {
                                        onChange: () => {
                                            setValue("ward_code", "");
                                        },
                                    })}
                                    disabled={isLoadingProvinces}
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-surface-bg text-text-main focus:outline-none focus:border-ring-brand focus:ring-1 focus:ring-ring-brand transition-all disabled:opacity-50 appearance-none cursor-pointer"
                                >
                                    <option value="">
                                        {isLoadingProvinces ? "Đang tải Tỉnh/Thành..." : "-- Chọn Tỉnh/Thành --"}
                                    </option>
                                    {provinces.map((province) => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingProvinces && (
                                    <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-2.5 text-text-muted" />
                                )}
                            </div>
                            {errors.province_code && (
                                <p className="text-xs text-status-error mt-1">
                                    {errors.province_code.message}
                                </p>
                            )}
                        </div>

                        {/* Dropdown Phường / Xã */}
                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">
                                Phường / Xã <span className="text-status-error">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    {...register("ward_code")}
                                    disabled={!selectedProvinceCode || isLoadingWards}
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-surface-bg text-text-main focus:outline-none focus:border-ring-brand focus:ring-1 focus:ring-ring-brand transition-all disabled:opacity-50 appearance-none cursor-pointer"
                                >
                                    <option value="">
                                        {!selectedProvinceCode
                                            ? "-- Chọn Tỉnh/Thành trước --"
                                            : isLoadingWards
                                                ? "Đang tải Phường/Xã..."
                                                : "-- Chọn Phường/Xã --"}
                                    </option>
                                    {wards.map((ward) => (
                                        <option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingWards && (
                                    <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-2.5 text-text-muted" />
                                )}
                            </div>
                            {errors.ward_code && (
                                <p className="text-xs text-status-error mt-1">
                                    {errors.ward_code.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Địa chỉ chi tiết */}
                    <div>
                        <label className="block text-xs font-medium text-text-sub mb-1">
                            Địa chỉ chi tiết <span className="text-status-error">*</span>
                        </label>
                        <textarea
                            {...register("address_line")}
                            rows={3}
                            placeholder="Số nhà, tên đường, tòa nhà..."
                            className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-surface-bg text-text-main focus:outline-none focus:border-ring-brand focus:ring-1 focus:ring-ring-brand transition-all resize-none"
                        />
                        {errors.address_line && (
                            <p className="text-xs text-status-error mt-1">
                                {errors.address_line.message}
                            </p>
                        )}
                    </div>

                    {/* Checkbox Đặt làm mặc định */}
                    <div className="flex items-center gap-2 pt-1">
                        <input
                            {...register("is_default")}
                            type="checkbox"
                            id="is_default"
                            className="w-4 h-4 rounded text-primary border-surface-border focus:ring-ring-brand accent-primary cursor-pointer"
                        />
                        <label
                            htmlFor="is_default"
                            className="text-sm font-medium text-text-main cursor-pointer select-none"
                        >
                            Đặt làm địa chỉ giao hàng mặc định
                        </label>
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
                            {editingAddress ? "Cập nhật" : "Tạo địa chỉ"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}