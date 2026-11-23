"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    ShoppingCart,
    ShoppingBag,
    User as UserIcon,
    LogOut,
    MapPin,
    ChevronDown,
    ShieldCheck,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useCartStore } from "@/features/cart/stores";
import { useProductStore } from "@/features/products/stores";

const isValidImageUrl = (url: string): boolean =>
    /^(https?:\/\/|\/|data:image\/|blob:)/i.test(url);

export default function Header() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { cart, fetchCart } = useCartStore();
    const { setFilter, filterParams } = useProductStore();

    const [searchInput, setSearchInput] = useState(filterParams.search || "");
    const [prevFilterSearch, setPrevFilterSearch] = useState(filterParams.search);
    if (filterParams.search !== prevFilterSearch) {
        setPrevFilterSearch(filterParams.search);
        setSearchInput(filterParams.search || "");
    }
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Lấy giỏ hàng khi người dùng đã đăng nhập
    useEffect(() => {
        if (isAuthenticated()) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    // Bắt sự kiện click ra ngoài hoặc phím Escape để đóng user dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFilter({ search: searchInput.trim() || undefined });
        if (window.location.pathname !== "/") {
            router.push("/");
        }
    };

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        router.push(ROUTES.HOME);
    };

    const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const displayName = user?.name || user?.username || "Tài khoản của tôi";
    const avatarInitial = displayName.trim().charAt(0).toUpperCase();
    const avatarUrl = user?.avatar_url?.trim() || "";
    const showAvatarImage =
        isValidImageUrl(avatarUrl) && failedAvatarUrl !== avatarUrl;
    const isAdmin = user?.role?.code?.toUpperCase() === "ADMIN";

    return (
        <header className="border-b border-surface-border bg-surface-card sticky top-0 z-50 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">

                {/* BRAND LOGO */}
                <Link
                    href={ROUTES.HOME}
                    className="text-xl sm:text-2xl font-black tracking-tight text-primary hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5"
                >
                    <span>HOANGSHOP</span>
                </Link>

                {/* SEARCH BAR */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex-1 max-w-2xl flex items-center border border-surface-border rounded-xl sm:rounded-2xl overflow-hidden bg-surface-bg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all duration-200"
                >
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Tìm sản phẩm..."
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-transparent outline-none text-text-main placeholder:text-text-muted"
                    />
                    <button
                        type="submit"
                        aria-label="Tìm kiếm sản phẩm"
                        className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-primary hover:bg-primary-hover text-primary-contrast transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </form>

                {/* ACTIONS: CART & USER */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">

                    {/* CART BUTTON */}
                    <Link
                        href={ROUTES.CART}
                        className="relative flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl hover:bg-surface-hover text-text-main transition-colors group cursor-pointer"
                        title="Giỏ hàng của tôi"
                    >
                        <div className="relative">
                            <ShoppingCart className="w-5 h-5 text-text-main group-hover:text-primary transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-status-error text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold hidden md:inline">
                            Giỏ hàng của tôi
                        </span>
                    </Link>

                    {/* USER MENU */}
                    {isAuthenticated() ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                type="button"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                aria-expanded={isUserMenuOpen}
                                aria-haspopup="menu"
                                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-surface-hover border border-surface-border text-text-main transition-all cursor-pointer"
                            >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-primary text-primary-contrast font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs shrink-0">
                                    {showAvatarImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={avatarUrl}
                                            alt={displayName}
                                            onError={() => setFailedAvatarUrl(avatarUrl)}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : avatarInitial ? (
                                        <span>{avatarInitial}</span>
                                    ) : (
                                        <UserIcon className="w-4 h-4" />
                                    )}
                                </div>
                                <span className="text-xs sm:text-sm font-semibold hidden sm:inline">
                                    Của tôi
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                            </button>

                            {/* DROPDOWN MENU */}
                            {isUserMenuOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 mt-2 w-52 bg-surface-card rounded-2xl border border-surface-border shadow-brand-md py-1.5 z-50 animate-in fade-in duration-200"
                                >
                                    <div className="px-4 py-2 border-b border-surface-border">
                                        <p className="text-xs font-semibold text-text-main truncate">
                                            {displayName}
                                        </p>
                                        {isAdmin && (
                                            <span className="mt-1 inline-block rounded-md bg-primary-light px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                                Quản trị viên
                                            </span>
                                        )}
                                    </div>

                                    {isAdmin && (
                                        <Link
                                            href={ROUTES.ADMIN.DASHBOARD}
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary-light/60 transition-colors border-b border-surface-border"
                                        >
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                            <span>Trang quản trị</span>
                                        </Link>
                                    )}

                                    <Link
                                        href={ROUTES.USER.PROFILE}
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-text-sub hover:text-text-main hover:bg-surface-hover transition-colors"
                                    >
                                        <UserIcon className="w-4 h-4 text-primary" />
                                        <span>Hồ sơ cá nhân</span>
                                    </Link>
                                    <Link
                                        href={ROUTES.USER.ADDRESS}
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-text-sub hover:text-text-main hover:bg-surface-hover transition-colors"
                                    >
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>Địa chỉ giao hàng</span>
                                    </Link>
                                    <Link
                                        href={ROUTES.USER.ORDERS}
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-text-sub hover:text-text-main hover:bg-surface-hover transition-colors"
                                    >
                                        <ShoppingBag className="w-4 h-4 text-primary" />
                                        <span>Đơn hàng của bạn</span>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-status-error hover:bg-status-error-bg transition-colors border-t border-surface-border mt-1 cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href={ROUTES.AUTH.LOGIN}
                                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-main hover:text-primary transition-colors"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href={ROUTES.AUTH.REGISTER}
                                className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-primary-contrast transition-colors shadow-brand-sm"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </header>
    );
}
