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
  { timestamps: true },
);

researchSchema.plugin(mongoosePaginate);

export const Research = mongoose.model<IResearch>("Research", researchSchema);
