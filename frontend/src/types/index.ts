export interface BlogImage {
  id: string;
  url: string;
  order: number;
}

export type CommentStatus = "pending" | "approved" | "rejected";

export interface Comment {
  id: string;
  senderName: string;
  message: string;
  status: CommentStatus;
  createdAt: string;
}

// Admin endpoint returns comment joined with its parent blog + blogId for context
export interface CommentWithBlog extends Comment {
  blogId: string;
  blog?: Pick<Blog, "id" | "title" | "slug">;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  viewCount: number;
  publishedAt: string;
  updatedAt: string;
  images: BlogImage[];
  comments?: Comment[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  publishedCount?: number;
  draftCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
