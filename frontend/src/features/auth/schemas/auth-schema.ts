import { z } from "zod";

/**
 * Zod Schema cho Form Đăng nhập.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ email.")
    .email("Địa chỉ email không đúng định dạng.")
    .trim(),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Zod Schema cho Form Đăng ký tài khoản.
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Vui lòng nhập địa chỉ email.")
      .email("Địa chỉ email không đúng định dạng.")
      .trim(),
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
