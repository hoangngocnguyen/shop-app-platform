"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Users, CheckCircle2 } from "lucide-react";

import { useAdminUserStore } from "@/features/admin/users/stores";
import { UserTable } from "@/features/admin/users/components/UserTable";
import {
  UserFormModal,
  type UserFormValues,
} from "@/features/admin/users/components/UserFormModal";
import { UserBlockModal } from "@/features/admin/users/components/UserBlockModal";
import { UserFilterBar, type UserSortBy } from "@/features/admin/users/components/UserFilterBar";
import { toast } from "@/common/stores/useToastStore";
import {
  SortDirection,
  UserDetailResponse,
  UserRole,
  UserStatus,
} from "@/features/admin/users/types";

export default function AdminUserPage() {
  const {
    users,
    total,
    totalPages,
    isLoading,
    isSubmitting,
    fetchUsers,
    createUser,
    updateUser,
    blockUser,
    deleteUser,
  } = useAdminUserStore();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<UserSortBy>("id_desc");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState(search);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formTarget, setFormTarget] = useState<{
    mode: "create" | "edit";
    user?: UserDetailResponse;
  } | null>(null);
  const [blockTarget, setBlockTarget] = useState<UserDetailResponse | null>(null);

  useEffect(() => {
    const sortParams = {
      id_desc: { sortBy: "createdAt", sortDir: SortDirection.DESC },
      name_asc: { sortBy: "fullName", sortDir: SortDirection.ASC },
      email_asc: { sortBy: "email", sortDir: SortDirection.ASC },
    }[sortBy];

    void fetchUsers({
      page: page - 1,
      page_size: pageSize,
      search,
      role: roleFilter === "all" ? undefined : (roleFilter as UserRole),
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter.toUpperCase() as UserStatus),
      ...sortParams,
    });
  }, [
    page,
    pageSize,
    sortBy,
    search,
    roleFilter,
    statusFilter,
    fetchUsers,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== search) {
        setSearch(searchInput.trim());
        setPage(1);
        setSelected(new Set());
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, search, setSearch]);

  const safeUsers = users ?? [];
  const allSelected =
    safeUsers.length > 0 &&
    safeUsers.every((user) => selected.has(user.userId));

  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(safeUsers.map((user) => user.userId)),
    );

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const handleDelete = async (ids: string[], label: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${label}?`)) return;

    let allDeleted = true;
    for (const id of ids) {
      if (!(await deleteUser(id))) {
        allDeleted = false;
      }
    }
    setSelected(new Set());
    if (allDeleted) {
      toast.success("Đã xóa người dùng thành công");
    } else {
      toast.error("Không thể xóa một hoặc nhiều người dùng");
    }
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    const success =
      formTarget?.mode === "create"
        ? await createUser({
            fullName: values.full_name,
            email: values.email,
            phone: values.phone ?? "",
            password: values.password ?? "",
            role: values.role as UserRole,
          })
        : formTarget?.user
          ? await updateUser(formTarget.user.userId, {
              fullName: values.full_name,
              phone: values.phone ?? "",
              role: values.role as UserRole,
            })
          : false;

    if (!success) {
      toast.error("Không thể lưu thông tin người dùng");
      return;
    }

    toast.success(
      formTarget?.mode === "create"
        ? "Đã thêm người dùng mới thành công"
        : "Đã cập nhật thông tin người dùng thành công",
    );
    setFormTarget(null);
  };

  const handleConfirmBlockToggle = async () => {
    if (!blockTarget) return;

    const isCurrentlyBlocked = blockTarget.status === UserStatus.BLOCKED;
    const reason = isCurrentlyBlocked
      ? undefined
      : window.prompt("Nhập lý do khóa tài khoản")?.trim();

    if (!isCurrentlyBlocked && !reason) {
      toast.error("Vui lòng nhập lý do khóa tài khoản");
      return;
    }

    const success = await blockUser(blockTarget.userId, {
      isBlocked: !isCurrentlyBlocked,
      reason,
    });

    if (!success) {
      toast.error("Thao tác khóa/mở khóa thất bại");
      return;
    }

    toast.success(
      isCurrentlyBlocked
        ? `Đã mở khóa tài khoản ${blockTarget.email}`
        : `Đã khóa tài khoản ${blockTarget.email}`,
    );
    setBlockTarget(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-surface-bg,#f8fafc)] via-white to-[var(--color-surface-bg,#f8fafc)] text-[var(--color-text-main,#0f172a)] antialiased selection:bg-[var(--color-primary,#0f766e)] selection:text-white">
      <main className="max-w-[1240px] mx-auto px-4 py-6 md:py-10 space-y-8">
        
        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#042f2e] p-8 md:p-12 text-white shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 group transition-all duration-500 hover:shadow-[var(--color-primary,#0f766e)]/50">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-lg flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-300">
              Quản lý người dùng
            </h1>
            <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed font-normal">
              Hệ thống hiện đang quản lý tổng số <strong className="text-white font-bold">{total}</strong> tài khoản. Phân quyền và kiểm soát bảo mật hệ thống dễ dàng.
            </p>
          </div>
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute right-1/4 -top-20 w-60 h-60 bg-teal-300/30 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Action Header Bar & Nút Thêm Người Dùng */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-surface-border shadow-md">
          <div className="group/iconbox flex items-center gap-3.5 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--color-primary,#0f766e)] flex items-center justify-center shadow-inner transition-all duration-300 group-hover/iconbox:-translate-y-1.5 group-hover/iconbox:scale-110 group-hover/iconbox:bg-primary group-hover/iconbox:text-white group-hover/iconbox:shadow-md">
              <Users className="w-6 h-6 transition-transform duration-300 group-hover/iconbox:rotate-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-text-main transition-colors group-hover/iconbox:text-primary">
                Danh sách tài khoản hệ thống
              </h3>
              <p className="text-xs text-text-muted">
                Thực hiện tìm kiếm, thay đổi vai trò hoặc khóa tài khoản
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFormTarget({ mode: "create" })}
            className="group/btn relative inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-contrast shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover hover:shadow-xl active:translate-y-0 cursor-pointer"
          >
            <Plus className="size-4 transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:rotate-90" aria-hidden="true" />
            <span>Thêm người dùng mới</span>
          </button>
        </div>

        {/* Bộ lọc & Tìm kiếm */}
        <UserFilterBar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          roleFilter={roleFilter}
          onRoleChange={(v) => {
            setRoleFilter(v);
            setPage(1);
            setSelected(new Set());
          }}
          statusFilter={statusFilter}
          onStatusChange={(v) => {
            setStatusFilter(v);
            setPage(1);
            setSelected(new Set());
          }}
          sortBy={sortBy}
          onSortChange={(v) => {
            setSortBy(v);
            setPage(1);
            setSelected(new Set());
          }}
        />

        {/* Thanh thao tác hàng loạt */}
        {selected.size > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary-light px-5 py-3.5 text-sm shadow-md transition-all duration-300 animate-in fade-in zoom-in-95">
            <span className="font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Đã chọn <span className="underline decoration-2">{selected.size}</span> tài khoản
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-text-sub transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-card hover:text-text-main hover:shadow-xs cursor-pointer font-medium"
              >
                Bỏ chọn
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleDelete(
                    Array.from(selected),
                    `${selected.size} người dùng đã chọn`,
                  )
                }
                className="group/delbtn inline-flex items-center gap-1.5 rounded-xl bg-status-error px-4 py-2 font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md active:translate-y-0 cursor-pointer"
              >
                <Trash2 className="size-4 transition-transform duration-200 group-hover/delbtn:scale-110" aria-hidden="true" />
                <span>Xóa đã chọn</span>
              </button>
            </div>
          </div>
        )}

        {/* Bảng dữ liệu người dùng */}
        <UserTable
          items={safeUsers}
          isLoading={isLoading}
          search={search}
          selected={selected}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onEdit={(user: UserDetailResponse) =>
            setFormTarget({ mode: "edit", user })
          }
          onToggleBlock={(user: UserDetailResponse) => setBlockTarget(user)}
          onDelete={(user: UserDetailResponse) =>
            void handleDelete([user.userId], `tài khoản “${user.email}”`)
          }
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(p: number) => {
            setPage(p);
            setSelected(new Set());
          }}
          onPageSizeChange={(s: number) => {
            setPageSize(s);
            setPage(1);
            setSelected(new Set());
          }}
        />

        {/* Modal Thêm/Sửa */}
        {formTarget && (
          <UserFormModal
            target={formTarget}
            isSubmitting={isSubmitting}
            onSubmit={handleFormSubmit}
            onClose={() => setFormTarget(null)}
          />
        )}

        {/* Modal Khóa/Mở khóa */}
        {blockTarget && (
          <UserBlockModal
            user={blockTarget}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirmBlockToggle}
            onClose={() => setBlockTarget(null)}
          />
        )}
      </main>
    </div>
  );
}