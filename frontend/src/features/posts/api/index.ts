import api from "@/lib/axios/client";
import {
  PublicPostDetail,
  PublicPostListItem,
  PublicPostListResponse,
  PublicTopic,
} from "../types";

export const publicPostApi = {
  /**
   * Lấy danh sách các chủ đề bài viết công khai
   */
  getTopics: async (): Promise<PublicTopic[]> => {
    try {
      const res = await api.get<PublicTopic[]>("/posts/topics");
      const data = (res as unknown as { data: PublicTopic[] })?.data ?? res;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Lỗi khi tải danh mục bài viết:", err);
      return [];
    }
  },

  /**
   * Lấy danh sách bài viết phân trang (toàn bộ hoặc lọc theo topic)
   */
  getPosts: async (params?: {
    page?: number;
    page_size?: number;
    topic?: string;
    search?: string;
  }): Promise<PublicPostListResponse> => {
    const res = await api.get<PublicPostListResponse>("/posts", { params });
    const data = (res as unknown as { data: PublicPostListResponse })?.data ?? res;
    return (
      data || {
        items: [],
        total: 0,
        page: params?.page || 1,
        page_size: params?.page_size || 10,
        total_pages: 1,
      }
    );
  },

  /**
   * Lấy danh sách bài viết phân trang theo topic slug
   */
  getPostsByTopic: async (
    topicSlug: string,
    params?: {
      page?: number;
      page_size?: number;
      search?: string;
    }
  ): Promise<PublicPostListResponse> => {
    const res = await api.get<PublicPostListResponse>(`/posts/${topicSlug}`, { params });
    const data = (res as unknown as { data: PublicPostListResponse })?.data ?? res;
    return (
      data || {
        items: [],
        total: 0,
        page: params?.page || 1,
        page_size: params?.page_size || 10,
        total_pages: 1,
      }
    );
  },

  /**
   * Lấy chi tiết bài viết theo topic_slug và post_slug
   */
  getPostDetail: async (
    topicSlug: string,
    postSlug: string
  ): Promise<PublicPostDetail> => {
    const res = await api.get<PublicPostDetail>(`/posts/${topicSlug}/${postSlug}`);
    const data = (res as unknown as { data: PublicPostDetail })?.data ?? res;
    return data;
  },
};
