import { Document, Types, Model } from "mongoose";
import { PaginateResult } from "mongoose-paginate-v2";
import { UploadType, ContentStatus } from "@constants/status.constant";
import { OgImage } from "@types-app/global.types";

export interface IResearch extends Document {
  title: string;
  slug: string;
  abstract: string;
  uploadType: UploadType;
  pdfFile?: {
    url: string;
    fileId: string;
  };
  doiLink?: string;
  status: ContentStatus;
  category?: string;
  ogImage?: OgImage;
}

export interface CreateResearchPayload {
  title: string;
  abstract: string;
  uploadType: UploadType;
  doiLink?: string;
  status: ContentStatus;
  category?: string;
}

export interface UpdateResearchPayload extends Partial<CreateResearchPayload> {}

export interface ResearchFilterQuery {
  status?: ContentStatus;
  uploadType?: UploadType;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export type ResearchModel = Model<IResearch> & {
  paginate: (
    filter: object,
    options: object,
  ) => Promise<PaginateResult<IResearch>>;
};
