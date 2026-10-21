/**
 * Hàm format giá tiền dùng chung cho toàn bộ dự án (chuẩn VNĐ).
 * Nhận giá trị kiểu number, string, null hoặc undefined.
 *
 * @param price - Số tiền cần định dạng (VD: 2500000 hoặc "2500000")
 * @returns Chuỗi hiển thị chuẩn tiền tệ Việt Nam (VD: "2.500.000 ₫")
 */
export const formatPrice = (
  price: number | string | null | undefined
): string => {
  if (price === null || price === undefined) return "0 ₫";

  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return "0 ₫";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

export default formatPrice;

