import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { ITestimonial } from "./testimonial.interface";

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    designation: { type: String },
    company: { type: String },
    content: { type: String, required: true },
    image: {
      url: String,
      fileId: String,
    },
    video: {
      url: String,
      fileId: String,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

testimonialSchema.plugin(mongoosePaginate);

export const Testimonial = mongoose.model<ITestimonial>("Testimonial", testimonialSchema);
