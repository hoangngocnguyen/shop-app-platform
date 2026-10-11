"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Check, AlertCircle } from "lucide-react";
import { ProfileFormInput, ProfileFormOutput, profileSchema } from "../schemas/profileSchema";
import { useProfileStore } from "../stores";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { profile, updateProfile } = useProfileStore();

    // Truyền 3 tham số type: <TFieldValues, TContext, TTransformedValues>
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormInput, undefined, ProfileFormOutput>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            username: "",
            phone: "",
            date_of_birth: "",
        },
    });

    useEffect(() => {
        if (profile && isOpen) {
            reset({
                name: profile.name || "",
                username: profile.username || "",
                phone: profile.phone || "",
                date_of_birth: profile.date_of_birth || "",
            });
        }
    }, [profile, isOpen, reset]);

    if (!isOpen) return null;

    // Type của data ở đây tự động khớp với ProfileFormOutput ({ name: string | null, ... })
    const onSubmit = async (data: ProfileFormOutput) => {
        const res = await updateProfile(data);
        if (res) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-surface-card w-full max-w-lg rounded-2xl border border-surface-border shadow-brand-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modal */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
                    <h3 className="text-lg font-bold text-text-main">Cập nhật thông tin</h3>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

                    {/* Trường Họ và tên */}
                    <div>
                        <label className="block text-xs font-semibold text-text-sub mb-1.5">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            {...register("name")}
                            placeholder="Nhập họ và tên"
                            className={`w-full px-3.5 py-2.5 rounded-xl border bg-surface-bg text-text-main text-sm focus:outline-none transition-all ${errors.name
                                ? "border-status-error focus:ring-2 focus:ring-status-error/20"
                                : "border-surface-border focus:ring-2 focus:ring-ring-brand"
                                }`}
                        />
                        {errors.name && (
                            <p className="mt-1.5 text-xs text-status-error flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Trường Username */}
                        <div>
                            <label className="block text-xs font-semibold text-text-sub mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                {...register("username")}
                                placeholder="Tên người dùng"
                                className={`w-full px-3.5 py-2.5 rounded-xl border bg-surface-bg text-text-main text-sm focus:outline-none transition-all ${errors.username
                                    ? "border-status-error focus:ring-2 focus:ring-status-error/20"
                                    : "border-surface-border focus:ring-2 focus:ring-ring-brand"
                                    }`}
                            />
                            {errors.username && (
                                <p className="mt-1.5 text-xs text-status-error flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        {/* Trường Số điện thoại */}
                        <div>
                            <label className="block text-xs font-semibold text-text-sub mb-1.5">
                                Số điện thoại
                            </label>
                            <input
                                type="text"
                                {...register("phone")}
                                placeholder="0912345678"
                                className={`w-full px-3.5 py-2.5 rounded-xl border bg-surface-bg text-text-main text-sm focus:outline-none transition-all ${errors.phone
                                    ? "border-status-error focus:ring-2 focus:ring-status-error/20"
                                    : "border-surface-border focus:ring-2 focus:ring-ring-brand"
                                    }`}
                            />
                            {errors.phone && (
                                <p className="mt-1.5 text-xs text-status-error flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Trường Ngày sinh */}
                    <div>
                        <label className="block text-xs font-semibold text-text-sub mb-1.5">
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            {...register("date_of_birth")}
                            className={`w-full px-3.5 py-2.5 rounded-xl border bg-surface-bg text-text-main text-sm focus:outline-none transition-all ${errors.date_of_birth
                                ? "border-status-error focus:ring-2 focus:ring-status-error/20"
                                : "border-surface-border focus:ring-2 focus:ring-ring-brand"
                                }`}
                        />
                        {errors.date_of_birth && (
                            <p className="mt-1.5 text-xs text-status-error flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.date_of_birth.message}
                            </p>
                        )}
                    </div>

                    {/* Nút tác vụ */}
                    <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-surface-border">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 rounded-xl border border-surface-border text-text-sub hover:bg-surface-hover text-sm font-medium transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-contrast text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-brand-sm disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}