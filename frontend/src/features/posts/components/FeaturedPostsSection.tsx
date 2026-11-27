"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { publicPostApi } from "../api";
import { PublicPostListItem } from "../types";
import { ROUTES } from "@/constants/routes";

export const FeaturedPostsSection: React.FC = () => {
  const [posts, setPosts] = useState<PublicPostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    publicPostApi
      .getPosts({ page: 1, page_size: 4 })
      .then((res) => {
        if (!isCancelled) {
          setPosts(res.items || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!loading && posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-2 rounded-2xl border border-surface-border bg-surface-card p-3 shadow-xs sm:px-4 sm:py-3">
      <h2 className="mb-2.5 text-lg font-bold tracking-tight text-text-main sm:text-xl">
        Bài viết nổi bật
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3.5">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="animate-pulse space-y-2">
              <div className="aspect-video w-full rounded-xl bg-surface-hover" />
              <div className="h-4 w-full rounded bg-surface-hover" />
              <div className="h-4 w-3/4 rounded bg-surface-hover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3.5">
          {posts.slice(0, 4).map((post) => {
            const detailUrl = ROUTES.POSTS.DETAIL(
              post.topic_slug || "huong-dan",
              post.slug
            );
            return (
              <Link
                key={post.id}
                href={detailUrl}
                className="group block"
              >
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-surface-border/60 bg-surface-bg">
                  {post.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#002b49]/5 to-[#002b49]/15 text-xs font-bold text-[#002b49]/40">
                      HOANGSHOP
                    </div>
                  )}
                </div>
                <h3 className="mt-2 line-clamp-3 text-sm sm:text-[15px] font-semibold leading-snug text-text-main transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-2 text-center">
        <Link
          href={ROUTES.POSTS.ROOT}
          className="inline-flex items-center gap-0.5 text-sm font-semibold text-[#2f80ed] transition-colors hover:text-[#1c64c7]"
        >
          <span>Xem thêm</span>
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </section>
  );
};
