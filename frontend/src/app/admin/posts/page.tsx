"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Archive, FileText, PenLine, Send } from "lucide-react";
import { confirm } from "@/common/stores/useConfirmStore";
import { toast } from "@/common/stores/useToastStore";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { PostEditorModal, PostsTable, PostsToolbar, TopicManagerModal } from "@/features/admin/posts/components";
import { useAdminPostStore } from "@/features/admin/posts/stores";
import { PostStatus, type AdminPostDetailResponse, type PostStatus as PostStatusType, type UpdatePostRequest } from "@/features/admin/posts/types";
import type { PostFormValues } from "@/features/admin/posts/schemas/postSchema";

const STATUS_LABEL: Record<PostStatus, string> = {
  [PostStatus.DRAFT]: "Bản nháp",
  [PostStatus.PENDING]: "Chờ duyệt",
  [PostStatus.PUBLISHED]: "Đã xuất bản",
  [PostStatus.ARCHIVED]: "Đã lưu trữ",
};

export default function AdminPostsPage() {
  const {
    posts, topics, selectedPost, total, page, pageSize, totalPages, isLoading, isSubmitting, error,
    fetchTopics, fetchPosts, fetchPostById, createPost, updatePost, updatePostStatus, deletePost, restorePost,
    clearError, clearSelectedPost,
  } = useAdminPostStore();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role?.code?.toUpperCase() === "ADMIN";

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatusType | "ALL">("ALL");
  const [topicFilter, setTopicFilter] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [topicManagerOpen, setTopicManagerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPostDetailResponse | null>(null);

  useEffect(() => {
    void fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void fetchPosts({
      page: 1,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      topic_id: topicFilter ? Number(topicFilter) : undefined,
      search: search || undefined,
    });
  }, [fetchPosts, search, statusFilter, topicFilter]);

  const openCreate = () => {
    clearSelectedPost();
    setEditingPost(null);
    setEditorOpen(true);
  };

  const openEdit = async (postId: number) => {
    const post = await fetchPostById(postId);
    if (post) {
      setEditingPost(post);
      setEditorOpen(true);
    } else {
      toast.error(useAdminPostStore.getState().error ?? "Không thể mở bài viết");
    }
  };

  const closeEditor = () => {
    if (isSubmitting) return;
    setEditorOpen(false);
    setEditingPost(null);
    clearSelectedPost();
  };

  const submitEditor = async (values: PostFormValues, file?: File | null): Promise<boolean> => {
    const fields = {
      title: values.title.trim(),
      slug: values.slug.trim(),
      summary: values.summary?.trim() || null,
      content: values.content.trim(),
      thumbnail_url: values.thumbnail_url?.trim() || null,
      topic_id: values.topic_id,
    };
    let result: AdminPostDetailResponse | null;

    if (editingPost) {
      const payload: UpdatePostRequest = { ...fields };
      // Editors may keep an existing published/archived state, but may only request DRAFT/PENDING.
      if (isAdmin || values.status === PostStatus.DRAFT || values.status === PostStatus.PENDING) {
        payload.status = values.status;
      }
      result = await updatePost(editingPost.id, payload, file);
    } else {
      result = await createPost({
        ...fields,
        status: values.status === PostStatus.PENDING ? PostStatus.PENDING : PostStatus.DRAFT,
      }, file);
    }

    if (!result) {
      toast.error(useAdminPostStore.getState().error ?? "Không thể lưu bài viết");
      return false;
    }
    toast.success(editingPost ? "Đã cập nhật bài viết" : "Đã tạo bài viết");
    return true;
  };

  const quickStatus = async (postId: number, status: PostStatus) => {
    const result = await updatePostStatus(postId, { status });
    if (result) toast.success(`Đã chuyển sang trạng thái ${STATUS_LABEL[status].toLowerCase()}`);
    else toast.error(useAdminPostStore.getState().error ?? "Không thể đổi trạng thái");
  };

  const archive = async (postId: number, title: string) => {
    const accepted = await confirm({
      title: "Lưu trữ bài viết",
      message: `Bài viết “${title}” sẽ được ẩn khỏi nội dung đang xuất bản và có thể khôi phục sau.`,
      confirmText: "Lưu trữ",
      variant: "warning",
    });
    if (accepted) await quickStatus(postId, PostStatus.ARCHIVED);
  };

  const restore = async (postId: number) => {
    const accepted = await confirm({ title: "Khôi phục bài viết", message: "Bài viết sẽ trở về trạng thái trước khi được lưu trữ.", confirmText: "Khôi phục", variant: "info" });
    if (!accepted) return;
    const result = await restorePost(postId);
    if (result) toast.success("Đã khôi phục bài viết");
    else toast.error(useAdminPostStore.getState().error ?? "Không thể khôi phục bài viết");
  };

  const remove = async (postId: number, title: string) => {
    const accepted = await confirm({ title: "Xóa vĩnh viễn bài viết", message: `Bạn có chắc muốn xóa “${title}”? Thao tác này không thể hoàn tác.`, confirmText: "Xóa vĩnh viễn", variant: "danger" });
    if (!accepted) return;
    const result = await deletePost(postId);
    if (result) toast.success("Đã xóa bài viết");
    else toast.error(useAdminPostStore.getState().error ?? "Không thể xóa bài viết");
  };

  const draftCount = posts.filter((post) => post.status === PostStatus.DRAFT).length;
  const publishedCount = posts.filter((post) => post.status === PostStatus.PUBLISHED).length;
  const archivedCount = posts.filter((post) => post.status === PostStatus.ARCHIVED).length;

  return (
    <div className="mx-auto px-4 pt-2 pb-8 md:pt-3 md:pb-10 space-y-6">
      <PostsToolbar
        total={total}
        topics={topics}
        searchInput={searchInput}
        statusFilter={statusFilter}
        topicFilter={topicFilter}
        onSearchChange={setSearchInput}
        onStatusChange={setStatusFilter}
        onTopicChange={setTopicFilter}
        onCreate={openCreate}
        onOpenTopics={() => setTopicManagerOpen(true)}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<FileText className="size-5" />} label="Tổng bài viết" value={total} tone="primary" />
        <SummaryCard icon={<PenLine className="size-5" />} label="Bản nháp" value={draftCount} tone="warning" />
        <SummaryCard icon={<Send className="size-5" />} label="Xuất bản" value={publishedCount} tone="success" />
        <SummaryCard icon={<Archive className="size-5" />} label="Lưu trữ" value={archivedCount} tone="info" />
      </section>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-status-error/20 bg-status-error-bg px-4 py-3 text-sm text-status-error"><span>{error}</span><button type="button" onClick={clearError} className="font-semibold underline">Đóng</button></div>}

      <PostsTable
        posts={posts}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        isAdmin={isAdmin}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onEdit={(post) => void openEdit(post.id)}
        onPublish={(postId) => void quickStatus(postId, PostStatus.PUBLISHED)}
        onUnpublish={(postId) => void quickStatus(postId, PostStatus.DRAFT)}
        onArchive={(post) => void archive(post.id, post.title)}
        onRestore={(postId) => void restore(postId)}
        onDelete={(post) => void remove(post.id, post.title)}
        onPageChange={(nextPage) => void fetchPosts({ page: nextPage })}
        onPageSizeChange={(nextPageSize) => void fetchPosts({ page: 1, page_size: nextPageSize })}
      />

      {editorOpen && (
        <PostEditorModal
          key={editingPost?.id ?? "create"}
          post={editingPost}
          topics={topics}
          isAdmin={isAdmin}
          isSubmitting={isSubmitting}
          onClose={closeEditor}
          onSubmit={submitEditor}
          onOpenTopics={() => setTopicManagerOpen(true)}
        />
      )}

      <TopicManagerModal
        isOpen={topicManagerOpen}
        onClose={() => setTopicManagerOpen(false)}
      />
    </div>
  );
}

function SummaryCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: "primary" | "warning" | "success" | "info" }) {
  const colors = {
    primary: "bg-primary-light text-primary",
    warning: "bg-status-warning-bg text-status-warning",
    success: "bg-status-success-bg text-status-success",
    info: "bg-status-info-bg text-status-info",
  };
  return <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-card p-3.5 shadow-xs"><div className={`flex size-10 items-center justify-center rounded-xl ${colors[tone]}`}>{icon}</div><div><p className="text-xs font-semibold text-text-muted">{label}</p><p className="mt-0.5 text-lg font-extrabold text-text-main">{value.toLocaleString("vi-VN")}</p></div></div>;
}
