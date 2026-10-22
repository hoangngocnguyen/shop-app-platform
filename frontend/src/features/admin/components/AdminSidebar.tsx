"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Store,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
} from "lucide-react";
import { AdminNavItem } from "../types";
import { ROUTES } from "@/constants/routes";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

const NAV_ITEMS: AdminNavItem[] = [
  {
    id: "dashboard",
    label: "Tổng quan",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    id: "products",
    label: "Sản phẩm",
    href: ROUTES.ADMIN.PRODUCTS,
    icon: Package,
  },
  {
    id: "categories",
    label: "Danh mục",
    href: ROUTES.ADMIN.CATEGORIES,
    icon: FolderTree,
  },
  {
    id: "orders",
    label: "Đơn hàng",
    href: ROUTES.ADMIN.ORDERS,
    icon: ShoppingCart,
    badge: "Sắp có",
    disabled: true,
  },
  {
    id: "users",
    label: "Khách hàng",
    href: ROUTES.ADMIN.USERS,
    icon: Users,
    badge: "Sắp có",
    disabled: true,
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const isItemActive = (item: AdminNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={`h-full flex flex-col bg-surface-card border-r border-surface-border transition-all duration-300 select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      aria-label="Admin Sidebar"
    >
      {/* 1. BRAND / LOGO HEADER */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-border">
        <Link
          href={ROUTES.ADMIN.DASHBOARD}
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-primary-contrast font-black text-lg shadow-brand-sm group-hover:scale-105 transition-transform shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-base font-black tracking-tight text-text-main flex items-center gap-1">
                HOANGSHOP
                <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              </span>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Quản trị hệ thống
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* 2. NAVIGATION MENU ITEMS */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-2 mb-2">
          {!isCollapsed ? (
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Menu Quản lý
            </span>
          ) : (
            <div className="w-6 h-0.5 bg-surface-border mx-auto my-2" />
          )}
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          if (item.disabled) {
            return (
              <div
                key={item.id}
                title={isCollapsed ? `${item.label} (Đang phát triển)` : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-disabled cursor-not-allowed text-xs sm:text-sm font-medium ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-hover text-text-muted">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                isCollapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-primary text-primary-contrast font-semibold shadow-brand-sm"
                  : "text-text-sub hover:text-text-main hover:bg-surface-hover"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform ${
                  active ? "scale-110 text-white" : "text-text-sub group-hover:text-primary"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. FOOTER SHORTCUTS & DESKTOP COLLAPSE BUTTON */}
      <div className="p-3 border-t border-surface-border space-y-2">
        {/* Link quay lại Cửa hàng / Storefront */}
        <Link
          href={ROUTES.HOME}
          target="_blank"
          rel="noopener noreferrer"
          title={isCollapsed ? "Xem cửa hàng" : undefined}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-sub hover:text-primary hover:bg-primary-light/60 transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Store className="w-4 h-4 shrink-0 text-primary" />
          {!isCollapsed && (
            <span className="truncate">Xem cửa hàng</span>
          )}
        </Link>

        {/* Nút thu gọn / mở rộng Sidebar (Desktop only) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
          className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
