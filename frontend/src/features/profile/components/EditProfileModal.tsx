"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Loader2,
  Check,
  AlertCircle,
  UserPen,
  User,
  AtSign,
  Phone,
  Calendar,
} from "lucide-react";
import { ProfileFormInput, ProfileFormOutput, profileSchema } from "../schemas/profile-schema";
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
              <UserPen className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main tracking-tight">Cập nhật thông tin cá nhân</h3>
              <p className="text-[11px] text-text-muted">Chỉnh sửa và lưu thay đổi cho hồ sơ cá nhân</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-main p-2 rounded-2xl hover:bg-surface-hover transition-all duration-200 cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="relative p-6 sm:p-7 space-y-4.5">
          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-bold text-text-sub mb-1.5 uppercase tracking-wider">
              Họ và tên
            </label>
            <div className="relative flex items-center group/field">
              <div className="absolute left-4 text-primary/80 pointer-events-none flex items-center justify-center transition-all duration-300 group-hover/field:-translate-y-0.5 group-hover/field:text-primary group-focus-within/field:text-primary z-10">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                {...register("name")}
                placeholder="Nhập họ và tên của bạn"
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 ${
                  errors.name
                    ? "border-status-error focus:ring-status-error/20"
                    : "border-surface-border"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-status-error flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-text-sub mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative flex items-center group/field">
                <div className="absolute left-4 text-primary/80 pointer-events-none flex items-center justify-center transition-all duration-300 group-hover/field:-translate-y-0.5 group-hover/field:text-primary group-focus-within/field:text-primary z-10">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  {...register("username")}
                  placeholder="Tên người dùng"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 ${
                    errors.username
                      ? "border-status-error focus:ring-status-error/20"
                      : "border-surface-border"
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs text-status-error flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-bold text-text-sub mb-1.5 uppercase tracking-wider">
                Số điện thoại
              </label>
              <div className="relative flex items-center group/field">
                <div className="absolute left-4 text-primary/80 pointer-events-none flex items-center justify-center transition-all duration-300 group-hover/field:-translate-y-0.5 group-hover/field:text-primary group-focus-within/field:text-primary z-10">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="Nhập số điện thoại"
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

          {/* Ngày sinh */}
          <div>
            <label className="block text-xs font-bold text-text-sub mb-1.5 uppercase tracking-wider">
              Ngày sinh
            </label>
            <div className="relative flex items-center group/field">
              <div className="absolute left-4 text-primary/80 pointer-events-none flex items-center justify-center transition-all duration-300 group-hover/field:-translate-y-0.5 group-hover/field:text-primary group-focus-within/field:text-primary z-10">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                {...register("date_of_birth")}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-surface-bg text-text-main text-sm shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-brand-sm focus:ring-4 focus:ring-ring-brand/15 ${
                  errors.date_of_birth
                    ? "border-status-error focus:ring-status-error/20"
                    : "border-surface-border"
                }`}
              />
            </div>
            {errors.date_of_birth && (
              <p className="mt-1.5 text-xs text-status-error flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.date_of_birth.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-surface-border bg-surface-bg text-text-sub font-medium transition-all duration-200 hover:border-surface-border/80 hover:bg-surface-hover hover:text-text-main cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white font-medium shadow-brand-sm transition-all duration-200 hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
