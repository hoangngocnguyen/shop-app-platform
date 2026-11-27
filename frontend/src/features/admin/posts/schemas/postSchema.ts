import { z } from "zod";
import { PostStatus } from "../types";

const optionalHttpUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "URL ảnh phải bắt đầu bằng http:// hoặc https://");

export const postFormSchema = z.object({
  title: z.string().trim().min(5, "Tiêu đề cần có ít nhất 5 ký tự").max(255, "Tiêu đề tối đa 255 ký tự"),
  slug: z.string().trim().min(1, "Vui lòng nhập slug").max(255, "Slug tối đa 255 ký tự").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  summary: z.string().max(500, "Sapo tối đa 500 ký tự").optional().nullable(),
  content: z.string().trim().min(1, "Vui lòng nhập nội dung bài viết"),
  thumbnail_url: optionalHttpUrl,
  topic_id: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      return Number.isInteger(num) && num > 0 ? num : null;
    }),
  status: z.nativeEnum(PostStatus),
});

export type PostFormInput = z.input<typeof postFormSchema>;
export type PostFormValues = z.output<typeof postFormSchema>;
