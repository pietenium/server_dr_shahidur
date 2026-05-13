import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IArticle } from "./article.interface";

const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    featuredImage: {
      url: { type: String },
      fileId: { type: String },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "ArticleCategory",
      required: [true, "Category is required"],
    },
    articleType: {
      type: String,
      enum: ["MEDICAL", "POLITICAL"],
      required: [true, "Article type is required"],
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },
    impressions: {
      type: Number,
      default: 0,
    },
    ogImage: {
      url: { type: String },
      fileId: { type: String },
    },
    author: {
      type: String,
      trim: true,
    },
    tags: [{ type: String, trim: true }],
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

articleSchema.index({ status: 1, articleType: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ title: "text", content: "text" });

articleSchema.plugin(mongoosePaginate);

export const Article = mongoose.model<
  IArticle,
  mongoose.PaginateModel<IArticle>
>("Article", articleSchema);
