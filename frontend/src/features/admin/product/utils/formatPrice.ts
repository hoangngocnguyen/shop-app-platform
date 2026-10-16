export const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return "0 đ";
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return "0 đ";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(numericPrice);
};