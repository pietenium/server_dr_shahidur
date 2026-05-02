import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IResearch } from "./research.interface";

const researchSchema = new Schema<IResearch>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    uploadType: { type: String, enum: ["PDF", "DOI"], required: true },
    pdfFile: {
      url: String,
      fileId: String,
    },
    doiUrl: { type: String },
    doiNumber: { type: String },
    thumbnailImage: {
      url: String,
      fileId: String,
    },
    status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  },
);

researchSchema.plugin(mongoosePaginate);

// Indexes
researchSchema.index({ status: 1 });
researchSchema.index({ uploadType: 1 });
researchSchema.index({ title: "text", description: "text" });

export const Research = mongoose.model<
  IResearch,
  mongoose.PaginateModel<IResearch>
>("Research", researchSchema);
