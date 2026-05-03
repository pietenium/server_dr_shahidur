import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { ITestimonial } from "./testimonial.interface";

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: true,
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
      required: true,
      trim: true,
    },
    image: {
      url: String,
      fileId: String,
    },
    video: {
      url: String,
      fileId: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  },
);

testimonialSchema.plugin(mongoosePaginate);

// Index for visibility and creation date
testimonialSchema.index({ isVisible: 1, createdAt: -1 });
testimonialSchema.index({ name: "text", content: "text", company: "text" });

export const Testimonial = mongoose.model<
  ITestimonial,
  mongoose.PaginateModel<ITestimonial>
>("Testimonial", testimonialSchema);
