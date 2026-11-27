import { create } from "zustand";
import { parseErrorMessage } from "@/lib/axios/parseError";
import { adminPostApi } from "../api";
import type {
  AdminPostDetailResponse,
  AdminPostListItemResponse,
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

interface AdminPostState {
  posts: AdminPostListItemResponse[];
  topics: TopicResponse[];
  selectedPost: AdminPostDetailResponse | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  queryParams: AdminPostQueryParams;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  setQueryParams: (params: Partial<AdminPostQueryParams>) => void;
  clearError: () => void;
  clearSelectedPost: () => void;
  reset: () => void;

  fetchTopics: () => Promise<TopicResponse[]>;
  createTopic: (payload: TopicCreateRequest) => Promise<TopicResponse | null>;
  updateTopic: (topicId: number, payload: TopicUpdateRequest) => Promise<TopicResponse | null>;
  deleteTopic: (topicId: number) => Promise<boolean>;
  fetchPosts: (
    params?: Partial<AdminPostQueryParams>,
  ) => Promise<AdminPostListResponse | null>;
  fetchPostById: (postId: number) => Promise<AdminPostDetailResponse | null>;
  createPost: (
    payload: CreatePostRequest,
    file?: File | null,
  ) => Promise<AdminPostDetailResponse | null>;
  replacePost: (
    postId: number,
    payload: UpdatePostRequest,
  ) => Promise<AdminPostDetailResponse | null>;
  updatePost: (
    postId: number,
    payload: UpdatePostRequest,
    file?: File | null,
  ) => Promise<AdminPostDetailResponse | null>;
  updatePostStatus: (
    postId: number,
    payload: UpdatePostStatusRequest,
  ) => Promise<AdminPostDetailResponse | null>;
  deletePost: (postId: number) => Promise<DeletePostResponse | null>;
  restorePost: (postId: number) => Promise<AdminPostDetailResponse | null>;
}

const initialQueryParams: AdminPostQueryParams = {
  page: 1,
  page_size: 10,
};

const initialState = {
  posts: [],
  topics: [],
  selectedPost: null,
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  queryParams: initialQueryParams,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const useAdminPostStore = create<AdminPostState>((set, get) => ({
  ...initialState,

  setQueryParams: (params) =>
    set((state) => {
      const queryParams = { ...state.queryParams, ...params };
      return {
        queryParams,
        page: queryParams.page ?? state.page,
        pageSize: queryParams.page_size ?? state.pageSize,
      };
    }),
  clearError: () => set({ error: null }),
  clearSelectedPost: () => set({ selectedPost: null }),
  reset: () => set(initialState),

  fetchTopics: async () => {
    try {
      const topics = await adminPostApi.getTopics();
      set({ topics });
      return topics;
    } catch {
      return [];
    }
  },

  createTopic: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const topic = await adminPostApi.createTopic(payload);
      await get().fetchTopics();
      return topic;
    } catch (error: unknown) {
      set({ error: parseErrorMessage(error, "Không thể tạo danh mục") });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateTopic: async (topicId, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const topic = await adminPostApi.updateTopic(topicId, payload);
      await get().fetchTopics();
      return topic;
    } catch (error: unknown) {
      set({ error: parseErrorMessage(error, "Không thể cập nhật danh mục") });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteTopic: async (topicId) => {
    set({ isSubmitting: true, error: null });
    try {
      await adminPostApi.deleteTopic(topicId);
      await get().fetchTopics();
      await get().fetchPosts();
      return true;
    } catch (error: unknown) {
      set({ error: parseErrorMessage(error, "Không thể xóa danh mục") });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchPosts: async (params) => {
    const queryParams = { ...get().queryParams, ...params };
    set({ isLoading: true, error: null });
    try {
      const result = await adminPostApi.getPosts(queryParams);
      set({
        posts: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.page_size,
        totalPages: result.total_pages,
        queryParams,
        isLoading: false,
      });
      return result;
    } catch (error: unknown) {
      set({
        error: parseErrorMessage(error, "Không thể tải danh sách bài viết"),
        isLoading: false,
      });
      return null;
    }
  },

  fetchPostById: async (postId) => {
    set({ isLoading: true, error: null, selectedPost: null });
    try {
      const post = await adminPostApi.getPostById(postId);
      set({ selectedPost: post, isLoading: false });
      return post;
    } catch (error: unknown) {
      set({
        error: parseErrorMessage(error, "Không thể tải chi tiết bài viết"),
        isLoading: false,
      });
      return null;
    }
  },

  createPost: async (payload, file) => {
    set({ isSubmitting: true, error: null });
    try {
      const post = await adminPostApi.createPost(payload, file);
      set({ selectedPost: post });
      await get().fetchPosts();
      return post;
    } catch (error: unknown) {
      set({ error: parseErrorMessage(error, "Không thể tạo bài viết") });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  replacePost: async (postId, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const post = await adminPostApi.replacePost(postId, payload);
      set({ selectedPost: post });
      await get().fetchPosts();
      return post;
    } catch (error: unknown) {
      set({ error: parseErrorMessage(error, "Không thể cập nhật bài viết") });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePost: async (postId, payload, file) => {
    set({ isSubmitting: true, error: null });
    try {
      const post = await adminPostApi.updatePost(postId, payload, file);
      set({ selectedPost: post });
      await get().fetchPosts();
      return post;
    } catch (error: unknown) {
      set({ error: parseErrorMessage(error, "Không thể cập nhật bài viết") });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePostStatus: async (postId, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const post = await adminPostApi.updatePostStatus(postId, payload);
      set({ selectedPost: post });
      await get().fetchPosts();
      return post;
    } catch (error: unknown) {
      set({ error: parseErrorMessage(error, "Không thể thay đổi trạng thái bài viết") });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deletePost: async (postId) => {
    set({ isSubmitting: true, error: null });
    try {
      const result = await adminPostApi.deletePost(postId);
      const { posts, page, pageSize, selectedPost } = get();
      const nextPage = posts.length === 1 && page > 1 ? page - 1 : page;
      if (selectedPost?.id === postId) set({ selectedPost: null });
      await get().fetchPosts({ page: nextPage, page_size: pageSize });
      return result;
    } catch (error: unknown) {
      set({ error: parseErrorMessage(error, "Không thể xóa bài viết") });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  restorePost: async (postId) => {
    set({ isSubmitting: true, error: null });
    try {
      const post = await adminPostApi.restorePost(postId);
      set({ selectedPost: post });
      await get().fetchPosts();
      return post;
    } catch (error: unknown) {
      set({ error: parseErrorMessage(error, "Không thể khôi phục bài viết") });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
