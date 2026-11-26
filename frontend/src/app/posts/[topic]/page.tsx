"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
  ChevronRight as BreadcrumbChevron,
} from "lucide-react";
import { publicPostApi } from "@/features/posts/api";
import { PublicPostListItem, PublicTopic } from "@/features/posts/types";
import { PostCard } from "@/features/posts/components/PostCard";
import { ROUTES } from "@/constants/routes";

export default function TopicPostsPage() {
  const params = useParams();
  const topicSlug = (params?.topic as string) || "";

  const [topics, setTopics] = useState<PublicTopic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<PublicTopic | null>(null);
  const [posts, setPosts] = useState<PublicPostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  // Load topics
  useEffect(() => {
    publicPostApi.getTopics().then((data) => {
      setTopics(data);
      const found = data.find((t) => t.slug === topicSlug);
      if (found) setCurrentTopic(found);
    });
  }, [topicSlug]);

  // Load posts for this topic
  useEffect(() => {
    let isCancelled = false;
    if (!topicSlug) return;
    setLoading(true);

    publicPostApi
      .getPostsByTopic(topicSlug, {
        page,
        page_size: 9,
        search: search || undefined,
      })
      .then((res) => {
        if (!isCancelled) {
          setPosts(res.items);
          setTotal(res.total);
          setTotalPages(res.total_pages);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải bài viết theo chủ đề:", err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [topicSlug, page, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const displayName = currentTopic?.name || topicSlug.replace(/-/g, " ");

  return (
    <div className="min-h-screen bg-surface-bg py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-1 hover:text-text-main transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <BreadcrumbChevron className="w-3 h-3 text-text-muted/60" />
          <Link
            href={ROUTES.POSTS.ROOT}
            className="hover:text-text-main transition-colors"
          >
            Bài viết
          </Link>
          <BreadcrumbChevron className="w-3 h-3 text-text-muted/60" />
          <span className="font-semibold text-text-main capitalize">
            {displayName}
          </span>
        </nav>

        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-surface-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main capitalize">
              {displayName}
            </h1>
          </div>
          {/* SEARCH IN TOPIC */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={`Tìm trong ${displayName}...`}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-card border border-surface-border text-text-main text-xs sm:text-sm outline-none focus:border-[#002b49]"
              />
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#002b49] hover:bg-[#001c30] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0"
            >
              Tìm
            </button>
          </form>
        </div>

        {/* TOPIC CHIPS SHORTCUT */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <Link
            href={ROUTES.POSTS.ROOT}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-surface-card border border-surface-border text-text-sub hover:bg-surface-hover hover:text-text-main shrink-0 transition-colors"
          >
            ← Tất cả chủ đề
          </Link>
          {topics.map((t) => (
            <Link
              key={t.id}
              href={ROUTES.POSTS.TOPIC(t.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                t.slug === topicSlug
                  ? "bg-[#002b49] text-white shadow-xs"
                  : "bg-surface-card border border-surface-border text-text-sub hover:bg-surface-hover hover:text-text-main"
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>

        {/* POSTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-surface-card border border-surface-border rounded-2xl h-80 animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="w-full h-44 bg-surface-hover rounded-xl" />
                <div className="space-y-2 mt-4">
                  <div className="w-3/4 h-4 bg-surface-hover rounded" />
                  <div className="w-1/2 h-3 bg-surface-hover rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center max-w-lg mx-auto">
            <h3 className="text-base font-bold text-text-main mb-1">
              Chưa có bài viết nào
            </h3>
            <p className="text-xs text-text-sub mb-4">
              Chuyên mục này hiện chưa có bài viết xuất bản hoặc không khớp từ khóa tìm kiếm.
            </p>
            <Link
              href={ROUTES.POSTS.ROOT}
              className="inline-block px-4 py-2 bg-[#002b49] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Xem tất cả bài viết
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-text-main" />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-text-main px-4">
              Trang {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-text-main" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
