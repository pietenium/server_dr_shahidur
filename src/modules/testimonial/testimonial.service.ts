import { Testimonial } from "./testimonial.model";
import type { ITestimonial, CreateTestimonialPayload } from "./testimonial.interface";

export const testimonialService = {
  create: async (payload: CreateTestimonialPayload): Promise<ITestimonial> => {
    return Testimonial.create(payload);
  },
};
