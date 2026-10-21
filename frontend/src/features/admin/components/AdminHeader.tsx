"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Store,
  LogOut,
  User as UserIcon,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { toast } from "@/common/stores/useToastStore";
import { ROUTES } from "@/constants/routes";

interface AdminHeaderProps {
  onOpenMobile: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (pathname === ROUTES.ADMIN.DASHBOARD) return "Tổng quan bảng điều khiển";
    if (pathname.startsWith(ROUTES.ADMIN.PRODUCTS)) return "Quản lý sản phẩm";
    if (pathname.startsWith(ROUTES.ADMIN.CATEGORIES)) return "Quản lý danh mục";
    if (pathname.startsWith(ROUTES.ADMIN.ORDERS)) return "Quản lý đơn hàng";
    if (pathname.startsWith(ROUTES.ADMIN.USERS)) return "Quản lý khách hàng";
    return "Trung tâm Quản trị";
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đã đăng xuất thành công khỏi hệ thống quản trị");
      router.push(ROUTES.AUTH.LOGIN);
    } catch {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  const displayName = user?.name || user?.username || "Quản trị viên";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-16 bg-surface-card/95 backdrop-blur-md border-b border-surface-border px-4 sm:px-6 flex items-center justify-between">
      {/* 1. LEFT: MOBILE TOGGLE & BREADCRUMBS */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-text-sub hover:text-text-main hover:bg-surface-hover transition-colors"
          aria-label="Mở Menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
            <span>Admin</span>
            <span>/</span>
            <span className="text-primary font-semibold">{getPageTitle()}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-text-main tracking-tight line-clamp-1">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* 2. RIGHT: SHORTCUT TO STOREFRONT & USER PROFILE DROPDOWN */}
      <div className="flex items-center gap-3">
        {/* Nút Xem Cửa Hàng (Storefront) */}
        <Link
          href={ROUTES.HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border bg-surface-bg text-xs font-semibold text-text-sub hover:text-primary hover:border-primary/40 hover:bg-primary-light/40 transition-all duration-200"
        >
          <Store className="w-3.5 h-3.5 text-primary" />
          <span>Xem cửa hàng</span>
          <ExternalLink className="w-3 h-3 text-text-muted" />
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2 rounded-2xl hover:bg-surface-hover border border-transparent hover:border-surface-border transition-all duration-200 focus:outline-none"
            aria-expanded={isDropdownOpen}
          >
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={displayName}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-hover text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {initials || <UserIcon className="w-4 h-4 text-white" />}
              </div>
            )}

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-text-main leading-tight truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-primary" />
                ADMIN
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* DROPDOWN MENU */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-card border border-surface-border shadow-brand-md py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-surface-border mb-1">
                <p className="text-xs font-bold text-text-main truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-text-muted truncate">
                  {user?.username ? `@${user.username}` : "Tài khoản Quản trị"}
                </p>
              </div>

              <Link
                href={ROUTES.USER.PROFILE}
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-text-sub hover:text-text-main hover:bg-surface-hover transition-colors"
              >
                <UserIcon className="w-4 h-4 text-text-muted" />
                <span>Hồ sơ cá nhân</span>
              </Link>

              <Link
                href={ROUTES.HOME}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsDropdownOpen(false)}
                className="sm:hidden flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-text-sub hover:text-text-main hover:bg-surface-hover transition-colors"
              >
                <Store className="w-4 h-4 text-primary" />
                <span>Xem cửa hàng</span>
              </Link>

              <div className="my-1 border-t border-surface-border" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-status-error hover:bg-status-error-bg transition-colors"
              >
                <LogOut className="w-4 h-4 text-status-error" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
