import type { Document } from "mongoose";
import type { UploadType, ContentStatus } from "@constants/status.constant";

export interface IResearch extends Document {
  title: string;
  slug: string;
  description?: string;
  uploadType: UploadType;
  pdfFile?: {
    url: string | undefined;
    fileId: string | undefined;
  };
  doiUrl?: string;
  doiNumber?: string;
  thumbnailImage?: {
    url: string | undefined;
    fileId: string | undefined;
  };
  status: ContentStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// UploadType is imported from @constants/status.constant
export type { UploadType };

export interface CreateResearchPayload {
  title: string;
  description?: string;
  uploadType: UploadType;
  pdfFile?: {
    url: string;
    fileId: string;
  };
  doiUrl?: string;
  thumbnailImage?: {
    url: string;
    fileId: string;
  };
  status?: ContentStatus;
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
