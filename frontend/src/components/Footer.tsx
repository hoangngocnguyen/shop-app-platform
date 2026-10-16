import React from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-surface-border bg-surface-card mt-16 sm:mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
                    
                    {/* Cột 1: Về Shop */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-text-main tracking-tight uppercase">
                            Về Shop
                        </h4>
                        <p className="text-xs text-text-sub leading-relaxed">
                            Cung cấp các sản phẩm chất lượng cao với dịch vụ uy tín hàng đầu.
                        </p>
                    </div>

                    {/* Cột 2: Liên kết nhanh */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-text-main tracking-tight uppercase">
                            Liên kết nhanh
                        </h4>
                        <ul className="space-y-2 text-xs text-text-sub">
                            <li>
                                <Link href={ROUTES.HOME} className="hover:text-primary transition-colors">
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link href={ROUTES.HOME} className="hover:text-primary transition-colors">
                                    Sản phẩm
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 3: Hỗ trợ */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-text-main tracking-tight uppercase">
                            Hỗ trợ
                        </h4>
                        <ul className="space-y-2 text-xs text-text-sub">
                            <li>
                                <Link href={ROUTES.ABOUT.FAQ} className="hover:text-primary transition-colors">
                                    Hỏi đáp
                                </Link>
                            </li>
                            <li>
                                <Link href={ROUTES.ABOUT.RETURN_POLICY} className="hover:text-primary transition-colors">
                                    Chính sách đổi trả
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 4: Kết nối */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-text-main tracking-tight uppercase">
                            Kết nối
                        </h4>
                        <div className="flex items-center gap-3 text-text-sub">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook HOANGSHOP"
                                className="p-2 rounded-xl hover:bg-surface-hover hover:text-primary transition-colors cursor-pointer"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram HOANGSHOP"
                                className="p-2 rounded-xl hover:bg-surface-hover hover:text-primary transition-colors cursor-pointer"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                </div>

                <div className="mt-12 pt-6 border-t border-surface-border text-center text-xs text-text-muted">
                    <p>© 2026 HOANGSHOP. Bản quyền thuộc về HOANGSHOP.</p>
                </div>
            </div>
        </footer>
    );
}
