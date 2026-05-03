import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IArticle } from "./article.interface";
import { CONTENT_STATUS, ARTICLE_TYPE } from "@constants/status.constant";

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
    articleType: { type: String, enum: Object.values(ARTICLE_TYPE), required: true },
    status: { type: String, enum: Object.values(CONTENT_STATUS), default: CONTENT_STATUS.DRAFT },
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

articleSchema.set("toJSON", {
  transform: (_doc, ret: { __v?: number }) => {
    delete ret.__v;
    return ret;
  },
});

articleSchema.plugin(mongoosePaginate);

// Indexes
articleSchema.index({ status: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ articleType: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ title: "text", content: "text", excerpt: "text" });

export const Article = mongoose.model<
  IArticle,
  mongoose.PaginateModel<IArticle>
>("Article", articleSchema);
