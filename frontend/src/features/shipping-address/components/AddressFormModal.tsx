"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  X, 
  Loader2, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  Home, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { ShippingAddressCreate, ShippingAddressResponse, ShippingAddressUpdate } from "../types";
import { useLocationStore } from "@/features/location/stores";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="group relative bg-surface-card w-full max-w-lg rounded-3xl border border-surface-border shadow-brand-md overflow-hidden animate-in zoom-in-95 duration-300 transition-all hover:border-primary/40"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl -z-10" aria-hidden="true">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary-light/60 rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* Header Modal */}
                <div className="relative flex items-center justify-between px-6 py-5 border-b border-surface-border bg-surface-bg/80 backdrop-blur-md">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-text-main tracking-tight">
                                {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ giao hàng"}
                            </h3>
                            <p className="text-[11px] text-text-muted">
                                {editingAddress ? "Chỉnh sửa thông tin địa chỉ nhận hàng" : "Thêm vị trí mới để nhận hàng thuận tiện"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main p-2 rounded-2xl hover:bg-surface-hover transition-all duration-200"
                        title="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit(onSubmit)} className="relative p-6 sm:p-7 space-y-4.5">
                    
                    {/* Họ tên & Số điện thoại */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text-sub mb-1.5 uppercase tracking-wider">
                                Họ và tên người nhận <span className="text-status-error">*</span>
                            </label>
                            <div className="relative flex items-center group/field">
                                <div className="absolute left-4 text-primary/80 pointer-events-none flex items-center justify-center transition-all duration-300 group-hover/field:-translate-y-0.5 group-hover/field:text-primary group-focus-within/field:text-primary z-10">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    {...register("recipient_name")}
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 ${
                                        errors.recipient_name
                                            ? "border-status-error focus:ring-status-error/20"
                                            : "border-surface-border"
                                    }`}
                                />
                            </div>
                            {errors.recipient_name && (
                                <p className="mt-1.5 text-xs text-status-error flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.recipient_name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-sub mb-1.5 uppercase tracking-wider">
                                Số điện thoại <span className="text-status-error">*</span>
                            </label>
                            <div className="relative flex items-center group/field">
                                <div className="absolute left-4 text-primary/80 pointer-events-none flex items-center justify-center transition-all duration-300 group-hover/field:-translate-y-0.5 group-hover/field:text-primary group-focus-within/field:text-primary z-10">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <input
                                    {...register("phone")}
                                    type="text"
                                    placeholder="0912345678"
                                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 ${
                                        errors.phone
                                            ? "border-status-error focus:ring-status-error/20"
                                            : "border-surface-border"
                                    }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1.5 text-xs text-status-error flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tỉnh/Thành phố & Phường/Xã Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Dropdown Tỉnh / Thành */}
                        <div>
                            <label className="block text-xs font-bold text-text-sub mb-1.5 uppercase tracking-wider">
                                Tỉnh / Thành phố <span className="text-status-error">*</span>
                            </label>
                            <div className="relative flex items-center group/field">
                                <div className="absolute left-4 text-primary/80 pointer-events-none flex items-center justify-center transition-all duration-300 group-hover/field:-translate-y-0.5 group-hover/field:text-primary group-focus-within/field:text-primary z-10">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <select
                                    {...register("province_code", {
                                        onChange: () => {
                                            setValue("ward_code", "");
                                        },
                                    })}
                                    disabled={isLoadingProvinces}
                                    className={`w-full pl-11 pr-8 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 disabled:opacity-50 appearance-none cursor-pointer ${
                                        errors.province_code
                                            ? "border-status-error focus:ring-status-error/20"
                                            : "border-surface-border"
                                    }`}
                                >
                                    <option value="">
                                        {isLoadingProvinces ? "Đang tải Tỉnh/Thành..." : "-- Chọn Tỉnh/Thành --"}
                                    </option>
                                    {provinces?.map((province: any) => {
                                        const code = province.code || province.id || province.province_code;
                                        const name = province.name || province.province_name;
                                        return (
                                            <option key={code} value={code}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                                {isLoadingProvinces && (
                                    <Loader2 className="w-4 h-4 animate-spin absolute right-4 text-text-muted z-10" />
                                )}
                            </div>
                            {errors.province_code && (
                                <p className="mt-1.5 text-xs text-status-error flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.province_code.message}
                                </p>
                            )}
                        </div>

                        {/* Dropdown Phường / Xã */}
                        <div>
                            <label className="block text-xs font-bold text-text-sub mb-1.5 uppercase tracking-wider">
                                Phường / Xã <span className="text-status-error">*</span>
                            </label>
                            <div className="relative flex items-center group/field">
                                <div className="absolute left-4 text-primary/80 pointer-events-none flex items-center justify-center transition-all duration-300 group-hover/field:-translate-y-0.5 group-hover/field:text-primary group-focus-within/field:text-primary z-10">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <select
                                    {...register("ward_code")}
                                    disabled={!selectedProvinceCode || isLoadingWards}
                                    className={`w-full pl-11 pr-8 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 disabled:opacity-50 appearance-none cursor-pointer ${
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
                                    {wards?.map((ward: any) => {
                                        const code = ward.code || ward.id || ward.ward_code;
                                        const name = ward.name || ward.ward_name;
                                        return (
                                            <option key={code} value={code}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                                {isLoadingWards && (
                                    <Loader2 className="w-4 h-4 animate-spin absolute right-4 text-text-muted z-10" />
                                )}
                            </div>
                            {errors.ward_code && (
                                <p className="mt-1.5 text-xs text-status-error flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.ward_code.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Địa chỉ chi tiết */}
                    <div>
                        <label className="block text-xs font-bold text-text-sub mb-1.5 uppercase tracking-wider">
                            Địa chỉ chi tiết <span className="text-status-error">*</span>
                        </label>
                        <div className="relative flex items-start group/field">
                            <div className="absolute left-4 top-3.5 text-primary/80 pointer-events-none flex items-center justify-center transition-all duration-300 group-hover/field:-translate-y-0.5 group-hover/field:text-primary group-focus-within/field:text-primary z-10">
                                <Home className="w-4 h-4" />
                            </div>
                            <textarea
                                {...register("address_line")}
                                rows={3}
                                placeholder="Số nhà, tên đường, tòa nhà..."
                                className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 resize-none ${
                                    errors.address_line
                                        ? "border-status-error focus:ring-status-error/20"
                                        : "border-surface-border"
                                }`}
                            />
                        </div>
                        {errors.address_line && (
                            <p className="mt-1.5 text-xs text-status-error flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.address_line.message}
                            </p>
                        )}
                    </div>

                    {/* Checkbox Đặt làm mặc định */}
                    <div className="flex items-center gap-2.5 pt-1">
                        <input
                            {...register("is_default")}
                            type="checkbox"
                            id="is_default"
                            className="w-4 h-4 rounded-md text-primary border-surface-border focus:ring-ring-brand/20 accent-primary cursor-pointer transition-transform hover:scale-110"
                        />
                        <label
                            htmlFor="is_default"
                            className="text-xs sm:text-sm font-semibold text-text-main cursor-pointer select-none"
                        >
                            Đặt làm địa chỉ giao hàng mặc định
                        </label>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-surface-border">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-2xl border border-surface-border bg-surface-bg hover:bg-surface-hover text-text-sub text-sm font-semibold transition-all duration-200 shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-primary-contrast text-sm font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-brand-sm hover:shadow-brand-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {editingAddress ? "Cập nhật" : "Tạo địa chỉ"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}