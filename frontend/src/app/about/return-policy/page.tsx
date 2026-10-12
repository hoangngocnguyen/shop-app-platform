"use client";

import React from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import {
  Home,
  RotateCcw,
  Truck,
  Headset,
  Phone,
  ShieldCheck,
  PackageCheck,
  Clock,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function ReturnPolicyPage() {
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
            Chính sách đổi trả &amp; Bảo hành
          </span>
        </nav>

        {/* Dynamic Glowing Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#042f2e] p-8 md:p-12 mb-10 text-white shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 group transition-all duration-500 hover:shadow-[var(--color-primary,#0f766e)]/50">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-white/20 backdrop-blur-xl text-emerald-100 border border-white/30 shadow-lg tracking-wide uppercase group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4 text-emerald-300" /> An tâm mua sắm tại HoangShop
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-lg flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-300">
              <RotateCcw className="w-8 h-8 md:w-11 md:h-11 text-emerald-300 animate-spin" style={{ animationDuration: '10s' }} />
              Chính sách đổi trả &amp; Bảo hành
            </h1>
            <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed font-normal">
              Cam kết bảo vệ quyền lợi tối đa cho khách hàng. Đổi trả dễ dàng, minh bạch và hoàn toàn miễn phí nếu phát sinh lỗi từ nhà bán hàng.
            </p>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute right-1/4 -top-20 w-60 h-60 bg-teal-300/30 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Interactive Steps Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { num: "01", title: "Kiểm hàng tại chỗ", desc: "Đồng kiểm khi nhận" },
            { num: "02", title: "7 Ngày đổi trả", desc: "1 Đổi 1 lỗi NSX" },
            { num: "03", title: "Miễn phí ship", desc: "Khi sản phẩm bị lỗi" },
            { num: "04", title: "Hỗ trợ 24/7", desc: "Xử lý trong 24h" },
          ].map((step, idx) => (
            <div
              key={idx}
              className="bg-white/90 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-emerald-200/80 flex items-center gap-3.5 shadow-md hover:shadow-2xl hover:shadow-[var(--color-primary,#0f766e)]/20 hover:-translate-y-2 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer select-none group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-primary,#0f766e)] to-[#115e59] text-white flex items-center justify-center flex-shrink-0 font-black text-sm shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                {step.num}
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-bold text-[var(--color-text-main,#0f172a)] group-hover:text-[var(--color-primary,#0f766e)] transition-colors">{step.title}</h4>
                <p className="text-[11px] text-[var(--color-text-muted,#94a3b8)] mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="w-full lg:w-3/4 space-y-6">
            <div className="bg-white/95 backdrop-blur-2xl p-6 md:p-10 rounded-3xl shadow-2xl shadow-slate-200/60 border border-[var(--color-surface-border,#e2e8f0)] space-y-8">
              <p className="text-sm md:text-base text-[var(--color-text-sub,#475569)] leading-relaxed border-b border-[var(--color-surface-border,#e2e8f0)] pb-6 font-normal">
                Tại <strong className="text-[var(--color-primary,#0f766e)] font-bold">HoangShop</strong>, chúng tôi hiểu rằng sự an tâm của khách hàng là ưu tiên hàng đầu. Với đội ngũ giao hàng nội bộ chuyên nghiệp, quý khách luôn có quyền kiểm tra kỹ lưỡng trước khi nhận.
              </p>

              {/* Section 01 */}
              <section className="space-y-4 group">
                <h2 className="text-lg md:text-xl font-black text-[var(--color-text-main,#0f172a)] flex items-center gap-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-[var(--color-primary,#0f766e)] flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <PackageCheck className="w-5 h-5" />
                  </span>
                  01. Đặc quyền Kiểm hàng &amp; Trả hàng tại chỗ
                </h2>
                <ul className="space-y-3.5 pl-2 text-sm text-[var(--color-text-sub,#475569)]">
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Kiểm tra thoải mái:</strong> Khi nhân viên giao hàng đến, quý khách vui lòng mở kiện hàng kiểm tra ngoại quan (màu sắc, mẫu mã, trầy xước).
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Trả hàng ngay:</strong> Nếu phát hiện sản phẩm lỗi, sai mẫu hoặc không đúng mô tả, quý khách có quyền <strong>từ chối nhận hàng</strong> và trả lại ngay cho nhân viên giao hàng mà <strong>không mất bất kỳ chi phí nào</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Yêu cầu:</strong> Sản phẩm trả lại tại chỗ phải còn đầy đủ phụ kiện, quà tặng và hóa đơn đi kèm.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Section 02 */}
              <section className="space-y-4 pt-6 border-t border-[var(--color-surface-border,#e2e8f0)] group">
                <h2 className="text-lg md:text-xl font-black text-[var(--color-text-main,#0f172a)] flex items-center gap-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5" />
                  </span>
                  02. Quy định đổi trả sau khi đã nhận (trong 7 ngày)
                </h2>
                <ul className="space-y-3.5 pl-2 text-sm text-[var(--color-text-sub,#475569)]">
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Lỗi kỹ thuật:</strong> Hỗ trợ 1-đổi-1 miễn phí nếu sản phẩm phát sinh lỗi từ nhà sản xuất (đối với đồ điện tử, đồng hồ, máy móc).
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Điều kiện:</strong> Sản phẩm còn nguyên tem mác, seal niêm phong (nếu có) và chưa có dấu hiệu can thiệp vật lý hoặc sử dụng sai cách.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Đổi mẫu:</strong> Hỗ trợ đổi sang mẫu khác có giá trị tương đương hoặc cao hơn (khách hàng thanh toán phần chênh lệch và phí vận chuyển phát sinh).
                    </span>
                  </li>
                </ul>
              </section>

              {/* Section 03 - High Impact Warning Alert Card */}
              <section className="space-y-4 pt-6 border-t border-[var(--color-surface-border,#e2e8f0)] group">
                <h2 className="text-lg md:text-xl font-black text-rose-600 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-5 h-5 animate-bounce" />
                  </span>
                  03. Các trường hợp từ chối đổi trả
                </h2>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-rose-500/30 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-300"></div>
                  <ul className="relative space-y-3.5 p-5 bg-rose-50/90 rounded-2xl border-2 border-rose-200/80 shadow-lg text-sm text-rose-950">
                    <li className="flex items-start gap-3 bg-white/90 p-3.5 rounded-xl border border-rose-100 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1.5 flex-shrink-0 ring-4 ring-rose-200 animate-pulse" />
                      <span>Sản phẩm hư hỏng do tác động ngoại lực sau khi khách hàng đã ký xác nhận nhận hàng (rơi vỡ, thấm nước, cháy nổ).</span>
                    </li>
                    <li className="flex items-start gap-3 bg-white/90 p-3.5 rounded-xl border border-rose-100 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1.5 flex-shrink-0 ring-4 ring-rose-200 animate-pulse" />
                      <span>Các mặt hàng thuộc danh mục hạn chế (quà tặng khuyến mãi, hàng thanh lý bỏ mẫu).</span>
                    </li>
                    <li className="flex items-start gap-3 bg-white/90 p-3.5 rounded-xl border border-rose-100 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1.5 flex-shrink-0 ring-4 ring-rose-200 animate-pulse" />
                      <span>Quá thời hạn 07 ngày kể từ ngày hiển thị trên hóa đơn giao hàng.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Shipping Fee Box */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-300/80 space-y-3 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-base font-extrabold text-[var(--color-primary,#0f766e)] flex items-center gap-2.5">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  Chi phí vận chuyển đổi trả
                </h3>
                <div className="text-sm text-[var(--color-text-sub,#475569)] leading-relaxed space-y-1.5">
                  <p>
                    • <strong>Lỗi từ shop (giao sai, sản phẩm lỗi):</strong> <span className="text-[var(--color-primary,#0f766e)] font-black underline underline-offset-4">Miễn phí 100%</span> phí ship 2 chiều.
                  </p>
                  <p>
                    • <strong>Theo nhu cầu cá nhân của khách hàng:</strong> Quý khách vui lòng thanh toán phí ship theo biểu giá của đơn vị vận chuyển.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Premium Contact Support Card */}
              <div className="bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#0f766e] text-white p-6 rounded-3xl shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                  <h3 className="font-extrabold flex items-center gap-2 text-sm uppercase tracking-wider text-emerald-100 group-hover:translate-x-1 transition-transform">
                    <Headset className="w-4 h-4 text-emerald-200" /> Cần hỗ trợ ngay?
                  </h3>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                    Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ giải đáp mọi thắc mắc của bạn 24/7.
                  </p>
                  
                  <a
                    href="tel:0123456789"
                    className="flex items-center justify-center gap-2.5 w-full bg-white text-[var(--color-primary,#0f766e)] py-3.5 rounded-2xl font-black hover:bg-emerald-50 hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-all duration-300 text-sm shadow-lg select-none"
                  >
                    <Phone className="w-4 h-4" /> 0123 456 789
                  </a>
                </div>
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
              </div>

              {/* Special Promotion Animated Box */}
              <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 p-6 rounded-3xl text-white shadow-2xl shadow-emerald-700/30 border border-white/20 relative overflow-hidden group hover:scale-[1.03] transition-transform duration-300">
                <div className="relative z-10 space-y-3">
                  <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-black bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full shadow-inner text-emerald-100">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" style={{ animationDuration: '6s' }} /> Ưu đãi năm 2026
                  </span>
                  <p className="text-sm font-medium leading-relaxed">
                    Đặc quyền mua sắm Tết: Gia hạn thời gian đổi trả sản phẩm lên đến <strong className="text-emerald-200 text-base font-black">15 ngày</strong>!
                  </p>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              </div>

              {/* Link to FAQ Page */}
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-[var(--color-surface-border,#e2e8f0)] shadow-md hover:shadow-xl transition-shadow group">
                <h4 className="font-bold text-sm text-[var(--color-text-main,#0f172a)] mb-2 flex items-center gap-2 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <HelpCircle className="w-4 h-4 text-[var(--color-primary,#0f766e)]" /> Bạn còn câu hỏi khác?
                </h4>
                <p className="text-xs text-[var(--color-text-sub,#475569)] mb-4 leading-relaxed">
                  Xem ngay danh sách giải đáp các thắc mắc thường gặp tại trung tâm trợ giúp.
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