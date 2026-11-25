export enum PostStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export type CreatePostStatus = PostStatus.DRAFT | PostStatus.PENDING;

export interface TopicResponse {
  id: number;
  name: string;
  slug: string;
}

export interface TopicCreateRequest {
  name: string;
  slug: string;
}

export interface TopicUpdateRequest {
  name?: string;
  slug?: string;
}

export interface AdminPostQueryParams {
  page?: number;
  page_size?: number;
  status?: PostStatus;
  topic_id?: number;
  search?: string;
}

export interface CreatePostRequest {
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  thumbnail_url?: string | null;
  topic_id?: number | null;
  status?: CreatePostStatus;
}

/** Fields omitted from this object are left unchanged by the backend. */
export interface UpdatePostRequest {
  title?: string;
  slug?: string;
  summary?: string | null;
  content?: string;
  thumbnail_url?: string | null;
  topic_id?: number | null;
  status?: PostStatus;
}

export interface UpdatePostStatusRequest {
  status: PostStatus;
}

export interface DeletePostResponse {
  id: number;
}

export interface AdminPostListItemResponse {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  thumbnail_url: string | null;
  topic_id: number | null;
  topic_name: string | null;
  author_id: string;
  author_name: string | null;
  status: PostStatus;
  views: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminPostDetailResponse extends AdminPostListItemResponse {
  content: string;
}

export interface AdminPostListResponse {
  items: AdminPostListItemResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
