"use client";

import { FileText, FolderTree, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PostStatus, type PostStatus as PostStatusType, type TopicResponse } from "../types";

const STATUS_LABELS: Record<PostStatus, string> = {
  [PostStatus.DRAFT]: "Bản nháp",
  [PostStatus.PENDING]: "Chờ duyệt",
  [PostStatus.PUBLISHED]: "Đã xuất bản",
  [PostStatus.ARCHIVED]: "Đã lưu trữ",
};

interface Props {
  total: number;
  topics: TopicResponse[];
  searchInput: string;
  statusFilter: PostStatusType | "ALL";
  topicFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: PostStatusType | "ALL") => void;
  onTopicChange: (value: string) => void;
  onCreate: () => void;
  onOpenTopics: () => void;
}

export function PostsToolbar({
  total,
  topics,
  searchInput,
  statusFilter,
  topicFilter,
  onSearchChange,
  onStatusChange,
  onTopicChange,
  onCreate,
  onOpenTopics,
}: Props) {
  return (
    <>
      <header className="flex flex-col justify-between gap-3 rounded-2xl border border-surface-border bg-surface-card px-4 py-3.5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary-light text-primary shadow-xs"><FileText className="size-5" /></div>
          <div><h1 className="text-lg font-extrabold leading-tight tracking-tight">Danh sách bài viết</h1><p className="mt-0.5 text-xs text-text-muted">{total} bài viết · Tạo, biên tập, duyệt và lưu trữ nội dung.</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenTopics}><FolderTree className="size-4" />Quản lý danh mục</Button>
          <Button size="sm" onClick={onCreate}><Plus className="size-4" />Tạo bài viết</Button>
        </div>
      </header>

      <section className="rounded-2xl border border-surface-border bg-surface-card p-3.5 shadow-xs sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_200px_200px]">
          <label className="relative block">
            <span className="mb-1 block text-xs font-semibold">Tìm bài viết</span>
            <Search className="absolute left-3 top-[2.05rem] size-4 text-text-muted" />
            <input value={searchInput} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tiêu đề hoặc slug..." className="w-full rounded-xl border border-surface-border bg-surface-bg py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring-brand/15" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold">Trạng thái</span>
            <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value as PostStatusType | "ALL")} className="w-full rounded-xl border border-surface-border bg-surface-bg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring-brand/15">
              <option value="ALL">Tất cả trạng thái</option>
              {Object.values(PostStatus).map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold">Danh mục (Chủ đề)</span>
            <select value={topicFilter} onChange={(event) => onTopicChange(event.target.value)} className="w-full rounded-xl border border-surface-border bg-surface-bg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring-brand/15">
              <option value="">Tất cả danh mục</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
    </>
  );
}
