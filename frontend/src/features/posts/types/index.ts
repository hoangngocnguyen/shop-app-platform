export interface PublicTopic {
  id: number;
  name: string;
  slug: string;
  posts_count: number;
}

export interface PublicPostListItem {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  thumbnail_url: string | null;
  topic_id: number | null;
  topic_name: string | null;
  topic_slug: string | null;
  author_name: string | null;
  published_at: string | null;
  created_at: string;
}

export interface PublicPostDetail extends PublicPostListItem {
  content: string;
  related_posts: PublicPostListItem[];
}

export interface PublicPostListResponse {
  items: PublicPostListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
