import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IArticle } from "./article.interface";

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    featuredImage: {
      url: String,
      fileId: String,
    },
    category: { type: Schema.Types.ObjectId, ref: "ArticleCategory", required: true },
    articleType: { type: String, enum: ["MEDICAL", "POLITICAL"], required: true },
    status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" },
    impressions: { type: Number, default: 0 },
    ogImage: {
      url: String,
      fileId: String,
    },
    author: { type: String },
    tags: [{ type: String }],
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

articleSchema.plugin(mongoosePaginate);

export const Article = mongoose.model<IArticle>("Article", articleSchema);
