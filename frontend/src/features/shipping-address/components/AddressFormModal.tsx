"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    X,
    Loader2,
    User,
    Phone,
    MapPin,
    Building2,
    Home,
    Check,
    AlertCircle,
} from "lucide-react";
import { ShippingAddressCreate, ShippingAddressResponse, ShippingAddressUpdate } from "../types";
import { ProvinceResponse, WardResponse } from "@/features/location/types";
import { useLocationStore } from "@/features/location/stores";
import {
    addressSchema,
    AddressFormInput,
    AddressFormOutput,
} from "../schemas/address-schema";

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
        control,
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

    const selectedProvinceCode = useWatch({
        control,
        name: "province_code",
    });

    useEffect(() => {
        if (isOpen) {
            fetchProvinces();
        }
    }, [isOpen, fetchProvinces]);

    useEffect(() => {
        if (selectedProvinceCode) {
            fetchWardsByProvince(selectedProvinceCode);
        } else {
            clearWards();
        }
    }, [selectedProvinceCode, fetchWardsByProvince, clearWards]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="relative bg-surface-card w-full max-w-lg rounded-xl sm:rounded-2xl border border-surface-border shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modal */}
                <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 border-b border-surface-border bg-surface-card">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-semibold text-text-main">
                                {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ giao hàng"}
                            </h3>
                            <p className="text-xs text-text-muted">
                                {editingAddress ? "Chỉnh sửa thông tin địa chỉ nhận hàng" : "Thêm vị trí mới để nhận hàng thuận tiện"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main p-1.5 rounded-lg border border-surface-border hover:bg-surface-hover transition-colors"
                        title="Đóng"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-3.5">
                    {/* Họ tên & Số điện thoại */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">
                                Họ và tên người nhận <span className="text-status-error">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    {...register("recipient_name")}
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-surface-card text-text-main text-xs sm:text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 ${
                                        errors.recipient_name
                                            ? "border-status-error focus:ring-status-error/20"
                                            : "border-surface-border"
                                    }`}
                                />
                            </div>
                            {errors.recipient_name && (
                                <p className="mt-1 text-xs text-status-error flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.recipient_name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">
                                Số điện thoại <span className="text-status-error">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <input
                                    {...register("phone")}
                                    type="text"
                                    placeholder="0912345678"
                                    className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-surface-card text-text-main text-xs sm:text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 ${
                                        errors.phone
                                            ? "border-status-error focus:ring-status-error/20"
                                            : "border-surface-border"
                                    }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-xs text-status-error flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
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
                            <div className="relative flex items-center">
                                <div className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <select
                                    {...register("province_code", {
                                        onChange: () => {
                                            setValue("ward_code", "");
                                        },
                                    })}
                                    disabled={isLoadingProvinces}
                                    className={`w-full pl-9 pr-7 py-2 rounded-lg border bg-surface-card text-text-main text-xs sm:text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50 appearance-none cursor-pointer ${
                                        errors.province_code
                                            ? "border-status-error focus:ring-status-error/20"
                                            : "border-surface-border"
                                    }`}
                                >
                                    <option value="">
                                        {isLoadingProvinces ? "Đang tải Tỉnh/Thành..." : "-- Chọn Tỉnh/Thành --"}
                                    </option>
                                    {provinces?.map((province: ProvinceResponse) => {
                                        const code = province.code;
                                        const name = province.name;
                                        return (
                                            <option key={code} value={code}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                                {isLoadingProvinces && (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-3 text-text-muted" />
                                )}
                            </div>
                            {errors.province_code && (
                                <p className="mt-1 text-xs text-status-error flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.province_code.message}
                                </p>
                            )}
                        </div>

                        {/* Dropdown Phường / Xã */}
                        <div>
                            <label className="block text-xs font-medium text-text-sub mb-1">
                                Phường / Xã <span className="text-status-error">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <select
                                    {...register("ward_code")}
                                    disabled={!selectedProvinceCode || isLoadingWards}
                                    className={`w-full pl-9 pr-7 py-2 rounded-lg border bg-surface-card text-text-main text-xs sm:text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50 appearance-none cursor-pointer ${
                                        errors.ward_code
                                            ? "border-status-error focus:ring-status-error/20"
                                            : "border-surface-border"
                                    }`}
                                >
                                    <option value="">
                                        {!selectedProvinceCode
                                            ? "-- Chọn Tỉnh/Thành trước --"
                                            : isLoadingWards
                                                ? "Đang tải Phường/Xã..."
                                                : "-- Chọn Phường/Xã --"}
                                    </option>
                                    {wards?.map((ward: WardResponse) => {
                                        const code = ward.code;
                                        const name = ward.name;
                                        return (
                                            <option key={code} value={code}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                                {isLoadingWards && (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-3 text-text-muted" />
                                )}
                            </div>
                            {errors.ward_code && (
                                <p className="mt-1 text-xs text-status-error flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
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
                        <div className="relative flex items-start">
                            <div className="absolute left-3 top-2.5 text-text-muted pointer-events-none flex items-center justify-center">
                                <Home className="w-4 h-4" />
                            </div>
                            <textarea
                                {...register("address_line")}
                                rows={2}
                                placeholder="Số nhà, tên đường, tòa nhà..."
                                className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-surface-card text-text-main text-xs sm:text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none ${
                                    errors.address_line
                                        ? "border-status-error focus:ring-status-error/20"
                                        : "border-surface-border"
                                }`}
                            />
                        </div>
                        {errors.address_line && (
                            <p className="mt-1 text-xs text-status-error flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.address_line.message}
                            </p>
                        )}
                    </div>

                    {/* Checkbox Đặt làm mặc định */}
                    <div className="flex items-center gap-2 pt-0.5">
                        <input
                            {...register("is_default")}
                            type="checkbox"
                            id="is_default"
                            className="w-4 h-4 rounded text-primary border-surface-border focus:ring-primary/20 accent-primary cursor-pointer"
                        />
                        <label
                            htmlFor="is_default"
                            className="text-xs sm:text-sm font-medium text-text-main cursor-pointer select-none"
                        >
                            Đặt làm địa chỉ giao hàng mặc định
                        </label>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-hover text-text-main text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-contrast text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            <span>{editingAddress ? "Cập nhật" : "Tạo địa chỉ"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
