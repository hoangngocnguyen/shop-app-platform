"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Plus,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { useProductStore } from "@/features/admin/product/stores";
import {
  ProductResponse,
  StockStatus,
  ProductCreate,
  ProductUpdate,
} from "@/features/admin/product/types";
import {
  ProductStats,
  ProductFilters,
  ProductTable,
  ProductGrid,
  ProductPagination,
  ProductModal,
  ProductDetailModal,
  DeleteConfirmModal,
} from "@/features/admin/product/components";
import { toast } from "@/common/stores/useToastStore";

export default function ProductManagementPage() {
  const {
    adminProducts,
    categories,
    isLoading,
    fetchAdminProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
  } = useProductStore();

  // Search & Filtering State
  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>("all");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("id_desc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductResponse | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productForDetail, setProductForDetail] = useState<ProductResponse | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductResponse | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load products when query parameters change
  const loadProducts = useCallback(() => {
    fetchAdminProducts({
      search: search.trim() || undefined,
      stock_status: stockStatus,
      category_id: categoryId,
      sort_by: sortBy,
      page,
      page_size: pageSize,
    });
  }, [search, stockStatus, categoryId, sortBy, page, pageSize, fetchAdminProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset page to 1 when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStockStatusChange = (status: StockStatus) => {
    setStockStatus(status);
    setPage(1);
  };

  const handleCategoryChange = (catId: number | null) => {
    setCategoryId(catId);
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStockStatus("all");
    setCategoryId(null);
    setSortBy("id_desc");
    setPage(1);
  };

  // Selection handlers
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

  // Form submit (Add or Edit)
  const handleFormSubmit = async (
    data: ProductCreate | ProductUpdate,
    file?: File | null
  ) => {
    try {
      if (productToEdit) {
        const result = await updateProduct(productToEdit.product_id, data, file);
        if (result) {
          toast.success("Cập nhật thông tin sản phẩm thành công!");
          setIsModalOpen(false);
          setProductToEdit(null);
          loadProducts();
        } else {
          toast.error("Không thể cập nhật sản phẩm. Vui lòng thử lại!");
        }
      } else {
        const result = await createProduct(data as ProductCreate, file);
        if (result) {
          toast.success("Thêm sản phẩm mới thành công!");
          setIsModalOpen(false);
          setProductToEdit(null);
          loadProducts();
        } else {
          toast.error("Không thể thêm sản phẩm. Vui lòng thử lại!");
        }
      }
    } catch {
      toast.error("Đã xảy ra lỗi trong quá trình xử lý.");
    }
  };

  // Confirm delete handler (Single or Bulk)
  const handleConfirmDelete = async () => {
    try {
      if (isBulkDelete) {
        const result = await bulkDeleteProducts({ product_ids: selectedIds });
        if (result) {
          toast.success(`Đã xóa ${result.deleted_count} sản phẩm đã chọn!`);
          setSelectedIds([]);
          setIsBulkDelete(false);
          setIsDeleteModalOpen(false);
          loadProducts();
        } else {
          toast.error("Không thể xóa các sản phẩm đã chọn.");
        }
      } else if (productToDelete) {
        const result = await deleteProduct(productToDelete.product_id);
        if (result) {
          toast.success(`Đã xóa sản phẩm "${productToDelete.product_name}"!`);
          setProductToDelete(null);
          setIsDeleteModalOpen(false);
          loadProducts();
        } else {
          toast.error("Không thể xóa sản phẩm.");
        }
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi xóa sản phẩm.");
    }
  };

  const totalCount = adminProducts?.total || 0;

  return (
    <div className="min-h-screen bg-surface-bg text-text-main pb-24">
      {/* Centered layout with generous left/right margins matching category page */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-5">
        {/* Top Header matching Example layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
              Quản lý sản phẩm
            </h1>
            <p className="text-xs sm:text-sm text-text-sub mt-1">
              {totalCount} sản phẩm. Quản lý danh mục hàng hóa, giá niêm yết và kiểm soát tồn kho theo thời gian thực.
            </p>
          </div>

          {/* Quick Header Actions: Refresh & Add Product */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => loadProducts()}
              disabled={isLoading}
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold bg-surface-card border border-surface-border rounded-xl text-text-sub hover:text-primary hover:border-primary/40 hover:bg-surface-hover shadow-2xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              title="Làm mới danh sách"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProductToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-primary text-primary-contrast rounded-xl hover:bg-primary-hover shadow-brand-sm hover:shadow-brand-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        {/* 1. Quick KPI Stats */}
        <ProductStats
          data={adminProducts}
          activeStockStatus={stockStatus}
          onSelectStockStatus={handleStockStatusChange}
        />

        {/* 2. Filters Bar: Search on left, Dropdowns on right */}
        <ProductFilters
          search={search}
          onSearchChange={handleSearchChange}
          stockStatus={stockStatus}
          onStockStatusChange={handleStockStatusChange}
          categoryId={categoryId}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
        />

        {/* 3. Main Table / Grid Content inside centered container */}
        <div className="space-y-0">
          {viewMode === "table" ? (
            <div className="bg-surface-card border border-surface-border rounded-2xl shadow-xs overflow-hidden">
              <ProductTable
                products={productsList}
                isLoading={isLoading}
                selectedIds={selectedIds}
                categories={categories}
                onToggleSelectAll={handleToggleSelectAll}
                onToggleSelectOne={handleToggleSelectOne}
                onViewDetail={(prod: ProductResponse) => {
                  setProductForDetail(prod);
                  setIsDetailModalOpen(true);
                }}
                onEdit={(prod: ProductResponse) => {
                  setProductToEdit(prod);
                  setIsModalOpen(true);
                }}
                onDelete={(prod: ProductResponse) => {
                  setIsBulkDelete(false);
                  setProductToDelete(prod);
                  setIsDeleteModalOpen(true);
                }}
                onOpenAddModal={() => {
                  setProductToEdit(null);
                  setIsModalOpen(true);
                }}
                onResetFilters={handleResetFilters}
                hasActiveFilters={Boolean(
                  search || stockStatus !== "all" || categoryId !== null || sortBy !== "id_desc"
                )}
              />

              {/* 4. Compact Pagination integrated at the bottom of Table card */}
              {adminProducts && adminProducts.total > 0 && (
                <ProductPagination
                  currentPage={adminProducts.page}
                  pageSize={adminProducts.page_size}
                  totalItems={adminProducts.total}
                  totalPages={adminProducts.total_pages}
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={handlePageSizeChange}
                  isLoading={isLoading}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <ProductGrid
                products={productsList}
                isLoading={isLoading}
                selectedIds={selectedIds}
                categories={categories}
                onToggleSelectOne={handleToggleSelectOne}
                onViewDetail={(prod: ProductResponse) => {
                  setProductForDetail(prod);
                  setIsDetailModalOpen(true);
                }}
                onEdit={(prod: ProductResponse) => {
                  setProductToEdit(prod);
                  setIsModalOpen(true);
                }}
                onDelete={(prod: ProductResponse) => {
                  setIsBulkDelete(false);
                  setProductToDelete(prod);
                  setIsDeleteModalOpen(true);
                }}
                onOpenAddModal={() => {
                  setProductToEdit(null);
                  setIsModalOpen(true);
                }}
                onResetFilters={handleResetFilters}
                hasActiveFilters={Boolean(
                  search || stockStatus !== "all" || categoryId !== null || sortBy !== "id_desc"
                )}
              />

              {adminProducts && adminProducts.total > 0 && (
                <div className="bg-surface-card border border-surface-border rounded-2xl shadow-xs overflow-hidden">
                  <ProductPagination
                    currentPage={adminProducts.page}
                    pageSize={adminProducts.page_size}
                    totalItems={adminProducts.total}
                    totalPages={adminProducts.total_pages}
                    onPageChange={(newPage) => setPage(newPage)}
                    onPageSizeChange={handlePageSizeChange}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Batch Action Bar when rows are selected */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface-card/95 border border-surface-border backdrop-blur-md px-5 py-3 rounded-2xl shadow-brand-md flex items-center gap-4 animate-in slide-in-from-bottom-6 duration-300">
            <div className="flex items-center gap-2 text-xs font-bold text-text-main">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>
                Đã chọn <strong className="text-primary">{selectedIds.length}</strong> sản phẩm
              </span>
            </div>

            <div className="h-4 w-px bg-surface-border" />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 text-xs font-semibold text-text-sub hover:text-text-main rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
              >
                Bỏ chọn
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsBulkDelete(true);
                  setIsDeleteModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-status-error text-white rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa các sản phẩm đã chọn</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. Create / Edit Product Modal */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setProductToEdit(null);
          }}
          onSubmit={handleFormSubmit}
          productToEdit={productToEdit}
          categories={categories}
        />

        {/* 6. Product Quick Detail View Modal */}
        <ProductDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setProductForDetail(null);
          }}
          product={productForDetail}
          categories={categories}
          onEdit={(prod) => {
            setProductToEdit(prod);
            setIsModalOpen(true);
          }}
        />

        {/* 7. Delete / Bulk Delete Confirm Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
            setIsBulkDelete(false);
          }}
          onConfirm={handleConfirmDelete}
          title={isBulkDelete ? "Xóa hàng loạt sản phẩm" : "Xóa sản phẩm"}
          message={
            isBulkDelete
              ? `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} sản phẩm đã chọn khỏi cơ sở dữ liệu?`
              : `Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.product_name}"?`
          }
          product={isBulkDelete ? null : productToDelete}
        />
      </div>
    </div>
  );
}
