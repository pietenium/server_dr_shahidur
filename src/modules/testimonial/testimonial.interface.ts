import { Document, Model } from "mongoose";
import { PaginateResult } from "mongoose-paginate-v2";

export interface ITestimonial extends Document {
  text: string;
  authorName: string;
  authorDesignation: string;
  imageUrl?: string;
  rating: number;
}

export interface CreateTestimonialPayload {
  text: string;
  authorName: string;
  authorDesignation: string;
  imageUrl?: string;
  rating: number;
}

export interface UpdateTestimonialPayload extends Partial<CreateTestimonialPayload> {}

export type TestimonialModel = Model<ITestimonial> & {
  paginate: (
    filter: object,
    options: object,
  ) => Promise<PaginateResult<ITestimonial>>;
};
