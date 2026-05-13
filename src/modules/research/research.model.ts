import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IResearch } from "./research.interface";

const researchSchema = new Schema<IResearch>(
  {
    title: {
      type: String,
      required: [true, "Research title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
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
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    uploadType: {
      type: String,
      enum: ["PDF", "DOI"],
      required: [true, "Upload type is required"],
    },
    pdfFile: {
      url: { type: String },
      fileId: { type: String },
    },
    doiUrl: {
      type: String,
    },
    doiNumber: {
      type: String,
    },
    thumbnailImage: {
      url: { type: String },
      fileId: { type: String },
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

researchSchema.plugin(mongoosePaginate);

researchSchema.index({ status: 1, uploadType: 1 });
researchSchema.index({ createdAt: -1 });
researchSchema.index({ title: "text", description: "text" });

export const Research = mongoose.model<IResearch>("Research", researchSchema);
