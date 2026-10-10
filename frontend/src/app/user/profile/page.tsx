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
  Sparkles,
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
      <div className="min-h-screen flex items-center justify-center bg-primary-light relative overflow-hidden">
        <div className="flex items-center gap-3 text-text-sub bg-surface-card px-6 py-4 rounded-3xl shadow-brand-md border border-surface-border">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Đang tải thông tin hồ sơ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-primary-light py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background hiệu ứng ánh sáng gradient sang trọng */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-primary/15 via-accent/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header Bar */}
        <div className="group relative flex items-center justify-between bg-surface-card p-6 sm:p-7 rounded-3xl border border-surface-border shadow-brand-md transition-all duration-300 hover:shadow-brand-md hover:border-primary/40">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
            <div className="absolute -left-6 -top-6 h-28 w-28 animate-pulse rounded-full bg-primary/10 blur-2xl transition-all duration-1000 group-hover:scale-125" />
          </div>

          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-inner transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">Hồ sơ cá nhân</h1>
              <p className="text-xs text-text-muted mt-0.5">Quản lý bảo mật, thông tin tài khoản và cá nhân hóa</p>
            </div>
          </div>
          <Link
            href={ROUTES.HOME}
            className="relative w-12 h-12 rounded-2xl border border-surface-border bg-surface-bg flex items-center justify-center text-text-sub hover:bg-primary hover:text-primary-contrast hover:border-primary transition-all duration-300 shadow-sm hover:shadow-brand-sm hover:-translate-y-0.5 active:translate-y-0 group/home"
            title="Trang chủ"
          >
            <Home className="w-5 h-5 transition-transform duration-200 group-hover/home:scale-110" />
          </Link>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-status-error-bg border border-status-error/30 text-status-error text-sm shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Card Trái: Avatar & Trạng thái */}
          <div className="group relative lg:col-span-1 bg-surface-card rounded-3xl border border-surface-border shadow-brand-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden transition-all duration-300 hover:shadow-brand-md hover:border-primary/40">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
              <div className="absolute -left-6 -top-6 h-32 w-32 animate-pulse rounded-full bg-primary/10 blur-2xl transition-all duration-1000 group-hover:scale-125" />
            </div>

            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-primary-light/70 to-transparent pointer-events-none" />

            <div className="relative mb-5 mt-2">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-surface-card bg-primary-light flex items-center justify-center shadow-brand-md transition-transform duration-500 group-hover:scale-105">
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
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-primary-contrast rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-brand-sm hover:shadow-brand-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <Camera className="w-4 h-4" />
                Thay đổi ảnh đại diện
              </button>

              {profile?.avatar_url && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={isDeletingAvatar}
                  className="w-full py-2.5 px-4 border border-surface-border bg-surface-bg hover:bg-status-error-bg hover:border-status-error/30 hover:text-status-error text-text-sub rounded-2xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa ảnh
                </button>
              )}
            </div>
          </div>

          {/* Card Phải: Thông tin chi tiết */}
          <div className="group relative lg:col-span-2 bg-surface-card rounded-3xl border border-surface-border shadow-brand-md p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-brand-md hover:border-primary/40">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
              <div className="absolute right-0 top-0 h-40 w-40 animate-pulse rounded-full bg-primary/10 blur-2xl transition-all duration-1000 group-hover:scale-125" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-surface-border">
                <div>
                  <h3 className="text-xl font-bold text-text-main">Chi tiết thông tin</h3>
                  <p className="text-xs text-text-muted mt-0.5">Thông tin định danh và giao dịch</p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-light hover:bg-primary text-primary hover:text-primary-contrast rounded-2xl text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-brand-sm hover:-translate-y-0.5 active:translate-y-0 border border-primary/20"
                >
                  <Edit3 className="w-4 h-4" />
                  Chỉnh sửa hồ sơ
                </button>
              </div>

              {/* Grid thông tin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group/item flex items-start gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-brand-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover/item:scale-110">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Họ và tên</span>
                    <span className="text-sm font-bold text-text-main mt-1 block">
                      {profile?.name || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="group/item flex items-start gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-brand-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover/item:scale-110">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Tên người dùng</span>
                    <span className="text-sm font-bold text-text-main mt-1 block">
                      {profile?.username || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="group/item flex items-start gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-brand-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover/item:scale-110">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Email</span>
                    <span className="text-sm font-bold text-text-main mt-1 block break-all">
                      {profile?.email || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="group/item flex items-start gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-brand-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover/item:scale-110">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Số điện thoại</span>
                    <span className="text-sm font-bold text-text-main mt-1 block">
                      {profile?.phone || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="group/item flex items-start gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-brand-sm sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover/item:scale-110">
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
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-bg border border-surface-border/80 hover:border-primary hover:bg-primary-light/20 transition-all duration-300 group/link cursor-pointer sm:col-span-2 shadow-sm hover:shadow-brand-sm hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0 group-hover/link:scale-110 transition-transform">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-status-error hover:bg-status-error-bg border border-transparent hover:border-status-error/30 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất tài khoản
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