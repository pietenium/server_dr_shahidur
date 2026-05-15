import mongoose, { Schema } from "mongoose";
import type { IArticleCategory } from "./article.interface";

const articleCategorySchema = new Schema<IArticleCategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export const ArticleCategory = mongoose.model<IArticleCategory>(
  "ArticleCategory",
  articleCategorySchema,
);
