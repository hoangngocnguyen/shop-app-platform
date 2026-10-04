"use client";

import React, { useEffect, useState } from "react";
import {
    User,
    Camera,
    Trash2,
    Edit3,
    Mail,
    Phone,
    Calendar,
    LogOut,
    Home,
    ShieldCheck,
    Loader2,
    AlertCircle,
    Hash,
    MapPin,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useProfileStore } from "@/features/profile/stores";
import EditProfileModal from "@/features/profile/components/EditProfileModal";
import UpdateAvatarModal from "@/features/profile/components/UpdateAvatarModal";
import { useAuthStore } from "@/features/auth";

export default function UserProfilePage() {
    const { profile, isLoading, error, fetchProfile, deleteAvatar } = useProfileStore();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const { logout } = useAuthStore();

    const handleLogout = async () => {
        logout();
    };


    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleDeleteAvatar = async () => {
        if (confirm("Bạn có chắc chắn muốn xóa ảnh đại diện không?")) {
            await deleteAvatar();
        }
    };

    if (isLoading && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-bg">
                <div className="flex items-center gap-3 text-text-sub">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm font-medium">Đang tải thông tin hồ sơ...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-bg py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Bar */}
                <div className="flex items-center justify-between bg-surface-card p-4 sm:p-6 rounded-2xl border border-surface-border shadow-brand-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-text-main">Hồ sơ cá nhân</h1>
                            <p className="text-xs text-text-muted">Quản lý thông tin tài khoản và cá nhân hóa</p>
                        </div>
                    </div>
                    <Link
                        href={ROUTES.HOME}
                        className="w-10 h-10 rounded-xl border border-surface-border flex items-center justify-center text-text-sub hover:bg-surface-hover hover:text-text-main transition-colors"
                        title="Trang chủ"
                    >
                        <Home className="w-5 h-5" />
                    </Link>
                </div>

                {/* Thông báo lỗi */}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-status-error-bg border border-status-error/20 text-status-error text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Card Trái: Avatar & Trạng thái */}
                    <div className="lg:col-span-1 bg-surface-card rounded-2xl border border-surface-border shadow-brand-sm p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-bg bg-primary-light flex items-center justify-center shadow-inner">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.name || "Avatar"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-16 h-16 text-primary" />
                                )}
                            </div>
                        </div>

                        <h2 className="text-lg font-bold text-text-main">
                            {profile?.name || "Chưa cập nhật tên"}
                        </h2>
                        <p className="text-xs text-text-muted font-mono mt-1 break-all px-2">
                            ID: {profile?.user_id}
                        </p>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-status-success-bg text-status-success text-xs font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Đã xác thực</span>
                        </div>

                        <p className="text-xs text-text-sub mt-4 mb-6">
                            Cập nhật ảnh đại diện để nhận diện tài khoản của bạn trên hệ thống.
                        </p>

                        <div className="w-full space-y-2 mt-auto">
                            <button
                                onClick={() => setIsAvatarModalOpen(true)}
                                className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-primary-contrast rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-brand-sm"
                            >
                                <Camera className="w-4 h-4" />
                                Thay đổi ảnh đại diện
                            </button>

                            {profile?.avatar_url && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    className="w-full py-2.5 px-4 border border-surface-border hover:bg-status-error-bg hover:border-status-error/30 hover:text-status-error text-text-sub rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa ảnh
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Card Phải: Thông tin chi tiết */}
                    <div className="lg:col-span-2 bg-surface-card rounded-2xl border border-surface-border shadow-brand-sm p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-surface-border">
                                <h3 className="text-lg font-bold text-text-main">Thông tin cá nhân</h3>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-light hover:bg-primary/10 text-primary rounded-xl text-sm font-medium transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Chỉnh sửa
                                </button>
                            </div>

                            {/* Grid thông tin */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-bg border border-surface-border/60">
                                    <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <span className="block text-xs text-text-muted">Họ và tên</span>
                                        <span className="text-sm font-semibold text-text-main mt-0.5 block">
                                            {profile?.name || "Chưa cập nhật"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-bg border border-surface-border/60">
                                    <Hash className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <span className="block text-xs text-text-muted">Tên người dùng</span>
                                        <span className="text-sm font-semibold text-text-main mt-0.5 block">
                                            {profile?.username || "Chưa cập nhật"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-bg border border-surface-border/60">
                                    <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <span className="block text-xs text-text-muted">Email</span>
                                        <span className="text-sm font-semibold text-text-main mt-0.5 block break-all">
                                            {profile?.email || "Chưa cập nhật"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-bg border border-surface-border/60">
                                    <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <span className="block text-xs text-text-muted">Số điện thoại</span>
                                        <span className="text-sm font-semibold text-text-main mt-0.5 block">
                                            {profile?.phone || "Chưa cập nhật"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-bg border border-surface-border/60 sm:col-span-2">
                                    <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <span className="block text-xs text-text-muted">Ngày sinh</span>
                                        <span className="text-sm font-semibold text-text-main mt-0.5 block">
                                            {profile?.date_of_birth || "Chưa cập nhật ngày sinh"}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href={ROUTES.USER.ADDRESS}
                                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-bg border border-surface-border/60 hover:border-primary/50 hover:bg-surface-bg/80 transition-all group cursor-pointer sm:col-span-2"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                        <div className="min-w-0">
                                            <span className="block text-xs text-text-muted">Địa chỉ giao hàng</span>
                                            <span className="text-sm font-semibold text-text-main mt-0.5 block truncate">
                                                {"Xem và quản lý danh sách địa chỉ"}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                </Link>
                            </div>
                        </div>

                        {/* Footer nút Đăng xuất */}
                        <div className="pt-6 mt-6 border-t border-surface-border flex justify-end">
                            <button
                                onClick={() => {
                                    handleLogout();
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-status-error hover:bg-status-error-bg border border-transparent hover:border-status-error/20 text-sm font-medium transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Đăng xuất
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Tích hợp Modals Popup */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <UpdateAvatarModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
            />
        </div>
    );
}