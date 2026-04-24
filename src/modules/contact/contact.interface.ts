import { Document, Model } from "mongoose";
import { PaginateResult } from "mongoose-paginate-v2";

export type ContactReason = "medical-inquiry" | "general" | "media" | "other";

export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  reason: ContactReason;
  message: string;
  recaptchaToken: string;
}

export interface CreateContactPayload {
  name: string;
  email: string;
  phone: string;
  reason: ContactReason;
  message: string;
  recaptchaToken: string;
}

export interface ContactFilterQuery {
  reason?: ContactReason;
  search?: string;
  page?: number;
  limit?: number;
}

export type ContactModel = Model<IContact> & {
  paginate: (
    filter: object,
    options: object,
  ) => Promise<PaginateResult<IContact>>;
};
