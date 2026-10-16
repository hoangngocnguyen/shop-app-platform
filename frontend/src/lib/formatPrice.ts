/**
 * Định dạng giá tiền VNĐ (ví dụ: 12,900,000đ)
 */
export const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return "0đ";
    const num = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(num)) return "0đ";
    return new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 0,
    }).format(num) + "đ";
};
