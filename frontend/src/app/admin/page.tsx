"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Plus,
  TrendingUp,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const displayName = user?.name || user?.username || "Quản trị viên";

  const statCards = [
    {
      title: "Quản lý sản phẩm",
      description: "Xem danh sách, cập nhật giá bán, tồn kho và kiểm soát hàng hóa.",
      href: ROUTES.ADMIN.PRODUCTS,
      icon: Package,
      actionText: "Quản lý sản phẩm",
      colorClass: "bg-primary-light text-primary border-primary/20",
      iconBg: "bg-primary text-white",
    },
    {
      title: "Quản lý danh mục",
      description: "Tổ chức cây phân cấp sản phẩm, phân loại và quản trị nhóm hàng.",
      href: ROUTES.ADMIN.CATEGORIES,
      icon: FolderTree,
      actionText: "Quản lý danh mục",
      colorClass: "bg-status-info-bg text-status-info border-status-info/20",
      iconBg: "bg-status-info text-white",
    },
    {
      title: "Đơn hàng & Vận chuyển",
      description: "Theo dõi đơn hàng, xử lý giao hàng và trạng thái thanh toán.",
      href: ROUTES.ADMIN.ORDERS,
      icon: ShoppingCart,
      actionText: "Đang phát triển",
      colorClass: "bg-surface-hover text-text-sub border-surface-border",
      iconBg: "bg-text-muted text-white",
      badge: "Sắp ra mắt",
      disabled: true,
    },
    {
      title: "Tài khoản khách hàng",
      description: "Quản lý danh sách thành viên, phân quyền và kiểm soát bảo mật.",
      href: ROUTES.ADMIN.USERS,
      icon: Users,
      actionText: "Đang phát triển",
      colorClass: "bg-surface-hover text-text-sub border-surface-border",
      iconBg: "bg-text-muted text-white",
      badge: "Sắp ra mắt",
      disabled: true,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#115e59] to-[#042f2e] p-6 sm:p-10 text-white shadow-brand-md border border-primary/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Hệ thống Quản trị HOANGSHOP v1.0</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Xin chào, {displayName}! 👋
          </h2>

          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Chào mừng bạn quay trở lại Trung tâm Quản trị. Tại đây bạn có thể kiểm soát toàn diện danh mục hàng hóa, giá niêm yết, tồn kho và cấu hình hệ thống.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.ADMIN.PRODUCTS}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all shadow-xs"
            >
              <Package className="w-4 h-4 text-primary" />
              <span>Đi đến Sản phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={ROUTES.HOME}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all backdrop-blur-xs"
            >
              <span>Xem trang bán hàng</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Decorative background glow circles */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-48 h-48 bg-teal-300/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. QUICK MANAGEMENT CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-text-main flex items-center gap-2">
            <span>Phân hệ Quản trị</span>
            <span className="text-xs font-normal text-text-muted">
              (Truy cập nhanh các chức năng chính)
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;

            if (card.disabled) {
              return (
                <div
                  key={card.title}
                  className="rounded-2xl bg-surface-card border border-surface-border p-5 sm:p-6 opacity-75 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-text-muted">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-text-main">
                          {card.title}
                        </h4>
                        {card.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-hover text-text-muted border border-surface-border">
                            {card.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed mb-4">
                    {card.description}
                  </p>

                  <div className="text-xs font-semibold text-text-disabled flex items-center gap-1.5 cursor-not-allowed">
                    <span>{card.actionText}</span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-2xl bg-surface-card border border-surface-border hover:border-primary/40 hover:shadow-brand-md p-5 sm:p-6 transition-all duration-200 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs ${card.iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-text-main group-hover:text-primary transition-colors">
                        {card.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-status-success flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Đang hoạt động
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-surface-hover group-hover:bg-primary-light group-hover:text-primary flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-text-sub group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-text-sub leading-relaxed mb-4">
                  {card.description}
                </p>

                <div className="text-xs font-bold text-primary flex items-center gap-1.5 pt-2 border-t border-surface-border/60">
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. SYSTEM SECURITY & BEST PRACTICES NOTES */}
      <div className="rounded-2xl bg-primary-light/40 border border-primary/20 p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Quy tắc bảo mật và lưu ý Quản trị</span>
        </div>
        <ul className="text-xs text-text-sub space-y-1.5 list-disc pl-5">
          <li>
            Mọi thao tác thêm mới, sửa đổi hoặc xóa hàng loạt đều được kiểm soát chặt chẽ bởi quyền <strong className="text-text-main">ADMIN</strong> qua Backend RBAC.
          </li>
          <li>
            Sản phẩm đã từng phát sinh trong đơn hàng của khách hàng sẽ được <strong className="text-text-main">chặn xóa an toàn</strong> để bảo vệ tính toàn vẹn dữ liệu kế toán.
          </li>
          <li>
            Hình ảnh sản phẩm tải lên được tối ưu hóa và lưu trữ tự động trên máy chủ Cloudinary CDN.
          </li>
        </ul>
      </div>
    </div>
  );
}
