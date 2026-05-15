import type { ArticleType, ContentStatus } from "@constants/status.constant";
import type { Document, Types } from "mongoose";

export interface IArticleCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: {
    url: string | undefined;
    fileId: string | undefined;
  };
  category: Types.ObjectId | IArticleCategory;
  articleType: ArticleType;
  status: ContentStatus;
  impressions: number;
  ogImage?: {
    url: string | undefined;
    fileId: string | undefined;
  };
  author?: string;
  tags?: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticlePayload {
  title: string;
  content: string;
  excerpt?: string;
  category: string | Types.ObjectId;
  articleType: ArticleType;
  status?: ContentStatus;
  author?: string;
  tags?: string[];
  publishedAt?: string;
}

export type UpdateArticlePayload = Partial<CreateArticlePayload>;

export interface ArticleFilterQuery {
  status?: string;
  category?: string;
  articleType?: string;
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sort?: string;
  minImpressions?: number;
}

// New interfaces for featured and top articles
export interface FeaturedArticlesQuery {
  limit?: number;
  minImpressions?: number;
}

export interface TopArticlesByCategoryQuery {
  categoryId?: string;
  limit?: number;
  articleType?: ArticleType;
}

export interface ImpressionIncreasePayload {
  articleId: string;
  sessionId: string;
  visitorId?: string;
  hoverDuration?: number; // in milliseconds
}

// ArticleType is re-exported from @constants/status.constant
export type { ArticleType };
