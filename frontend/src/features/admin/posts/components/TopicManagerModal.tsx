"use client";

import React, { useState } from "react";
import { Edit2, FolderTree, Plus, Trash2, X } from "lucide-react";
import { toast } from "@/common/stores/useToastStore";
import { confirm } from "@/common/stores/useConfirmStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAdminPostStore } from "../stores";
import type { TopicResponse } from "../types";

function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (letter) => (letter === "đ" ? "d" : "D"))
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TopicManagerModal({ isOpen, onClose }: Props) {
  const { topics, isSubmitting, createTopic, updateTopic, deleteTopic } = useAdminPostStore();
  const [editingTopic, setEditingTopic] = useState<TopicResponse | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  if (!isOpen) return null;

  const handleStartEdit = (topic: TopicResponse) => {
    setEditingTopic(topic);
    setName(topic.name);
    setSlug(topic.slug);
  };

  const handleCancelEdit = () => {
    setEditingTopic(null);
    setName("");
    setSlug("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    const finalSlug = slug.trim() || toSlug(name);
    if (!finalSlug) {
      toast.error("Vui lòng nhập slug hợp lệ");
      return;
    }

    if (editingTopic) {
      const res = await updateTopic(editingTopic.id, {
        name: name.trim(),
        slug: finalSlug,
      });
      if (res) {
        toast.success("Cập nhật danh mục thành công");
        handleCancelEdit();
      }
    } else {
      const res = await createTopic({
        name: name.trim(),
        slug: finalSlug,
      });
      if (res) {
        toast.success("Thêm danh mục mới thành công");
        handleCancelEdit();
      }
    }
  };

  const handleDelete = async (topic: TopicResponse) => {
    const accepted = await confirm({
      title: "Xóa danh mục bài viết",
      message: `Bạn có chắc muốn xóa danh mục “${topic.name}”? Các bài viết thuộc danh mục này sẽ chuyển về chưa phân loại.`,
      confirmText: "Xóa danh mục",
      variant: "danger",
    });

    if (!accepted) return;

    const ok = await deleteTopic(topic.id);
    if (ok) {
      toast.success("Đã xóa danh mục bài viết");
      if (editingTopic?.id === topic.id) handleCancelEdit();
    }
  };

  return (
    <Modal isOpen onClose={isSubmitting ? () => undefined : onClose} title="Quản lý danh mục bài viết" maxWidth="2xl">
      <div className="space-y-6">
        {/* Form thêm / sửa danh mục */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-border bg-surface-bg p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-main">
              {editingTopic ? `Chỉnh sửa: ${editingTopic.name}` : "Thêm danh mục mới"}
            </h3>
            {editingTopic && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-main"
              >
                <X className="size-3.5" /> Hủy sửa
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input
                label="Tên danh mục"
                placeholder="Ví dụ: Tin công nghệ"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingTopic && (!slug || slug === toSlug(name))) {
                    setSlug(toSlug(e.target.value));
                  }
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">Slug SEO</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tin-cong-nghe"
                className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 font-mono text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring-brand/15"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {editingTopic && (
              <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                Hủy
              </Button>
            )}
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {editingTopic ? <Edit2 className="size-3.5" /> : <Plus className="size-3.5" />}
              {editingTopic ? "Lưu thay đổi" : "Thêm danh mục"}
            </Button>
          </div>
        </form>

        {/* Danh sách danh mục */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="size-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Danh sách danh mục ({topics.length})
              </h4>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-surface-border">
            <div className="max-h-[320px] overflow-y-auto divide-y divide-surface-border">
              {topics.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">Chưa có danh mục nào.</div>
              ) : (
                topics.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-3.5 transition hover:bg-surface-bg/50 ${
                      editingTopic?.id === t.id ? "bg-primary-light/15" : "bg-surface-card"
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-text-main truncate">{t.name}</span>
                        <span className="rounded-md bg-surface-bg px-2 py-0.5 font-mono text-[11px] text-text-muted">
                          {t.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(t)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-surface-bg hover:text-text-main"
                        title="Chỉnh sửa danh mục"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-status-error-bg hover:text-status-error"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-surface-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
