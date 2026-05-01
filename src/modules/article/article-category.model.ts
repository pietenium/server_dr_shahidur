import mongoose, { Schema } from "mongoose";
import type { IArticleCategory } from "./article.interface";

const articleCategorySchema = new Schema<IArticleCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true },
);

export const ArticleCategory = mongoose.model<IArticleCategory>("ArticleCategory", articleCategorySchema);
