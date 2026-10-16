"use client";

import React from "react";
import { Edit, Trash2, PackageOpen } from "lucide-react";
import { ProductResponse } from "../types";
import { formatPrice } from "../utils/formatPrice";

interface ProductTableProps {
  products: ProductResponse[];
  isLoading: boolean;
  selectedIds: number[];
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: number) => void;
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onEdit,
  onDelete,
}) => {
  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  return (
    <div className="bg-(--color-surface-card) border border-(--color-surface-border) rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-(--color-surface-bg) border-b border-(--color-surface-border) text-xs font-semibold text-(--color-text-sub) uppercase tracking-wider">
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-(--color-surface-border) text-(--color-primary) focus:ring-(--color-ring-brand) cursor-pointer"
                />
              </th>
              <th className="p-4">Sản phẩm</th>
              <th className="p-4">Thương hiệu / Xuất xứ</th>
              <th className="p-4">Giá gốc / Khuyến mãi</th>
              <th className="p-4">Tồn kho</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-surface-border) text-sm text-(--color-text-main)">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-(--color-text-muted)">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-(--color-text-muted)">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PackageOpen className="w-10 h-10 text-(--color-text-disabled)" />
                    <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isSelected = selectedIds.includes(product.product_id);
                return (
                  <tr
                    key={product.product_id}
                    className="hover:bg-(--color-surface-hover) transition-colors"
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectOne(product.product_id)}
                        className="rounded border-(--color-surface-border) text-(--color-primary) focus:ring-(--color-ring-brand) cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-(--color-surface-bg) border border-(--color-surface-border) overflow-hidden shrink-0">
                          {product.image_src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_src}
                              alt={product.product_name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-(--color-text-muted)">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-(--color-text-main) line-clamp-1">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-(--color-text-muted)">ID: #{product.product_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-(--color-text-sub)">{product.brand || "—"}</p>
                      <p className="text-xs text-(--color-text-muted)">{product.origin || "—"}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-(--color-text-main)">
                        {formatPrice(product.price)}
                      </p>
                      {product.sale_price !== null && product.sale_price !== undefined && (
                        <p className="text-xs text-(--color-status-success) font-medium">
                          Sale: {formatPrice(product.sale_price)}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          product.quantity === 0
                            ? "bg-(--color-status-error-bg) text-(--color-status-error)"
                            : product.quantity <= 5
                            ? "bg-(--color-status-warning-bg) text-(--color-status-warning)"
                            : "bg-(--color-status-success-bg) text-(--color-status-success)"
                        }`}
                      >
                        {product.quantity === 0
                          ? "Hết hàng"
                          : product.quantity <= 5
                          ? `Sắp hết (${product.quantity})`
                          : `Còn hàng (${product.quantity})`}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-(--color-text-sub) hover:text-(--color-primary) hover:bg-(--color-primary-light) rounded-lg transition-all cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          className="p-1.5 text-(--color-text-sub) hover:text-(--color-status-error) hover:bg-(--color-status-error-bg) rounded-lg transition-all cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};