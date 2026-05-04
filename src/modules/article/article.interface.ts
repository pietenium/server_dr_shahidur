import type { Document, Types } from "mongoose";
import type { ArticleType, ContentStatus } from "@constants/status.constant";

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
    url: string;
    fileId: string;
  };
  category: Types.ObjectId | IArticleCategory;
  articleType: ArticleType;
  status: ContentStatus;
  impressions: number;
  ogImage?: {
    url: string;
    fileId: string;
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
}

// ArticleType is re-exported from @constants/status.constant
export type { ArticleType };
