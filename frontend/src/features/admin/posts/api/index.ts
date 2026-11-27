import api from "@/lib/axios/client";
import type {
  AdminPostDetailResponse,
  AdminPostListResponse,
  AdminPostQueryParams,
  CreatePostRequest,
  DeletePostResponse,
  TopicCreateRequest,
  TopicResponse,
  TopicUpdateRequest,
  UpdatePostRequest,
  UpdatePostStatusRequest,
} from "../types";

const ENDPOINT = "/admin/posts";

export const adminPostApi = {
  /** GET /admin/posts/topics: list all post topics/categories. */
  getTopics: async (): Promise<TopicResponse[]> => {
    try {
      const response = await api.get<TopicResponse[]>(`${ENDPOINT}/topics`);
      return response.data || [];
    } catch {
      return [];
    }
  },

  /** POST /admin/posts/topics: create a new topic/category. */
  createTopic: async (payload: TopicCreateRequest): Promise<TopicResponse> => {
    const response = await api.post<TopicResponse>(`${ENDPOINT}/topics`, payload);
    return response.data;
  },

  /** PUT /admin/posts/topics/{topic_id}: update a topic/category. */
  updateTopic: async (topicId: number, payload: TopicUpdateRequest): Promise<TopicResponse> => {
    const response = await api.put<TopicResponse>(`${ENDPOINT}/topics/${topicId}`, payload);
    return response.data;
  },

  /** DELETE /admin/posts/topics/{topic_id}: delete a topic/category. */
  deleteTopic: async (topicId: number): Promise<{ id: number; message: string }> => {
    const response = await api.delete<{ id: number; message: string }>(`${ENDPOINT}/topics/${topicId}`);
    return response.data;
  },

  /** GET /admin/posts: list posts with filtering and pagination. */
  getPosts: async (
    params?: AdminPostQueryParams,
  ): Promise<AdminPostListResponse> => {
    const response = await api.get<AdminPostListResponse>(ENDPOINT, { params });
    return response.data;
  },

  /** GET /admin/posts/{post_id}: get a post for viewing or editing. */
  getPostById: async (postId: number): Promise<AdminPostDetailResponse> => {
    const response = await api.get<AdminPostDetailResponse>(`${ENDPOINT}/${postId}`);
    return response.data;
  },

  /** POST /admin/posts: create a post with optional file upload (Cloudinary). */
  createPost: async (
    payload: CreatePostRequest,
    file?: File | null,
  ): Promise<AdminPostDetailResponse> => {
    if (file) {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("slug", payload.slug);
      if (payload.summary) formData.append("summary", payload.summary);
      formData.append("content", payload.content);
      if (payload.topic_id !== undefined && payload.topic_id !== null) {
        formData.append("topic_id", String(payload.topic_id));
      }
      if (payload.status) formData.append("status", payload.status);
      if (payload.thumbnail_url) formData.append("thumbnail_url", payload.thumbnail_url);
      formData.append("file", file);

      const response = await api.post<AdminPostDetailResponse>(ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }

    const response = await api.post<AdminPostDetailResponse>(ENDPOINT, payload);
    return response.data;
  },

  /** PUT /admin/posts/{post_id}: update a post. */
  replacePost: async (
    postId: number,
    payload: UpdatePostRequest,
  ): Promise<AdminPostDetailResponse> => {
    const response = await api.put<AdminPostDetailResponse>(
      `${ENDPOINT}/${postId}`,
      payload,
    );
    return response.data;
  },

  /** PUT /admin/posts/{post_id}: update a post with optional new image file. */
  updatePost: async (
    postId: number,
    payload: UpdatePostRequest,
    file?: File | null,
  ): Promise<AdminPostDetailResponse> => {
    if (file) {
      const formData = new FormData();
      if (payload.title) formData.append("title", payload.title);
      if (payload.slug) formData.append("slug", payload.slug);
      if (payload.summary !== undefined) formData.append("summary", payload.summary ?? "");
      if (payload.content) formData.append("content", payload.content);
      if (payload.topic_id !== undefined) {
        formData.append("topic_id", payload.topic_id ? String(payload.topic_id) : "");
      }
      if (payload.status) formData.append("status", payload.status);
      if (payload.thumbnail_url !== undefined) {
        formData.append("thumbnail_url", payload.thumbnail_url ?? "");
      }
      formData.append("file", file);

      const response = await api.put<AdminPostDetailResponse>(
        `${ENDPOINT}/${postId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    }

    const response = await api.put<AdminPostDetailResponse>(
      `${ENDPOINT}/${postId}`,
      payload,
    );
    return response.data;
  },

  /** PATCH /admin/posts/{post_id}/status: publish, unpublish, or archive. */
  updatePostStatus: async (
    postId: number,
    payload: UpdatePostStatusRequest,
  ): Promise<AdminPostDetailResponse> => {
    const response = await api.patch<AdminPostDetailResponse>(
      `${ENDPOINT}/${postId}/status`,
      payload,
    );
    return response.data;
  },

  /** DELETE /admin/posts/{post_id}: permanently delete a post (Admin only). */
  deletePost: async (postId: number): Promise<DeletePostResponse> => {
    const response = await api.delete<DeletePostResponse>(`${ENDPOINT}/${postId}`);
    return response.data;
  },

  /** POST /admin/posts/{post_id}/restore: restore an archived post (Admin only). */
  restorePost: async (postId: number): Promise<AdminPostDetailResponse> => {
    const response = await api.post<AdminPostDetailResponse>(
      `${ENDPOINT}/${postId}/restore`,
    );
    return response.data;
  },
};
