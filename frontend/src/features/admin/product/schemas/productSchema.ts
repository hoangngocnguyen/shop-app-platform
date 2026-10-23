import { z } from "zod";

export const productSchema = z
  .object({
    product_name: z
      .string()
      .min(2, "Tên sản phẩm phải có ít nhất 2 ký tự")
      .max(255, "Tên sản phẩm tối đa 255 ký tự"),
    category_id: z.coerce
      .number()
      .min(1, "Vui lòng chọn danh mục hợp lệ"),
    price: z.coerce
      .number()
      .min(1000, "Giá niêm yết tối thiểu là 1.000 đ"),
    sale_price: z.coerce
      .number()
      .min(0, "Giá khuyến mãi không được âm")
      .nullable()
      .optional(),
    quantity: z.coerce
      .number()
      .int("Số lượng phải là số nguyên")
      .min(0, "Số lượng không được âm"),
    brand: z.string().max(100, "Tên thương hiệu tối đa 100 ký tự").nullable().optional(),
    origin: z.string().max(100, "Xuất xứ tối đa 100 ký tự").nullable().optional(),
    description: z
      .string()
      .max(3000, "Mô tả tối đa 3.000 ký tự")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (
        data.sale_price !== null &&
        data.sale_price !== undefined &&
        data.sale_price > 0 &&
        data.price > 0
      ) {
        return data.sale_price < data.price;
      }
      return true;
    },
    {
      message: "Giá khuyến mãi phải nhỏ hơn giá niêm yết",
      path: ["sale_price"],
    }
  );

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormOutput = z.output<typeof productSchema>;
export type ProductFormValues = ProductFormOutput;
