import { Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  designation?: string;
  company?: string;
  content: string;
  image?: {
    url: string;
    fileId: string;
  };
  video?: {
    url: string;
    fileId: string;
  };
  rating: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestimonialPayload {
  name: string;
  designation?: string;
  company?: string;
  content: string;
  rating: number;
  isVisible?: boolean;
}

export interface UpdateTestimonialPayload extends Partial<CreateTestimonialPayload> {}
