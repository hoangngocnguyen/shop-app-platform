"use client";

import { Archive, ArrowLeft, ArrowRight, FileText, Pencil, Send, Trash2, Undo2 } from "lucide-react";
import { PostStatus, type AdminPostListItemResponse } from "../types";

const STATUS_META = {
  [PostStatus.DRAFT]: { label: "Bản nháp", style: "bg-surface-hover text-text-sub border-surface-border", dot: "bg-text-muted" },
  [PostStatus.PENDING]: { label: "Chờ duyệt", style: "bg-status-warning-bg text-accent-hover border-status-warning/30", dot: "bg-status-warning" },
  [PostStatus.PUBLISHED]: { label: "Đã xuất bản", style: "bg-status-success-bg text-primary-hover border-status-success/30", dot: "bg-status-success" },
  [PostStatus.ARCHIVED]: { label: "Đã lưu trữ", style: "bg-status-info-bg text-status-info border-status-info/30", dot: "bg-status-info" },
};

interface Props {
  posts: AdminPostListItemResponse[];
  isLoading: boolean;
  isSubmitting: boolean;
  isAdmin: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onEdit: (post: AdminPostListItemResponse) => void;
  onPublish: (postId: number) => void;
  onUnpublish: (postId: number) => void;
  onArchive: (post: AdminPostListItemResponse) => void;
  onRestore: (postId: number) => void;
  onDelete: (post: AdminPostListItemResponse) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export function PostsTable({ posts, isLoading, isSubmitting, isAdmin, page, pageSize, total, totalPages, onEdit, onPublish, onUnpublish, onArchive, onRestore, onDelete, onPageChange, onPageSizeChange }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-border text-left text-sm">
          <thead className="bg-surface-bg text-xs font-semibold uppercase tracking-wider text-text-sub"><tr>
            <th className="px-4 py-3.5">Bài viết</th><th className="px-4 py-3.5">Chủ đề</th><th className="px-4 py-3.5">Tác giả</th><th className="px-4 py-3.5">Trạng thái</th><th className="px-4 py-3.5">Ngày tạo</th><th className="px-4 py-3.5 text-right">Thao tác</th>
          </tr></thead>
          <tbody className="divide-y divide-surface-border">
            {isLoading && posts.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-text-sub">Đang tải danh sách bài viết...</td></tr> : posts.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center"><FileText className="mx-auto mb-2 size-8 text-text-muted" /><p className="font-medium text-text-sub">Không tìm thấy bài viết phù hợp</p></td></tr> : posts.map((post) => {
              const meta = STATUS_META[post.status] ?? STATUS_META[PostStatus.DRAFT];
              return <tr key={post.id} className="transition hover:bg-surface-hover/60">
                <td className="w-[260px] max-w-[260px] px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => onEdit(post)}
                      className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-border bg-surface-bg transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                      {post.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.thumbnail_url} alt={post.title} className="h-full w-full object-cover" />
                      ) : <FileText className="size-5 text-text-muted" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => onEdit(post)}
                        title={post.title}
                        className="line-clamp-2 text-left font-semibold text-text-main transition hover:text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                        {post.title}
                      </button>
                      <p title={`/${post.slug}`} className="mt-0.5 truncate font-mono text-xs text-text-muted">/{post.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5"><span className="rounded-md bg-primary-light px-2.5 py-1 text-xs font-medium text-primary-hover">{post.topic_name}</span></td>
                <td className="whitespace-nowrap px-4 py-3.5 text-text-sub">{post.author_name || "Không rõ"}</td>
                <td className="whitespace-nowrap px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.style}`}><span className={`size-1.5 rounded-full ${meta.dot}`} />{meta.label}</span></td>
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-text-sub">{formatDate(post.created_at)}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right"><div className="inline-flex items-center justify-end gap-1">
                  <button type="button" title="Sửa" aria-label={`Sửa ${post.title}`} disabled={isSubmitting} onClick={() => onEdit(post)} className="rounded-lg border border-surface-border bg-surface-card p-2 text-text-sub transition hover:bg-surface-hover hover:text-primary disabled:opacity-50"><Pencil className="size-4" /></button>
                  {isAdmin && (post.status === PostStatus.ARCHIVED ? <button type="button" title="Khôi phục" aria-label={`Khôi phục ${post.title}`} disabled={isSubmitting} onClick={() => onRestore(post.id)} className="rounded-lg bg-primary-light p-2 text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"><Undo2 className="size-4" /></button> : <>
                    {post.status !== PostStatus.PUBLISHED && <button type="button" title="Xuất bản" aria-label={`Xuất bản ${post.title}`} disabled={isSubmitting} onClick={() => onPublish(post.id)} className="rounded-lg bg-status-success-bg p-2 text-status-success transition hover:bg-status-success hover:text-white disabled:opacity-50"><Send className="size-4" /></button>}
                    {post.status === PostStatus.PUBLISHED && <button type="button" title="Gỡ xuất bản" aria-label={`Gỡ xuất bản ${post.title}`} disabled={isSubmitting} onClick={() => onUnpublish(post.id)} className="rounded-lg bg-surface-hover p-2 text-text-sub transition hover:bg-surface-active disabled:opacity-50"><Send className="size-4" /></button>}
                    <button type="button" title="Lưu trữ" aria-label={`Lưu trữ ${post.title}`} disabled={isSubmitting} onClick={() => onArchive(post)} className="rounded-lg bg-status-info-bg p-2 text-status-info transition hover:bg-status-info hover:text-white disabled:opacity-50"><Archive className="size-4" /></button>
                    <button type="button" title="Xóa vĩnh viễn" aria-label={`Xóa ${post.title}`} disabled={isSubmitting} onClick={() => onDelete(post)} className="rounded-lg bg-status-error-bg p-2 text-status-error transition hover:bg-status-error hover:text-white disabled:opacity-50"><Trash2 className="size-4" /></button>
                  </>)}
                </div></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col items-center justify-between gap-3 border-t border-surface-border bg-surface-bg px-4 py-3 text-xs text-text-sub sm:flex-row">
        <span>Trang <b className="text-text-main">{page}</b> / <b className="text-text-main">{Math.max(1, totalPages)}</b> · Tổng <b className="text-text-main">{total}</b> bài viết</span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">Mỗi trang
            <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="rounded-lg border border-surface-border bg-surface-card px-2 py-1.5 text-text-main outline-none focus:border-primary">
              {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
          <button type="button" disabled={isLoading || page <= 1} onClick={() => onPageChange(page - 1)} className="inline-flex items-center gap-1 rounded-lg border border-surface-border bg-surface-card px-3 py-1.5 font-medium transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="size-3.5" /> Trước</button>
          <button type="button" disabled={isLoading || page >= Math.max(1, totalPages)} onClick={() => onPageChange(page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-surface-border bg-surface-card px-3 py-1.5 font-medium transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40">Sau <ArrowRight className="size-3.5" /></button>
          </div>
        </div>
      </footer>
    </section>
  );
}
