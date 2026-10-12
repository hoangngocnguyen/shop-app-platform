"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import {
  Search,
  Home,
  ChevronDown,
  Headset,
  Phone,
  MessageSquare,
  Clock,
  Store,
  Truck,
  ShieldCheck,
  RotateCcw,
  HelpCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface FAQItem {
  id: number;
  category: "order" | "shipping" | "warranty";
  question: string;
  answer: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    category: "order",
    question: "Làm sao để tôi biết đã đặt hàng thành công?",
    answer: [
      "Sau khi bạn nhấn nút **Đặt hàng**, hệ thống sẽ gửi một **Email xác nhận** tự động vào hòm thư của bạn.",
      "Đồng thời, trong vòng 30 phút (giờ hành chính), nhân viên HoangShop sẽ **gọi điện trực tiếp** để xác nhận thông tin giao hàng.",
    ],
  },
  {
    id: 2,
    category: "shipping",
    question: "Quy trình nhận hàng diễn ra như thế nào?",
    answer: [
      "1. Nhân viên shop gọi báo trước khi giao 15 - 30 phút.",
      "2. Bạn nhận hàng và **được quyền mở hộp kiểm tra** sản phẩm tại chỗ.",
      "3. Nếu hài lòng, bạn ký xác nhận và thanh toán (nếu chọn thanh toán khi nhận hàng COD).",
      "4. Nhân viên sẽ kích hoạt bảo hành điện tử ngay sau đó.",
    ],
  },
  {
    id: 3,
    category: "shipping",
    question: "Tôi có thể yêu cầu giao hàng vào giờ cụ thể không?",
    answer: [
      "Hoàn toàn được! Vì chúng tôi sử dụng **đội ngũ giao hàng nội bộ**, bạn có thể thỏa thuận trực tiếp với nhân viên xác nhận đơn hàng về khung giờ bạn có mặt tại nhà *(Ví dụ: Sau 18h hoặc chiều Thứ 7)*.",
    ],
  },
  {
    id: 4,
    category: "warranty",
    question: "Shop bán đa dạng mặt hàng, bảo hành có khác nhau không?",
    answer: [
      "Tất cả sản phẩm chính hãng tại HoangShop đều tuân thủ chính sách bảo hành của nhà sản xuất.",
      "Ngoài ra, chúng tôi còn tặng thêm gói **Bảo trì miễn phí** tại cửa hàng đối với các sản phẩm gia dụng và điện tử.",
    ],
  },
  {
    id: 5,
    category: "order",
    question: "Tôi có thể hủy hoặc thay đổi thông tin đơn hàng sau khi đặt không?",
    answer: [
      "Bạn có thể hủy hoặc chỉnh sửa đơn hàng bằng cách gọi trực tiếp đến **Hotline 0123 456 789** trước khi đơn hàng chuyển sang trạng thái *'Đang giao'*. Hoặc truy cập mục **Quản lý đơn hàng** trong tài khoản cá nhân.",
    ],
  },
  {
    id: 6,
    category: "warranty",
    question: "Chính sách 1 đổi 1 trong vòng 7 ngày áp dụng ra sao?",
    answer: [
      "Sản phẩm áp dụng đổi trả 1 đổi 1 nếu phát sinh **lỗi từ nhà sản xuất** trong vòng 7 ngày đầu tiên kể từ khi nhận hàng.",
      "Sản phẩm đổi trả cần giữ nguyên tem mác, hộp đựng và phụ kiện đi kèm.",
    ],
  },
];

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-bold text-[var(--color-text-main,#0f172a)]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={index} className="italic text-[var(--color-text-sub,#475569)]">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      })}
    </span>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openId, setOpenId] = useState<number | null>(1);

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
      const query = searchQuery.toLowerCase();
      const matchSearch =
        item.question.toLowerCase().includes(query) ||
        item.answer.some((line) => line.toLowerCase().includes(query));
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleAccordion = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-surface-bg,#f8fafc)] via-white to-[var(--color-surface-bg,#f8fafc)] text-[var(--color-text-main,#0f172a)] antialiased selection:bg-[var(--color-primary,#0f766e)] selection:text-white">
      <main className="max-w-[1240px] mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 mb-6 text-sm text-[var(--color-text-muted,#94a3b8)]">
          <Link
            href={ROUTES.HOME}
            className="hover:text-[var(--color-primary,#0f766e)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 font-medium"
          >
            <Home className="w-4 h-4" /> Trang chủ
          </Link>
          <span className="text-[var(--color-surface-border,#e2e8f0)]">/</span>
          <span className="text-[var(--color-primary,#0f766e)] font-bold">
            Hỏi đáp &amp; Hướng dẫn
          </span>
        </nav>

        {/* Dynamic Glowing Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#042f2e] p-8 md:p-12 mb-10 text-white shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 group transition-all duration-500 hover:shadow-[var(--color-primary,#0f766e)]/50">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-white/20 backdrop-blur-xl text-emerald-100 border border-white/30 shadow-lg tracking-wide uppercase group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '6s' }} /> Trung tâm hỗ trợ HoangShop
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-lg group-hover:translate-x-1.5 transition-transform duration-300">
              Chúng tôi có thể giúp gì cho bạn?
            </h1>
            <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed font-normal">
              Tra cứu nhanh câu hỏi thường gặp về đơn hàng, chính sách đổi trả, bảo hành và dịch vụ giao hàng.
            </p>

            {/* Ultra Glowing Search Box */}
            <div className="relative pt-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-80 transition duration-500"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-4 text-[var(--color-text-muted,#94a3b8)] w-5 h-5 transition-colors group-focus-within:text-[var(--color-primary,#0f766e)] z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm (ví dụ: đổi trả, bảo hành, thanh toán...)"
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-2xl text-[var(--color-text-main,#0f172a)] placeholder-[var(--color-text-muted,#94a3b8)] rounded-2xl shadow-2xl border border-white focus:outline-none transition-all duration-300 text-sm md:text-base focus:bg-white focus:ring-4 focus:ring-emerald-400/50"
                />
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute right-1/4 -top-20 w-60 h-60 bg-teal-300/30 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Feature Cards - Floating 3D */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { title: "Giao siêu tốc", desc: "Nội thành trong 2H", icon: Truck, bg: "bg-[var(--color-primary-light,#ecfdf5)]", text: "text-[var(--color-primary,#0f766e)]", border: "border-emerald-200" },
            { title: "Chính hãng 100%", desc: "Bảo hành điện tử", icon: ShieldCheck, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
            { title: "Đổi trả 7 ngày", desc: "Lỗi là đổi mới", icon: RotateCcw, bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
            { title: "Hỗ trợ 24/7", desc: "Tư vấn tận tâm", icon: Headset, bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className={`bg-white/90 backdrop-blur-md p-4 md:p-5 rounded-2xl border ${item.border} flex items-center gap-3.5 shadow-md hover:shadow-2xl hover:shadow-[var(--color-primary,#0f766e)]/20 hover:-translate-y-2 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer select-none group`}
              >
                <div className={`w-11 h-11 rounded-xl ${item.bg} ${item.text} flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-extrabold text-[var(--color-text-main,#0f172a)] group-hover:text-[var(--color-primary,#0f766e)] transition-colors">{item.title}</h4>
                  <p className="text-[11px] text-[var(--color-text-muted,#94a3b8)] mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Left Content */}
          <div className="w-full lg:w-3/4 space-y-6">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: "all", label: "Tất cả câu hỏi", icon: Sparkles },
                { id: "order", label: "Đơn hàng", icon: ShoppingBag },
                { id: "shipping", label: "Vận chuyển", icon: Truck },
                { id: "warranty", label: "Bảo hành & Đổi trả", icon: ShieldCheck },
              ].map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 cursor-pointer select-none active:scale-95 ${
                      isActive
                        ? "bg-gradient-to-r from-[var(--color-primary,#0f766e)] to-[#115e59] text-white border-transparent shadow-xl shadow-[var(--color-primary,#0f766e)]/30 scale-105"
                        : "border-[var(--color-surface-border,#e2e8f0)] bg-white text-[var(--color-text-sub,#475569)] hover:bg-[var(--color-surface-hover,#f1f5f9)] hover:shadow-lg hover:-translate-y-1"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? "text-emerald-200 animate-pulse" : "text-[var(--color-text-muted,#94a3b8)]"}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Accordion Card Container */}
            <div className="bg-white/95 backdrop-blur-2xl p-6 md:p-8 rounded-3xl shadow-2xl shadow-slate-200/60 border border-[var(--color-surface-border,#e2e8f0)]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-surface-border,#e2e8f0)]">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[var(--color-text-main,#0f172a)] tracking-tight hover:translate-x-1.5 transition-transform">
                    Danh sách câu hỏi
                  </h2>
                  <p className="text-xs md:text-sm text-[var(--color-text-muted,#94a3b8)] mt-0.5">
                    Nhấp vào câu hỏi để xem chi tiết câu trả lời
                  </p>
                </div>
                <span className="text-xs font-black px-4 py-1.5 bg-emerald-500/10 text-[var(--color-primary,#0f766e)] rounded-full border border-[var(--color-primary,#0f766e)]/30 shadow-md hover:scale-105 transition-transform">
                  {filteredFaqs.length} câu hỏi
                </span>
              </div>

              {/* Accordion Items */}
              <div className="space-y-4">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 bg-slate-100 text-[var(--color-text-muted,#94a3b8)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-[var(--color-text-main,#0f172a)] text-base mb-1">
                      Không tìm thấy câu hỏi phù hợp
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted,#94a3b8)]">
                      Vui lòng thử tìm kiếm với từ khóa khác hoặc gọi trực tiếp Hotline để nhận hỗ trợ.
                    </p>
                  </div>
                ) : (
                  filteredFaqs.map((item) => {
                    const isOpen = openId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`group rounded-2xl transition-all duration-300 ${
                          isOpen
                            ? "bg-gradient-to-r from-[var(--color-primary,#0f766e)]/10 to-teal-500/10 border-2 border-[var(--color-primary,#0f766e)] shadow-2xl shadow-[var(--color-primary,#0f766e)]/15 ring-4 ring-[var(--color-primary,#0f766e)]/10"
                            : "bg-white border border-[var(--color-surface-border,#e2e8f0)] hover:border-[var(--color-primary,#0f766e)]/50 hover:shadow-xl hover:-translate-y-1"
                        }`}
                      >
                        <button
                          onClick={() => toggleAccordion(item.id)}
                          className="w-full flex justify-between items-center p-4 md:p-5 text-left select-none cursor-pointer active:scale-[0.99] transition-transform"
                        >
                          <span className="font-bold text-[var(--color-text-main,#0f172a)] text-sm md:text-base pr-4 flex items-center gap-3 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "bg-[var(--color-primary,#0f766e)] text-white shadow-lg scale-110" : "bg-slate-100 text-[var(--color-text-muted,#94a3b8)] group-hover:bg-emerald-100 group-hover:text-[var(--color-primary,#0f766e)]"}`}>
                              <HelpCircle className="w-4 h-4" />
                            </span>
                            {item.question}
                          </span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "bg-[var(--color-primary,#0f766e)] text-white shadow-lg rotate-180" : "bg-slate-100 text-[var(--color-text-muted,#94a3b8)] group-hover:bg-emerald-200"}`}>
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 pt-2 text-sm text-[var(--color-text-sub,#475569)] leading-relaxed space-y-2.5 border-t border-[var(--color-primary,#0f766e)]/15 animate-in fade-in duration-300">
                            {item.answer.map((line, idx) => (
                              <p key={idx} className="bg-white/90 p-3.5 rounded-xl border border-emerald-200/80 shadow-sm">
                                <FormattedText text={line} />
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Premium Contact Card */}
              <div className="bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#0f766e] text-white p-6 rounded-3xl shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                  <h3 className="font-extrabold flex items-center gap-2 text-sm uppercase tracking-wider text-emerald-100 group-hover:translate-x-1 transition-transform">
                    <Headset className="w-4 h-4 text-emerald-200" /> Cần hỗ trợ riêng?
                  </h3>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                    Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ giải đáp mọi thắc mắc của bạn qua Hotline hoặc Zalo.
                  </p>
                  
                  <a
                    href="tel:0123456789"
                    className="flex items-center justify-center gap-2.5 w-full bg-white text-[var(--color-primary,#0f766e)] py-3.5 rounded-2xl font-black hover:bg-emerald-50 hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-all duration-300 text-sm shadow-lg select-none"
                  >
                    <Phone className="w-4 h-4" /> 0123 456 789
                  </a>
                  
                  <a
                    href="https://zalo.me"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full bg-emerald-950/50 text-white border border-white/30 py-3 rounded-2xl font-bold hover:bg-white/20 hover:scale-[1.03] active:scale-95 transition-all duration-300 text-sm select-none"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat Zalo CSKH
                  </a>
                </div>
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
              </div>

              {/* Working Hours Widget */}
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-[var(--color-surface-border,#e2e8f0)] shadow-md hover:shadow-xl transition-shadow group">
                <h4 className="font-bold text-sm text-[var(--color-text-main,#0f172a)] mb-3 flex items-center gap-2 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <Clock className="w-4 h-4 text-[var(--color-primary,#0f766e)]" /> Thời gian làm việc
                </h4>
                <ul className="text-xs space-y-2.5 text-[var(--color-text-sub,#475569)]">
                  <li className="flex justify-between pb-2 border-b border-slate-100">
                    <span>Thứ 2 - Thứ 6:</span>
                    <span className="font-bold text-[var(--color-text-main,#0f172a)]">8:00 - 21:00</span>
                  </li>
                  <li className="flex justify-between pb-2 border-b border-slate-100">
                    <span>Thứ 7 - Chủ Nhật:</span>
                    <span className="font-bold text-[var(--color-text-main,#0f172a)]">8:30 - 20:30</span>
                  </li>
                  <li className="flex justify-between text-emerald-600 font-bold pt-1">
                    <span>Trạng thái:</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      Đang hoạt động
                    </span>
                  </li>
                </ul>
              </div>

              {/* Store Link Widget */}
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-[var(--color-surface-border,#e2e8f0)] shadow-md hover:shadow-xl transition-shadow group">
                <h4 className="font-bold text-sm text-[var(--color-text-main,#0f172a)] mb-2 flex items-center gap-2 group-hover:text-[var(--color-primary,#0f766e)] transition-colors">
                  <Store className="w-4 h-4 text-[var(--color-primary,#0f766e)]" /> Ghé thăm cửa hàng
                </h4>
                <p className="text-xs text-[var(--color-text-sub,#475569)] mb-4 leading-relaxed">
                  Trải nghiệm trực tiếp và dùng thử sản phẩm tại showroom HoangShop gần nhất.
                </p>
                <Link
                  href={ROUTES.STORES}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-primary,#0f766e)] hover:translate-x-2 transition-transform duration-200"
                >
                  Xem hệ thống cửa hàng <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}