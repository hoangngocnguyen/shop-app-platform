"use client";

import React from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import {
  Home,
  Truck,
  Phone,
  Clock,
  MapPin,
  ClipboardCheck,
  PhoneCall,
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function ShippingPolicyPage() {
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
            Chính sách vận chuyển
          </span>
        </nav>

        {/* Dynamic Glowing Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#042f2e] p-8 md:p-12 mb-10 text-white shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 group transition-all duration-500 hover:shadow-[var(--color-primary,#0f766e)]/50">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-white/20 backdrop-blur-xl text-emerald-100 border border-white/30 shadow-lg tracking-wide uppercase group-hover:scale-105 transition-transform">
              <Truck className="w-4 h-4 text-emerald-300" /> Đội ngũ vận chuyển nội bộ
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-lg flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-300">
              Chính sách vận chuyển tận nơi
            </h1>
            <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed font-normal">
              An toàn tuyệt đối – Giao hàng trực tiếp bởi đội ngũ chuyên nghiệp của HoangShop. Khách hàng được kiểm tra &amp; thử sản phẩm trước khi thanh toán.
            </p>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute right-1/4 -top-20 w-60 h-60 bg-teal-300/30 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Process Steps Cards */}
        <div className="mb-10">
          <h3 className="text-lg font-black mb-6 text-[var(--color-text-main,#0f172a)] uppercase tracking-wide flex items-center gap-2 hover:translate-x-1 transition-transform">
            <Sparkles className="w-5 h-5 text-[var(--color-primary,#0f766e)]" />
            Quy trình giao hàng trực tiếp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-emerald-200/80 flex flex-col items-center shadow-md hover:shadow-2xl hover:shadow-[var(--color-primary,#0f766e)]/20 hover:-translate-y-2 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer select-none group border-b-4 border-b-[var(--color-primary,#0f766e)]">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[var(--color-primary,#0f766e)] flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xs tracking-wider text-[var(--color-primary,#0f766e)] bg-emerald-100/60 px-3 py-1 rounded-full mb-2">
                BƯỚC 1
              </span>
              <h4 className="font-bold text-sm text-[var(--color-text-main,#0f172a)] group-hover:text-[var(--color-primary,#0f766e)] transition-colors">Xác nhận đơn hàng</h4>
              <p className="text-xs text-center text-[var(--color-text-muted,#94a3b8)] mt-1 leading-relaxed">
                Hệ thống tự động ghi nhận &amp; xử lý ngay sau khi đặt
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-teal-200/80 flex flex-col items-center shadow-md hover:shadow-2xl hover:shadow-teal-600/20 hover:-translate-y-2 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer select-none group border-b-4 border-b-teal-600">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xs tracking-wider text-teal-700 bg-teal-100/60 px-3 py-1 rounded-full mb-2">
                BƯỚC 2
              </span>
              <h4 className="font-bold text-sm text-[var(--color-text-main,#0f172a)] group-hover:text-teal-700 transition-colors">Kiểm tra &amp; Liên hệ</h4>
              <p className="text-xs text-center text-[var(--color-text-muted,#94a3b8)] mt-1 leading-relaxed">
                Gọi điện báo giờ giao &amp; chuẩn bị hàng theo yêu cầu
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-emerald-200/80 flex flex-col items-center shadow-md hover:shadow-2xl hover:shadow-emerald-700/20 hover:-translate-y-2 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer select-none group border-b-4 border-b-emerald-700">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xs tracking-wider text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full mb-2">
                BƯỚC 3
              </span>
              <h4 className="font-bold text-sm text-[var(--color-text-main,#0f172a)] group-hover:text-emerald-800 transition-colors">Giao hàng &amp; Thử máy</h4>
              <p className="text-xs text-center text-[var(--color-text-muted,#94a3b8)] mt-1 leading-relaxed">
                Giao tận nơi, hỗ trợ lên tay thử &amp; kích hoạt bảo hành
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="w-full lg:w-3/4 space-y-6">
            <div className="bg-white/95 backdrop-blur-2xl p-6 md:p-10 rounded-3xl shadow-2xl shadow-slate-200/60 border border-[var(--color-surface-border,#e2e8f0)] space-y-8">
              <p className="text-sm md:text-base text-[var(--color-text-sub,#475569)] leading-relaxed border-b border-[var(--color-surface-border,#e2e8f0)] pb-6 font-normal">
                Tại <strong className="text-[var(--color-primary,#0f766e)] font-bold">HoangShop</strong>, chúng tôi không sử dụng các đơn vị vận chuyển trung gian nhằm đảm bảo mỗi sản phẩm đến tay bạn luôn được bảo quản trong điều kiện tốt nhất và giao bởi chính đội ngũ nhân viên tận tâm của shop.
              </p>

              {/* Section 01 */}
              <section className="space-y-4 group">
                <h2 className="text-lg md:text-xl font-black text-[var(--color-text-main,#0f172a)] flex items-center gap-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-[var(--color-primary,#0f766e)] flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <Truck className="w-5 h-5" />
                  </span>
                  01. Phạm vi &amp; Chi phí vận chuyển
                </h2>
                <ul className="space-y-3.5 pl-2 text-sm text-[var(--color-text-sub,#475569)]">
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Khu vực nội thành:</strong> Miễn phí vận chuyển cho đơn hàng từ <strong>1.000.000đ</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Khu vực ngoại thành:</strong> Phí vận chuyển đồng giá <strong>30.000đ</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Đặc quyền:</strong> Khách hàng được <strong>mở hộp và lên tay thử</strong> trực tiếp cùng nhân viên trước khi quyết định nhận hàng.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Section 02 */}
              <section className="space-y-4 pt-6 border-t border-[var(--color-surface-border,#e2e8f0)] group">
                <h2 className="text-lg md:text-xl font-black text-[var(--color-text-main,#0f172a)] flex items-center gap-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  02. Quy trình giao nhận trực tiếp
                </h2>
                <ul className="space-y-3.5 pl-2 text-sm text-[var(--color-text-sub,#475569)]">
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Xác nhận đơn hàng:</strong> Hệ thống tự động ghi nhận đơn hàng ngay khi bạn hoàn tất đặt hàng trực tuyến.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Chuẩn bị &amp; Liên hệ:</strong> Nhân viên kỹ thuật kiểm tra máy, chỉnh giờ chuẩn và <strong>gọi điện báo khách hàng</strong>. Bạn có thể yêu cầu đóng gói quà hoặc chỉnh dây đeo trước khi giao.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Giao hàng tận nhà:</strong> Đội ngũ vận chuyển giao tận nơi. Bạn hoàn toàn có quyền từ chối nhận nếu sản phẩm không đúng mô tả hoặc xuất hiện tì vết.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Section 03 */}
              <section className="space-y-4 pt-6 border-t border-[var(--color-surface-border,#e2e8f0)] group">
                <h2 className="text-lg md:text-xl font-black text-[var(--color-text-main,#0f172a)] flex items-center gap-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5" />
                  </span>
                  03. Thời gian giao hàng
                </h2>
                <ul className="space-y-3.5 pl-2 text-sm text-[var(--color-text-sub,#475569)]">
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Đơn hàng buổi sáng:</strong> Giao ngay trong chiều cùng ngày.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Đơn hàng buổi tối:</strong> Giao trước 10h sáng ngày hôm sau.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Hẹn giờ giao:</strong> Bạn có thể chủ động hẹn khung giờ giao cụ thể để phù hợp nhất với lịch trình làm việc.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Ultra Impact Note Warning Alert Box */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-emerald-500/30 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-6 rounded-3xl border-2 border-emerald-300/80 space-y-2 shadow-xl">
                  <h3 className="text-base font-black text-[var(--color-primary,#0f766e)] flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-emerald-600 animate-bounce" />
                    Lưu ý quan trọng
                  </h3>
                  <p className="text-sm text-[var(--color-text-sub,#475569)] leading-relaxed font-medium">
                    Vì đây là dịch vụ giao hàng nội bộ nhằm đảm bảo an toàn cao nhất cho sản phẩm giá trị, chúng tôi phục vụ trong khu vực hỗ trợ. Quý khách vui lòng đồng kiểm sản phẩm cùng nhân viên giao hàng trước khi ký nhận.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Express Shipping Card */}
              <div className="bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#042f2e] text-white p-6 rounded-3xl shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 relative overflow-hidden group">
                <div className="relative z-10 space-y-3">
                  <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-black bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full shadow-inner text-emerald-100">
                    <Truck className="w-3.5 h-3.5 text-emerald-300" /> Dịch vụ ưu tiên
                  </span>
                  <h3 className="text-lg font-black italic tracking-wide group-hover:translate-x-1 transition-transform">Giao hàng siêu tốc</h3>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                    Nhận hàng siêu tốc trong vòng <strong>2h - 4h</strong> đối với tất cả đơn hàng khu vực nội thành!
                  </p>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
              </div>

              {/* Contact Info Card */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-md border border-[var(--color-surface-border,#e2e8f0)] space-y-4 group">
                <h4 className="font-bold text-sm text-[var(--color-text-main,#0f172a)] border-b border-slate-100 pb-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  Thông tin liên hệ
                </h4>
                <ul className="space-y-4 text-xs text-[var(--color-text-sub,#475569)]">
                  <li className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[var(--color-primary,#0f766e)] flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                      <Phone className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold text-[var(--color-primary,#0f766e)] uppercase tracking-wider">
                        Hỗ trợ khẩn cấp (24/7)
                      </span>
                      <a
                        href="tel:0123456789"
                        className="font-bold text-sm text-[var(--color-text-main,#0f172a)] hover:text-[var(--color-primary,#0f766e)] transition-colors"
                      >
                        0123.456.789
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 pt-1">
                    <MapPin className="w-4 h-4 text-[var(--color-primary,#0f766e)] mt-0.5 flex-shrink-0" />
                    <span><strong>Địa chỉ:</strong> Đồng Bào, Đan Điền, Thành phố Huế</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[var(--color-primary,#0f766e)] flex-shrink-0" />
                    <span><strong>Giờ làm việc:</strong> 08:00 - 21:00 hàng ngày</span>
                  </li>
                </ul>
              </div>

              {/* Link to FAQ Page */}
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-[var(--color-surface-border,#e2e8f0)] shadow-md hover:shadow-xl transition-shadow group">
                <h4 className="font-bold text-sm text-[var(--color-text-main,#0f172a)] mb-2 flex items-center gap-2 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <HelpCircle className="w-4 h-4 text-[var(--color-primary,#0f766e)]" /> Bạn còn thắc mắc khác?
                </h4>
                <p className="text-xs text-[var(--color-text-sub,#475569)] mb-4 leading-relaxed">
                  Tra cứu các câu hỏi thường gặp hoặc liên hệ bộ phận hỗ trợ tư vấn.
                </p>
                <Link
                  href={ROUTES.ABOUT.FAQ}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-primary,#0f766e)] hover:translate-x-2 transition-transform duration-200"
                >
                  Trang Hỏi đáp (FAQ) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}