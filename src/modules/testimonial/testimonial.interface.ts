import type { Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  designation?: string;
  company?: string;
  content: string;
  image?: {
    url: string | undefined;
    fileId: string | undefined;
  };
  video?: {
    url: string | undefined;
    fileId: string | undefined;
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
  image?: {
    url: string | undefined;
    fileId: string | undefined;
  };
  video?: {
    url: string | undefined;
    fileId: string | undefined;
  };
  isVisible?: boolean;
}

export type UpdateTestimonialPayload = Partial<CreateTestimonialPayload>;
