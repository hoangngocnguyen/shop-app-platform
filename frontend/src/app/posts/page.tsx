"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Layers, Search } from "lucide-react";
import { publicPostApi } from "@/features/posts/api";
import { PublicPostListItem, PublicTopic } from "@/features/posts/types";
import { ROUTES } from "@/constants/routes";

function getPostUrl(post: PublicPostListItem): string {
  return ROUTES.POSTS.DETAIL(post.topic_slug || "tin-tuc", post.slug);
}

function formatPostDate(post: PublicPostListItem): string {
  const dateStr = post.published_at || post.created_at;
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function PostThumbnail({ post, className = "" }: { post: PublicPostListItem; className?: string }) {
  return (
    <div className={`aspect-video w-full overflow-hidden rounded-xl border border-surface-border/60 bg-surface-bg ${className}`}>
      {post.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.thumbnail_url}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/5 to-primary/15 text-xs font-bold tracking-wider text-primary/40">
          HOANGSHOP
        </div>
      )}
    </div>
  );
}

export default function BlogListingPage() {
  const [topics, setTopics] = useState<PublicTopic[]>([]);
  const [posts, setPosts] = useState<PublicPostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicPostApi.getTopics().then((data) => setTopics(data));
  }, []);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    publicPostApi
      .getPosts({
        page,
        page_size: 10,
        topic: selectedTopic || undefined,
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
        console.error("Lỗi tải bài viết:", err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [page, selectedTopic, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSelectTopic = (slug: string | null) => {
    setSelectedTopic(slug);
    setPage(1);
  };

  const isEditorialMode = page === 1 && !search && !selectedTopic && posts.length >= 2;
  const leadPost = isEditorialMode ? posts[0] : null;
  const secondaryPost = isEditorialMode ? posts[1] : null;
  const quickHeadlines = isEditorialMode ? posts.slice(2, 4) : [];
  const feedPosts = isEditorialMode ? posts.slice(4) : posts;

  return (
    <div className="min-h-screen bg-surface-bg py-5 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
        {/* TOP BAR: CHỦ ĐỀ & TÌM KIẾM */}
        <section className="rounded-2xl border border-surface-border bg-surface-card p-3.5 shadow-xs sm:px-5 sm:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-extrabold uppercase tracking-wide text-text-main">
                Chủ đề:
              </span>
              <button
                onClick={() => handleSelectTopic(null)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  selectedTopic === null
                    ? "bg-primary text-white shadow-xs"
                    : "border border-surface-border bg-surface-bg text-text-sub hover:border-primary/40 hover:text-primary"
                }`}
              >
                Tất cả
              </button>
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTopic(t.slug)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    selectedTopic === t.slug
                      ? "bg-primary text-white shadow-xs"
                      : "border border-surface-border bg-surface-bg text-text-sub hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  #{t.name}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 lg:w-80 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full rounded-xl border border-surface-border bg-surface-bg py-2 pl-9 pr-3 text-xs sm:text-sm text-text-main outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-ring-brand/15"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-primary-hover cursor-pointer"
              >
                Tìm
              </button>
            </form>
          </div>
        </section>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="rounded-2xl border border-surface-border bg-surface-card p-5 space-y-5">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 animate-pulse space-y-3">
                <div className="aspect-video w-full rounded-xl bg-surface-hover" />
                <div className="h-6 w-4/5 rounded bg-surface-hover" />
                <div className="h-4 w-full rounded bg-surface-hover" />
              </div>
              <div className="lg:col-span-5 animate-pulse space-y-3">
                <div className="aspect-video w-full rounded-xl bg-surface-hover" />
                <div className="h-5 w-3/4 rounded bg-surface-hover" />
                <div className="h-4 w-2/3 rounded bg-surface-hover" />
              </div>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-surface-border bg-surface-card p-10 text-center">
            <Layers className="mx-auto mb-3 size-11 text-text-muted opacity-60" />
            <h3 className="mb-1 text-base font-bold text-text-main">
              Không tìm thấy bài viết nào
            </h3>
            <p className="mb-4 text-xs text-text-sub">
              Không có bài viết phù hợp với từ khóa hoặc chuyên mục đã chọn.
            </p>
            <button
              onClick={() => {
                setSelectedTopic(null);
                setSearch("");
                setSearchInput("");
              }}
              className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-hover"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <>
            {/* EDITORIAL TOP SECTION (THEGIOIDIDONG NEWS STYLE) */}
            {isEditorialMode && leadPost && (
              <section className="rounded-2xl border border-surface-border bg-surface-card p-4 shadow-xs sm:p-5">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* CỘT TRÁI: BÀI VIẾT NỔI BẬT CHÍNH */}
                  <div className="lg:col-span-7">
                    <Link href={getPostUrl(leadPost)} className="group block">
                      <PostThumbnail post={leadPost} />
                      <h2 className="mt-3 text-xl font-extrabold leading-snug tracking-tight text-text-main transition-colors group-hover:text-primary sm:text-2xl">
                        {leadPost.title}
                      </h2>
                      {leadPost.summary && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-sub">
                          {leadPost.summary}
                        </p>
                      )}
                      <div className="mt-2.5 flex items-center gap-2 text-xs text-text-muted">
                        <span className="font-medium text-text-sub">
                          {leadPost.author_name || "Ban Biên Tập"}
                        </span>
                        <span>•</span>
                        <span>{formatPostDate(leadPost)}</span>
                      </div>
                    </Link>
                  </div>

                  {/* CỘT PHẢI: BÀI PHỤ + TIN MỚI + CHỦ ĐỀ HOT */}
                  <div className="flex flex-col justify-between gap-4 lg:col-span-5 lg:border-l lg:border-surface-border lg:pl-6">
                    {secondaryPost && (
                      <Link href={getPostUrl(secondaryPost)} className="group block">
                        <PostThumbnail post={secondaryPost} />
                        <h3 className="mt-2.5 line-clamp-2 text-base font-bold leading-snug text-text-main transition-colors group-hover:text-primary sm:text-lg">
                          {secondaryPost.title}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
                          <span className="font-medium text-text-sub">
                            {secondaryPost.author_name || "Ban Biên Tập"}
                          </span>
                          <span>•</span>
                          <span>{formatPostDate(secondaryPost)}</span>
                        </div>
                      </Link>
                    )}

                    {quickHeadlines.length > 0 && (
                      <div className="divide-y divide-surface-border border-t border-surface-border pt-2">
                        {quickHeadlines.map((item) => (
                          <Link
                            key={item.id}
                            href={getPostUrl(item)}
                            className="group block py-2.5 first:pt-1 last:pb-0"
                          >
                            <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-text-main transition-colors group-hover:text-primary">
                              {item.title}
                            </h4>
                            <span className="mt-1 block text-[11px] text-text-muted">
                              {item.topic_name} • {formatPostDate(item)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {topics.length > 0 && (
                      <div className="border-t border-surface-border pt-3">
                        <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-text-main">
                          #Chủ đề nổi bật
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {topics.slice(0, 6).map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleSelectTopic(t.slug)}
                              className="cursor-pointer rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-primary-hover"
                            >
                              #{t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* DANH SÁCH BÀI VIẾT DẠNG HÀNG NGANG */}
            {feedPosts.length > 0 && (
              <section className="rounded-2xl border border-surface-border bg-surface-card px-4 py-2 shadow-xs sm:px-6">
                <div className="divide-y divide-surface-border">
                  {feedPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={getPostUrl(post)}
                      className="group flex flex-col gap-3.5 py-4 sm:flex-row sm:items-start sm:gap-5"
                    >
                      <div className="w-full shrink-0 sm:w-56">
                        <PostThumbnail post={post} />
                      </div>
                      <div className="min-w-0 flex-1">
                        {post.topic_name && (
                          <span className="mb-1.5 inline-block rounded-md bg-primary-light px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {post.topic_name}
                          </span>
                        )}
                        <h3 className="line-clamp-2 text-base font-bold leading-snug text-text-main transition-colors group-hover:text-primary sm:text-lg">
                          {post.title}
                        </h3>
                        {post.summary && (
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-sub sm:text-sm">
                            {post.summary}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                          <span className="font-medium text-text-sub">
                            {post.author_name || "Ban Biên Tập"}
                          </span>
                          <span>•</span>
                          <span>{formatPostDate(post)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="rounded-xl border border-surface-border bg-surface-card p-2.5 transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4 text-text-main" />
            </button>
            <span className="px-4 text-xs font-semibold text-text-main sm:text-sm">
              Trang {page} / {totalPages} (Tổng {total} bài viết)
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="rounded-xl border border-surface-border bg-surface-card p-2.5 transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4 text-text-main" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
