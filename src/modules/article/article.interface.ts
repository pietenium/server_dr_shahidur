import { Document, Types, Model } from "mongoose";
import { PaginateResult } from "mongoose-paginate-v2";
import { ArticleType, ContentStatus } from "@constants/status.constant";
import { OgImage } from "@types-app/global.types";

export interface IArticleCategory extends Document {
  name: string;
  slug: string;
}

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string; // TipTap HTML
  excerpt: string;
  category: Types.ObjectId | IArticleCategory;
  type: ArticleType;
  status: ContentStatus;
  ogImage?: OgImage;
  impressions: number;
  publishedAt?: Date;
}

export interface CreateArticlePayload {
  title: string;
  content: string;
  excerpt: string;
  category: string; // ID as string
  type: ArticleType;
  status: ContentStatus;
  publishedAt?: string;
}

export interface UpdateArticlePayload extends Partial<CreateArticlePayload> {}

export interface ArticleFilterQuery {
  type?: ArticleType;
  status?: ContentStatus;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export type ArticleModel = Model<IArticle> & {
  paginate: (
    filter: object,
    options: object,
  ) => Promise<PaginateResult<IArticle>>;
};
