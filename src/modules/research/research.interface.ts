import { Document } from "mongoose";

export interface IResearch extends Document {
  title: string;
  slug: string;
  description?: string;
  uploadType: "PDF" | "DOI";
  pdfFile?: {
    url: string;
    fileId: string;
  };
  doiUrl?: string;
  doiNumber?: string;
  thumbnailImage?: {
    url: string;
    fileId: string;
  };
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UploadType = "PDF" | "DOI";

export interface CreateResearchPayload {
  title: string;
  description?: string;
  uploadType: "PDF" | "DOI";
  doiUrl?: string;
  status?: "DRAFT" | "PUBLISHED";
  publishedAt?: string;
}

export type UpdateResearchPayload = Partial<CreateResearchPayload>;

export interface ResearchFilterQuery {
  status?: string;
  uploadType?: string;
  search?: string;
  page?: number;
  limit?: number;
}
