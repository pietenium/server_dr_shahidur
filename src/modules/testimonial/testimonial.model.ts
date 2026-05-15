import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { ITestimonial } from "./testimonial.interface";

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [1000, "Content cannot exceed 1000 characters"],
    },
    image: {
      url: { type: String },
      fileId: { type: String },
    },
    video: {
      url: { type: String },
      fileId: { type: String },
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

testimonialSchema.index({ isVisible: 1, createdAt: -1 });
testimonialSchema.index({ rating: -1 });

testimonialSchema.plugin(mongoosePaginate);

export const Testimonial = mongoose.model<
  ITestimonial,
  mongoose.PaginateModel<ITestimonial>
>("Testimonial", testimonialSchema);
