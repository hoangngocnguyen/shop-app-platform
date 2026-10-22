import { z } from "zod";

/**
 * Zod Schema cho Form Thêm/Sửa Địa chỉ giao hàng.
 * Tách riêng biệt theo quy chuẩn Feature-Driven (Step 1: types & schemas).
 */
export const addressSchema = z.object({
    recipient_name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    phone: z
        .string()
        .min(10, "Số điện thoại không hợp lệ")
        .max(11, "Số điện thoại không hợp lệ")
        .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không đúng định dạng"),
    province_code: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
    ward_code: z.string().min(1, "Vui lòng chọn Phường/Xã"),
    address_line: z.string().min(5, "Địa chỉ chi tiết phải từ 5 ký tự trở lên"),
    is_default: z.boolean().default(false),
});

export type AddressFormInput = z.input<typeof addressSchema>;
export type AddressFormOutput = z.output<typeof addressSchema>;
