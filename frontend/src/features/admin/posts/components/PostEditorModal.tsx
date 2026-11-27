"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Code2, Eye, Plus, Send, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/common/stores/useToastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PostContentRenderer } from "@/features/posts/components/PostContentRenderer";
import { useAdminPostStore } from "../stores";
import { PostStatus, type AdminPostDetailResponse, type TopicResponse } from "../types";
import { postFormSchema, type PostFormInput, type PostFormValues } from "../schemas/postSchema";

const STATUS_LABEL: Record<PostStatus, string> = {
  [PostStatus.DRAFT]: "Bản nháp",
  [PostStatus.PENDING]: "Chờ duyệt",
  [PostStatus.PUBLISHED]: "Đã xuất bản",
  [PostStatus.ARCHIVED]: "Đã lưu trữ",
};

function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (letter) => letter === "đ" ? "d" : "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  post: AdminPostDetailResponse | null;
  topics: TopicResponse[];
  isAdmin: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: PostFormValues, file?: File | null) => Promise<boolean>;
  onOpenTopics?: () => void;
}

export function PostEditorModal({ post, topics, isAdmin, isSubmitting, onClose, onSubmit }: Props) {
  const { createTopic } = useAdminPostStore();
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(post?.thumbnail_url ?? "");
  const [showQuickAddTopic, setShowQuickAddTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [addingTopic, setAddingTopic] = useState(false);
  const [contentTab, setContentTab] = useState<"code" | "preview">("code");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PostFormInput, unknown, PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      summary: post?.summary ?? "",
      content: post?.content ?? "",
      thumbnail_url: post?.thumbnail_url ?? "",
      topic_id: post?.topic_id ? String(post.topic_id) : "",
      status: post?.status ?? PostStatus.DRAFT,
    },
  });

  const title = watch("title");
  const status = watch("status");
  const contentValue = watch("content") ?? "";

  const updateTitle = (value: string) => {
    if (!slugEdited) setValue("slug", toSlug(value), { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setValue("thumbnail_url", "", { shouldValidate: true });
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setValue("thumbnail_url", "", { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleQuickAddTopic = async () => {
    const trimmed = newTopicName.trim();
    if (!trimmed) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    const slug = toSlug(trimmed);
    if (!slug) {
      toast.error("Tên danh mục không hợp lệ");
      return;
    }
    setAddingTopic(true);
    const created = await createTopic({ name: trimmed, slug });
    setAddingTopic(false);
    if (created) {
      toast.success(`Đã thêm danh mục "${created.name}"`);
      setValue("topic_id", String(created.id), { shouldValidate: true });
      setNewTopicName("");
      setShowQuickAddTopic(false);
    } else {
      toast.error(useAdminPostStore.getState().error ?? "Không thể thêm danh mục");
    }
  };

  const statuses = post && isAdmin
    ? Object.values(PostStatus)
    : post && ![PostStatus.DRAFT, PostStatus.PENDING].includes(post.status)
      ? [post.status, PostStatus.DRAFT, PostStatus.PENDING]
      : [PostStatus.DRAFT, PostStatus.PENDING];

  const submit = async (values: PostFormValues) => {
    if (await onSubmit(values, selectedFile)) onClose();
  };

  return (
    <Modal isOpen onClose={isSubmitting ? () => undefined : onClose} title={post ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"} maxWidth="5xl">
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(240px,3fr)]">
          <div className="space-y-4">
            <Input label="Tiêu đề bài viết" placeholder="Nhập tiêu đề (ít nhất 5 ký tự)" error={errors.title?.message} {...register("title", { onChange: (event) => updateTitle(event.target.value) })} />
            <div>
              <label htmlFor="post-slug" className="mb-1.5 block text-xs font-semibold">Slug đường dẫn</label>
              <input id="post-slug" {...register("slug", { onChange: () => setSlugEdited(true) })} placeholder="danh-gia-san-pham-moi" className={`w-full rounded-xl border bg-surface-bg px-3.5 py-2.5 font-mono text-sm outline-none focus:ring-4 ${errors.slug ? "border-status-error focus:ring-status-error/15" : "border-surface-border focus:border-primary focus:ring-ring-brand/15"}`} />
              {errors.slug && <p className="mt-1 text-xs text-status-error">{errors.slug.message}</p>}
            </div>
            <div>
              <label htmlFor="post-summary" className="mb-1.5 block text-xs font-semibold">Mô tả ngắn</label>
              <textarea id="post-summary" rows={3} maxLength={500} {...register("summary")} placeholder="Tóm tắt nội dung chính của bài viết..." className={`w-full rounded-xl border bg-surface-bg px-3.5 py-2.5 text-sm outline-none focus:ring-4 ${errors.summary ? "border-status-error focus:ring-status-error/15" : "border-surface-border focus:border-primary focus:ring-ring-brand/15"}`} />
              <div className="mt-1 flex justify-between text-xs">{errors.summary ? <span className="text-status-error">{errors.summary.message}</span> : <span className="text-text-muted">Tối đa 500 ký tự</span>}<span className="text-text-muted">{(watch("summary") ?? "").length}/500</span></div>
            </div>
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="post-content" className="text-xs font-semibold">
                  Nội dung bài viết (HTML / Markdown)
                </label>
                <div className="inline-flex rounded-lg border border-surface-border bg-surface-bg p-0.5">
                  <button
                    type="button"
                    onClick={() => setContentTab("code")}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      contentTab === "code"
                        ? "bg-primary text-white shadow-xs"
                        : "text-text-sub hover:text-text-main"
                    }`}
                  >
                    <Code2 className="size-3.5" />
                    Soạn thảo
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab("preview")}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      contentTab === "preview"
                        ? "bg-primary text-white shadow-xs"
                        : "text-text-sub hover:text-text-main"
                    }`}
                  >
                    <Eye className="size-3.5" />
                    Xem trước
                  </button>
                </div>
              </div>

              {contentTab === "code" ? (
                <textarea
                  id="post-content"
                  rows={16}
                  {...register("content")}
                  placeholder="Nhập hoặc dán nội dung bài viết (hỗ trợ HTML hoặc Markdown)..."
                  className={`w-full resize-y rounded-xl border bg-surface-bg px-3.5 py-3 font-mono text-xs sm:text-sm leading-relaxed outline-none focus:ring-4 ${errors.content ? "border-status-error focus:ring-status-error/15" : "border-surface-border focus:border-primary focus:ring-ring-brand/15"}`}
                />
              ) : (
                <div className="min-h-[340px] max-h-[500px] overflow-y-auto rounded-xl border border-surface-border bg-surface-card p-5">
                  <PostContentRenderer content={contentValue} />
                </div>
              )}

              {errors.content && <p className="mt-1 text-xs text-status-error">{errors.content.message}</p>}
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl border border-surface-border bg-surface-bg p-4">
            <div>
              <label htmlFor="post-status" className="mb-1.5 block text-xs font-semibold">Trạng thái</label>
              <select id="post-status" {...register("status")} className="w-full rounded-xl border border-surface-border bg-surface-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring-brand/15">
                {statuses.map((value) => <option key={value} value={value}>{STATUS_LABEL[value]}{!isAdmin && value === post?.status && ![PostStatus.DRAFT, PostStatus.PENDING].includes(value) ? " · giữ nguyên" : ""}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="post-topic" className="mb-1.5 block text-xs font-semibold">
                Danh mục bài viết
              </label>
              <select
                id="post-topic"
                {...register("topic_id")}
                className="w-full rounded-xl border border-surface-border bg-surface-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring-brand/15"
              >
                <option value="">-- Chọn danh mục --</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.topic_id && (
                <p className="mt-1 text-xs text-status-error">{errors.topic_id.message}</p>
              )}

              {!showQuickAddTopic ? (
                <button
                  type="button"
                  onClick={() => setShowQuickAddTopic(true)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover cursor-pointer"
                >
                  <Plus className="size-3.5" /> Thêm danh mục
                </button>
              ) : (
                <div className="mt-2 space-y-2 rounded-xl border border-surface-border bg-surface-card p-2.5">
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleQuickAddTopic();
                      }
                    }}
                    placeholder="Nhập tên danh mục mới..."
                    autoFocus
                    className="w-full rounded-lg border border-surface-border bg-surface-bg px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickAddTopic(false);
                        setNewTopicName("");
                      }}
                      disabled={addingTopic}
                      className="rounded-lg border border-surface-border px-2.5 py-1 text-xs font-medium text-text-sub hover:bg-surface-hover"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickAddTopic}
                      disabled={addingTopic}
                      className="rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                    >
                      {addingTopic ? "Đang thêm..." : "Lưu"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold">Ảnh đại diện bài viết</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-border bg-surface-card p-3 text-center transition hover:border-primary hover:bg-primary-light/10"
              >
                <UploadCloud className="mb-1 size-6 text-primary" />
                <span className="text-xs font-semibold text-text-main">
                  {selectedFile ? selectedFile.name : "Chọn file ảnh từ máy tính"}
                </span>
              </div>

              {previewUrl && (
                <div className="relative mt-2 overflow-hidden rounded-xl border border-surface-border bg-surface-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Xem trước ảnh đại diện" className="h-36 w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    title="Xóa ảnh"
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
        <div className="mt-5 flex flex-col-reverse justify-end gap-2 border-t border-surface-border pt-4 sm:flex-row">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button type="submit" isLoading={isSubmitting}><Send className="size-4" />{post ? "Lưu thay đổi" : "Tạo bài viết"}</Button>
        </div>
      </form>
    </Modal>
  );
}
