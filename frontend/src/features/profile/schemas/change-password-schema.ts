import { z } from "zod";

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    new_password: z
      .string()
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự.")
      .max(64, "Mật khẩu mới không được vượt quá 64 ký tự."),
    confirm_password: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    message: "Mật khẩu xác nhận không trùng khớp.",
    path: ["confirm_password"],
  })
  .refine((values) => values.new_password !== values.current_password, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
    path: ["new_password"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
