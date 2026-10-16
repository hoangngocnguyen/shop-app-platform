import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroBannerProps {
    onExploreClick?: () => void;
}

export default function HeroBanner({ onExploreClick }: HeroBannerProps) {
    const handleScrollToProducts = () => {
        if (onExploreClick) {
            onExploreClick();
        } else {
            const productSection = document.getElementById("product-grid-section");
            if (productSection) {
                productSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003b66] via-[#004e64] to-[#006d77] text-white p-6 sm:p-10 lg:p-12 shadow-brand-md mb-8">
            {/* Background blur accents */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                
                {/* Cột trái: Văn bản & Nút kêu gọi */}
                <div className="max-w-xl text-center md:text-left space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-teal-200">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ưu đãi công nghệ độc quyền</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                        Trải nghiệm công nghệ & sách tuyệt đỉnh
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg">
                        Khám phá ngay các dòng sản phẩm iPhone, Laptop và sách chọn lọc với ưu đãi cực sốc dành riêng cho bạn.
                    </p>

                    <div className="pt-2">
                        <button
                            onClick={handleScrollToProducts}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-[#003b66] text-xs sm:text-sm font-bold shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                        >
                            <span>Khám phá ngay</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Cột phải: Khung giới thiệu nổi bật (Hero Card) */}
                <div className="w-full md:w-auto flex justify-center">
                    <div className="group relative bg-white/95 rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/20 w-52 sm:w-64 flex flex-col items-center text-center transition-all duration-300 hover:rotate-1 hover:scale-105">
                        
                        {/* Logo đối tác */}
                        <div className="flex items-center justify-between w-full pb-3 border-b border-slate-100 text-[10px] text-slate-500 font-semibold">
                            <span className="font-mono text-xs font-black tracking-tighter text-slate-800">SHOPDUNK</span>
                            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">Authorized Reseller</span>
                        </div>

                        {/* Hình ảnh thiết bị */}
                        <div className="w-32 h-44 sm:w-40 sm:h-52 my-3 relative flex items-center justify-center">
                            <img
                                src="https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg"
                                alt="Sản phẩm nổi bật"
                                className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                    // Fallback nếu link demo lỗi
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80";
                                }}
                            />
                        </div>

                        <span className="text-xs font-extrabold text-[#002b49] tracking-tight">
                            Apple iPhone Series
                        </span>
                        <span className="text-[11px] text-emerald-600 font-bold mt-0.5">
                            Giá tốt từ 12.900.000đ
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
