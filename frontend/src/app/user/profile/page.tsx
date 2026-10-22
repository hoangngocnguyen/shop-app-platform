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
  AlertCircle,
  Hash,
  MapPin,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useProfileStore } from "@/features/profile/stores";
import EditProfileModal from "@/features/profile/components/EditProfileModal";
import UpdateAvatarModal from "@/features/profile/components/UpdateAvatarModal";
import { useAuthStore } from "@/features/auth";
import { confirm } from "@/common/stores/useConfirmStore";
import { toast } from "@/common/stores/useToastStore";
import { parseErrorMessage } from "@/lib/axios/parseError";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui";

export default function UserProfilePage() {
  const { profile, isLoading, error, fetchProfile, deleteAvatar } = useProfileStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const router = useRouter();

  const { logout } = useAuthStore();

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: "Đăng xuất",
      message: "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?",
      confirmText: "Đăng xuất",
      cancelText: "Hủy",
      variant: "danger",
    });

    if (!isConfirmed) return;

    logout();
    router.push(ROUTES.HOME);
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleDeleteAvatar = async () => {
    const isConfirmed = await confirm({
      title: "Xóa ảnh đại diện",
      message: "Bạn có chắc chắn muốn xóa ảnh đại diện không? Hành động này không thể hoàn tác.",
      confirmText: "Xóa ảnh",
      cancelText: "Hủy",
      variant: "danger",
    });

    if (!isConfirmed) return;

    setIsDeletingAvatar(true);
    try {
      await deleteAvatar();
      toast.success("Xóa ảnh đại diện thành công!");
      await fetchProfile();
    } catch (err: unknown) {
      console.error("Lỗi khi xóa ảnh đại diện:", err);
      const errorMessage = parseErrorMessage(err, "Không thể xóa ảnh đại diện này!");
      toast.error(errorMessage);
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen w-full bg-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-surface-card p-6 sm:p-7 rounded-3xl border border-surface-border shadow-brand-md">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-surface-card rounded-3xl border border-surface-border p-6 sm:p-8 flex flex-col items-center">
              <Skeleton className="w-36 h-36 rounded-full mb-5 mt-2" />
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-28 mb-4" />
              <Skeleton className="h-12 w-full rounded-2xl mt-auto" />
            </div>
            <div className="lg:col-span-2 bg-surface-card rounded-3xl border border-surface-border p-6 sm:p-8 space-y-6">
              <Skeleton className="h-7 w-48" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl sm:col-span-2" />
                <Skeleton className="h-20 w-full rounded-2xl sm:col-span-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header Bar */}
        <div className="group relative flex items-center justify-between bg-surface-card p-6 sm:p-7 rounded-3xl border border-surface-border shadow-brand-md transition-all duration-300 hover:shadow-brand-md hover:border-primary/40">
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">Hồ sơ cá nhân</h1>
              <p className="text-xs text-text-muted mt-0.5">Quản lý bảo mật, thông tin tài khoản và cá nhân hóa</p>
            </div>
          </div>
          <Link
            href={ROUTES.HOME}
            className="relative w-12 h-12 rounded-2xl border border-surface-border bg-surface-bg flex items-center justify-center text-text-sub hover:bg-primary hover:text-primary-contrast hover:border-primary transition-all duration-300 shadow-sm hover:shadow-brand-sm hover:-translate-y-1 active:translate-y-0 group/home"
            title="Trang chủ"
          >
            <Home className="w-5 h-5 transition-transform duration-200 group-hover/home:scale-110" />
          </Link>
        </div>

        {/* Thông báo lỗi kèm nút Thử lại */}
        {error && (
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-status-error-bg border border-status-error/30 text-status-error text-sm shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchProfile()}
              className="px-3.5 py-1.5 rounded-xl bg-status-error text-white font-medium hover:opacity-90 transition-opacity shrink-0 cursor-pointer text-xs"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Card Trái: Avatar */}
          <div className="group relative lg:col-span-1 bg-surface-card rounded-3xl border border-surface-border shadow-brand-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden transition-all duration-300 hover:shadow-brand-md hover:border-primary/40">
            <div className="relative mb-5 mt-2">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-surface-card bg-primary-light flex items-center justify-center shadow-brand-md transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1">
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

            <h2 className="relative text-xl font-extrabold text-text-main mt-1">
              {profile?.name || "Chưa cập nhật tên"}
            </h2>
            <p className="relative text-xs text-text-muted font-mono mt-1.5 px-3 py-1 bg-surface-bg rounded-xl border border-surface-border break-all shadow-sm">
              ID: {profile?.user_id}
            </p>

            <div className="relative inline-flex items-center gap-1.5 px-4 py-1.5 mt-3 rounded-full bg-status-success-bg text-status-success text-xs font-bold border border-status-success/20 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Đã xác thực tài khoản</span>
            </div>

            <p className="relative text-xs text-text-sub mt-4 mb-6 leading-relaxed">
              Cập nhật hình ảnh đại diện để nhận diện cá nhân trên toàn hệ thống.
            </p>

            <div className="relative w-full space-y-3 mt-auto">
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-primary-contrast rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-brand-sm hover:shadow-brand-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Camera className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                Thay đổi ảnh đại diện
              </button>

              {profile?.avatar_url && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={isDeletingAvatar}
                  className="w-full py-2.5 px-4 border border-surface-border bg-surface-bg hover:bg-status-error-bg hover:border-status-error/30 hover:text-status-error text-text-sub rounded-2xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa ảnh
                </button>
              )}
            </div>
          </div>

          {/* Card Phải: Chi tiết thông tin */}
          <div className="group relative lg:col-span-2 bg-surface-card rounded-3xl border border-surface-border shadow-brand-md p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-brand-md hover:border-primary/40">
            <div className="relative">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-surface-border">
                <div>
                  <h3 className="text-xl font-bold text-text-main">Chi tiết thông tin</h3>
                  <p className="text-xs text-text-muted mt-0.5">Thông tin định danh và giao dịch</p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-light hover:bg-primary text-primary hover:text-primary-contrast rounded-2xl text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-brand-sm hover:-translate-y-0.5 active:translate-y-0 border border-primary/20 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Chỉnh sửa hồ sơ
                </button>
              </div>

              {/* Grid thông tin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group/item flex items-start gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-brand-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-all duration-300 group-hover/item:scale-110 group-hover/item:-translate-y-0.5 shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Họ và tên</span>
                    <span className="text-sm font-bold text-text-main mt-1 block">
                      {profile?.name || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="group/item flex items-start gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-brand-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-all duration-300 group-hover/item:scale-110 group-hover/item:-translate-y-0.5 shadow-sm">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Tên người dùng</span>
                    <span className="text-sm font-bold text-text-main mt-1 block">
                      {profile?.username || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="group/item flex items-start gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-brand-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-all duration-300 group-hover/item:scale-110 group-hover/item:-translate-y-0.5 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Email</span>
                    <span className="text-sm font-bold text-text-main mt-1 block break-all">
                      {profile?.email || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="group/item flex items-start gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-brand-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-all duration-300 group-hover/item:scale-110 group-hover/item:-translate-y-0.5 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Số điện thoại</span>
                    <span className="text-sm font-bold text-text-main mt-1 block">
                      {profile?.phone || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="group/item flex items-start gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-brand-sm sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-all duration-300 group-hover/item:scale-110 group-hover/item:-translate-y-0.5 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Ngày sinh</span>
                    <span className="text-sm font-bold text-text-main mt-1 block">
                      {profile?.date_of_birth || "Chưa cập nhật ngày sinh"}
                    </span>
                  </div>
                </div>

                <Link
                  href={ROUTES.USER.ADDRESS}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 hover:border-primary hover:bg-primary-light/20 transition-all duration-300 group/link cursor-pointer sm:col-span-2 shadow-sm hover:shadow-brand-sm hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-all duration-300 group-hover/link:scale-110 group-hover/link:-translate-y-0.5 shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Địa chỉ giao hàng</span>
                      <span className="text-sm font-bold text-text-main mt-1 block truncate">
                        Xem và quản lý danh sách địa chỉ nhận hàng
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover/link:text-primary group-hover/link:translate-x-1.5 transition-all shrink-0" />
                </Link>
              </div>
            </div>

            {/* Footer nút Đăng xuất */}
            <div className="relative pt-6 mt-8 border-t border-surface-border flex justify-end">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-status-error hover:bg-status-error-bg border border-transparent hover:border-status-error/30 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Popups */}
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