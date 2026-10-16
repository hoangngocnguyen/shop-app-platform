"use client";

import React, { useEffect, useState } from "react";
import { useProductStore } from "@/features/admin/product/stores"; 
import { ProductResponse, StockStatus, ProductCreate, ProductUpdate } from "@/features/admin/product/types"; 
import { ProductStats } from "@/features/admin/product/components/ProductStats";
import { ProductFilters } from "@/features/admin/product/components/ProductFilters";
import { ProductTable } from "@/features/admin/product/components/ProductTable";
import { ProductModal } from "@/features/admin/product/components/ProductModal";
import { DeleteConfirmModal } from "@/features/admin/product/components/DeleteConfirmModal";

export default function ProductManagementPage() {
  const {
    adminProducts,
    isLoading,
    fetchAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
  } = useProductStore();

  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>("all");
  const [sortBy, setSortBy] = useState<string>("id_desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductResponse | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductResponse | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  useEffect(() => {
    fetchAdminProducts({
      search: search || undefined,
      stock_status: stockStatus,
      sort_by: sortBy,
      page: 1,
      page_size: 10,
    });
  }, [search, stockStatus, sortBy, fetchAdminProducts]);

  const productsList = adminProducts?.items || [];

  const handleToggleSelectAll = () => {
    if (selectedIds.length === productsList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(productsList.map((p) => p.product_id));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFormSubmit = async (data: ProductCreate | ProductUpdate) => {
    if (productToEdit) {
      await updateProduct(productToEdit.product_id, data);
    } else {
      await createProduct(data as ProductCreate);
    }
    setIsModalOpen(false);
    setProductToEdit(null);
    fetchAdminProducts();
  };

  const handleConfirmDelete = async () => {
    if (isBulkDelete) {
      await bulkDeleteProducts({ product_ids: selectedIds });
      setSelectedIds([]);
      setIsBulkDelete(false);
    } else if (productToDelete) {
      await deleteProduct(productToDelete.product_id);
      setProductToDelete(null);
    }
    setIsDeleteModalOpen(false);
    fetchAdminProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-(--color-text-main)">Quản lý sản phẩm</h1>
        <p className="text-sm text-(--color-text-sub) mt-1">
          Quản lý danh sách sản phẩm, tồn kho, giá và thông tin chi tiết của cửa hàng.
        </p>
      </div>

      <ProductStats data={adminProducts} />

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        stockStatus={stockStatus}
        onStockStatusChange={setStockStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedCount={selectedIds.length}
        onOpenAddModal={() => {
          setProductToEdit(null);
          setIsModalOpen(true);
        }}
        onBulkDelete={() => {
          setIsBulkDelete(true);
          setIsDeleteModalOpen(true);
        }}
      />

      <ProductTable
        products={productsList}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectOne={handleToggleSelectOne}
        onEdit={(prod: ProductResponse) => {
          setProductToEdit(prod);
          setIsModalOpen(true);
        }}
        onDelete={(prod: ProductResponse) => {
          setIsBulkDelete(false);
          setProductToDelete(prod);
          setIsDeleteModalOpen(true);
        }}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        productToEdit={productToEdit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
          setIsBulkDelete(false);
        }}
        onConfirm={handleConfirmDelete}
        title={isBulkDelete ? "Xóa các sản phẩm đã chọn" : "Xóa sản phẩm"}
        message={
          isBulkDelete
            ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn? Hành động này không thể hoàn tác.`
            : `Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.product_name}"?`
        }
      />
    </div>
  );
}