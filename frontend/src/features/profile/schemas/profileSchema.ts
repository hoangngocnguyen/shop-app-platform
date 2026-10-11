import { z } from "zod";

export const profileSchema = z.object({
    name: z
        .string()
        .min(2, "Họ và tên phải có ít nhất 2 ký tự")
        .max(50, "Họ và tên không được vượt quá 50 ký tự")
        .or(z.literal(""))
        .transform((val) => (val === "" ? null : val)),
    username: z
        .string()
        .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
        .regex(/^[a-zA-Z0-9_.-]+$/, "Username chỉ chứa chữ cái, số, dấu gạch dưới, gạch ngang và chấm")
        .or(z.literal(""))
        .transform((val) => (val === "" ? null : val)),
    phone: z
        .string()
        .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không đúng định dạng Việt Nam")
        .or(z.literal(""))
        .transform((val) => (val === "" ? null : val)),
    date_of_birth: z
        .string()
        .refine((val) => !val || new Date(val) <= new Date(), {
            message: "Ngày sinh không thể là ngày trong tương lai",
        })
        .or(z.literal(""))
        .transform((val) => (val === "" ? null : val)),
});

// Type cho các trường trong Form React (Toàn bộ là string)
export type ProfileFormInput = z.input<typeof profileSchema>;

// Type cho dữ liệu đầu ra gửi đi API (Đã transform thành null)
export type ProfileFormOutput = z.output<typeof profileSchema>;