"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Check, AlertCircle, Edit3 } from "lucide-react";
import { ProfileFormInput, ProfileFormOutput, profileSchema } from "../schemas/profileSchema";
import { useProfileStore } from "../stores";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { profile, updateProfile } = useProfileStore();

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

    const onSubmit = async (data: ProfileFormOutput) => {
        const res = await updateProfile(data);
        if (res) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className="group relative bg-surface-card w-full max-w-lg rounded-3xl border border-surface-border shadow-brand-md overflow-hidden animate-in zoom-in-95 duration-300 transition-all hover:border-primary/40"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
                    <div className="absolute -left-6 -top-6 h-32 w-32 animate-pulse rounded-full bg-primary/10 blur-2xl transition-all duration-1000 group-hover:scale-125" />
                </div>

                {/* Header Modal */}
                <div className="relative flex items-center justify-between px-6 py-5 border-b border-surface-border bg-surface-bg/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shadow-inner">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-text-main">Cập nhật thông tin cá nhân</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main p-2 rounded-xl hover:bg-surface-hover transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="relative p-6 space-y-4">

                    <div>
                        <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wider">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            {...register("name")}
                            placeholder="Nhập họ và tên của bạn"
                            className={`w-full px-4 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 ${errors.name
                                ? "border-status-error focus:ring-status-error/20"
                                : "border-surface-border"
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
                        <div>
                            <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wider">
                                Username
                            </label>
                            <input
                                type="text"
                                {...register("username")}
                                placeholder="Tên người dùng"
                                className={`w-full px-4 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 ${errors.username
                                    ? "border-status-error focus:ring-status-error/20"
                                    : "border-surface-border"
                                    }`}
                            />
                            {errors.username && (
                                <p className="mt-1.5 text-xs text-status-error flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wider">
                                Số điện thoại
                            </label>
                            <input
                                type="text"
                                {...register("phone")}
                                placeholder="0912345678"
                                className={`w-full px-4 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 ${errors.phone
                                    ? "border-status-error focus:ring-status-error/20"
                                    : "border-surface-border"
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

                    <div>
                        <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wider">
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            {...register("date_of_birth")}
                            className={`w-full px-4 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 ${errors.date_of_birth
                                ? "border-status-error focus:ring-status-error/20"
                                : "border-surface-border"
                                }`}
                        />
                        {errors.date_of_birth && (
                            <p className="mt-1.5 text-xs text-status-error flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.date_of_birth.message}
                            </p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-surface-border">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-2xl border border-surface-border bg-surface-bg hover:bg-surface-hover text-text-sub text-sm font-semibold transition-all duration-200 shadow-sm hover:-translate-y-0.5"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-primary-contrast text-sm font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-brand-sm hover:shadow-brand-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}