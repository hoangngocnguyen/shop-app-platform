"use client";

import React from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import {
  Home,
  ShieldCheck,
  Truck,
  UserCheck,
  Phone,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Lock,
  CreditCard,
  Scale,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-surface-bg,#f8fafc)] via-white to-[var(--color-surface-bg,#f8fafc)] text-[var(--color-text-main,#0f172a)] antialiased selection:bg-[var(--color-primary,#0f766e)] selection:text-white">
      <main className="max-w-[1240px] mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 mb-6 text-sm text-[var(--color-text-muted,#94a3b8)] overflow-x-auto whitespace-nowrap">
          <Link
            href={ROUTES.HOME}
            className="hover:text-[var(--color-primary,#0f766e)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 font-medium"
          >
            <Home className="w-4 h-4" /> Trang chủ
          </Link>
          <span className="text-[var(--color-surface-border,#e2e8f0)]">/</span>
          <span className="text-[var(--color-primary,#0f766e)] font-bold">
            Điều khoản sử dụng
          </span>
        </nav>

        {/* Dynamic Glowing Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#042f2e] p-8 md:p-12 mb-10 text-white shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 group transition-all duration-500 hover:shadow-[var(--color-primary,#0f766e)]/50">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-white/20 backdrop-blur-xl text-emerald-100 border border-white/30 shadow-lg tracking-wide uppercase group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4 text-emerald-300" /> Thỏa thuận người dùng
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-lg flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-300">
              Điều khoản &amp; Quy định
            </h1>
            <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed font-normal">
              Quy định sử dụng dịch vụ tại HoangShop nhằm đảm bảo minh bạch, an toàn và bảo vệ quyền lợi tối đa cho quý khách hàng.
            </p>
          </div>

          <Scale className="absolute -right-8 -bottom-8 w-64 h-64 text-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute right-1/4 -top-20 w-60 h-60 bg-teal-300/30 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Article Content */}
          <div className="w-full lg:w-3/4 space-y-6">
            <div className="bg-white/95 backdrop-blur-2xl p-6 md:p-10 rounded-3xl shadow-2xl shadow-slate-200/60 border border-[var(--color-surface-border,#e2e8f0)] space-y-8 relative overflow-hidden">
              <p className="text-sm md:text-base text-[var(--color-text-sub,#475569)] leading-relaxed border-b border-[var(--color-surface-border,#e2e8f0)] pb-6 font-normal">
                Chào mừng bạn đến với <strong className="text-[var(--color-primary,#0f766e)] font-bold">HoangShop</strong>. Khi truy cập và sử dụng dịch vụ của chúng tôi, bạn đã đồng ý tuân thủ các quy định dưới đây nhằm đảm bảo trải nghiệm mua sắm an toàn và minh bạch nhất.
              </p>

              {/* Section 01 */}
              <section className="space-y-4 group">
                <h2 className="text-lg md:text-xl font-black text-[var(--color-text-main,#0f172a)] flex items-center gap-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-[var(--color-primary,#0f766e)] flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </span>
                  01. Trách nhiệm người dùng
                </h2>
                <ul className="space-y-3.5 pl-2 text-sm text-[var(--color-text-sub,#475569)]">
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Cung cấp chính xác thông tin cá nhân (Họ tên, Số điện thoại, Địa chỉ giao hàng). HoangShop không chịu trách nhiệm đối với các đơn hàng thất lạc do thông tin sai lệch.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Tuyệt đối không sử dụng công cụ can thiệp trái phép vào hệ thống website hoặc làm thay đổi cấu trúc dữ liệu của cửa hàng.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Section 02 */}
              <section className="space-y-4 pt-6 border-t border-[var(--color-surface-border,#e2e8f0)] group">
                <h2 className="text-lg md:text-xl font-black text-[var(--color-text-main,#0f172a)] flex items-center gap-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </span>
                  02. Quy định đặt hàng &amp; Thanh toán
                </h2>
                <ul className="space-y-3.5 pl-2 text-sm text-[var(--color-text-sub,#475569)]">
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Vì chúng tôi thực hiện <strong>vận chuyển nội bộ</strong>, đơn hàng sẽ được nhân viên tư vấn gọi điện xác nhận trước khi giao.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Khách hàng có quyền linh hoạt chọn thanh toán khi nhận hàng (COD) hoặc chuyển khoản qua ngân hàng.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Đối với các đơn hàng đặc thù hoặc có giá trị trên <strong>20.000.000đ</strong>, cửa hàng có thể thỏa thuận yêu cầu đặt cọc trước 10%.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Section 03 */}
              <section className="space-y-4 pt-6 border-t border-[var(--color-surface-border,#e2e8f0)] group">
                <h2 className="text-lg md:text-xl font-black text-[var(--color-text-main,#0f172a)] flex items-center gap-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  03. Chính sách về giá &amp; Khuyến mãi
                </h2>
                <ul className="space-y-3.5 pl-2 text-sm text-[var(--color-text-sub,#475569)]">
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Giá niêm yết trên website là giá chính thức (đã bao gồm VAT) và có hiệu lực tại thời điểm bạn đặt hàng thành công.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Các mã ưu đãi/khuyến mãi chỉ có giá trị trong thời hạn quy định và không có giá trị quy đổi thành tiền mặt.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Section 04 & 05 */}
              <section className="space-y-4 pt-6 border-t border-[var(--color-surface-border,#e2e8f0)] group">
                <h2 className="text-lg md:text-xl font-black text-[var(--color-text-main,#0f172a)] flex items-center gap-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <Lock className="w-5 h-5" />
                  </span>
                  04. Bảo mật thông tin &amp; Điều khoản chung
                </h2>
                <ul className="space-y-3.5 pl-2 text-sm text-[var(--color-text-sub,#475569)]">
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Quyền riêng tư:</strong> Thông tin của bạn được cam kết bảo mật tuyệt đối, chỉ sử dụng cho mục đích xác nhận đơn hàng, giao hàng và kích hoạt bảo hành.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Thay đổi quy định:</strong> HoangShop có quyền cập nhật bổ sung nội dung điều khoản để phù hợp với thực tế. Nội dung thay đổi sẽ có hiệu lực ngay khi đăng tải công khai.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Version Footer */}
              <div className="mt-8 pt-6 border-t border-[var(--color-surface-border,#e2e8f0)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--color-text-muted,#94a3b8)]">
                <p>Phiên bản: 2.0.26 (Cập nhật 2026)</p>
                <p>Bản quyền thuộc về &copy; HoangShop</p>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Commitments Card */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-md border border-[var(--color-surface-border,#e2e8f0)] space-y-5">
                <h3 className="text-[var(--color-primary,#0f766e)] font-extrabold uppercase text-xs tracking-wider border-b border-slate-100 pb-3">
                  Cam kết từ HoangShop
                </h3>
                <ul className="space-y-5">
                  <li className="flex items-start gap-3.5 group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[var(--color-primary,#0f766e)] flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-text-main,#0f172a)] group-hover:text-[var(--color-primary,#0f766e)] transition-colors">100% Chính hãng</h4>
                      <p className="text-[11px] text-[var(--color-text-muted,#94a3b8)] mt-0.5 leading-relaxed">
                        Hoàn tiền 200% nếu phát hiện hàng giả.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5 group">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-text-main,#0f172a)] group-hover:text-teal-700 transition-colors">Giao hàng nội bộ</h4>
                      <p className="text-[11px] text-[var(--color-text-muted,#94a3b8)] mt-0.5 leading-relaxed">
                        Nhân viên shop trực tiếp giao tận tay.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5 group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-text-main,#0f172a)] group-hover:text-emerald-800 transition-colors">Bảo mật tuyệt đối</h4>
                      <p className="text-[11px] text-[var(--color-text-muted,#94a3b8)] mt-0.5 leading-relaxed">
                        Thông tin khách hàng được mã hóa an toàn.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Consultation Call Card */}
              <div className="bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#042f2e] text-white p-6 rounded-3xl shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 relative overflow-hidden group text-center space-y-4">
                <div className="relative z-10 space-y-3">
                  <div className="w-14 h-14 bg-white/10 text-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base group-hover:translate-x-1 transition-transform">Cần tư vấn thêm?</h3>
                    <p className="text-xs text-emerald-100/90 mt-1 font-normal">
                      Đường dây nóng hỗ trợ khách hàng 24/7
                    </p>
                  </div>
                  <a
                    href="tel:0123456789"
                    className="flex items-center justify-center gap-2 w-full bg-white text-[var(--color-primary,#0f766e)] py-3.5 rounded-2xl font-black hover:bg-emerald-50 hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-300 text-sm shadow-md select-none"
                  >
                    <Phone className="w-4 h-4" /> 0123 456 789
                  </a>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
              </div>

              {/* Quick Link to FAQ */}
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-[var(--color-surface-border,#e2e8f0)] shadow-md hover:shadow-xl transition-shadow group">
                <h4 className="font-bold text-sm text-[var(--color-text-main,#0f172a)] mb-2 flex items-center gap-2 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <HelpCircle className="w-4 h-4 text-[var(--color-primary,#0f766e)]" /> Bạn còn câu hỏi khác?
                </h4>
                <p className="text-xs text-[var(--color-text-sub,#475569)] mb-4 leading-relaxed">
                  Xem ngay danh sách giải đáp thắc mắc tại trung tâm trợ giúp.
                </p>
                <Link
                  href={ROUTES.ABOUT.FAQ}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-primary,#0f766e)] hover:translate-x-2 transition-transform duration-200"
                >
                  Xem trang Hỏi đáp (FAQ) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}