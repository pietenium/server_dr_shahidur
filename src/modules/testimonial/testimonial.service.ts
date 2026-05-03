import { Testimonial } from "./testimonial.model";
import type {
  ITestimonial,
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
} from "./testimonial.interface";
import { getCache, setCache, deleteCache } from "@utils/cache";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { imagekit } from "@config/imagekit";
import cloudinary from "@config/cloudinary";
import { logger } from "@utils/logger";


const CACHE_KEY = "cache:testimonials";
const CACHE_TTL = 600; // 10 minutes

export const testimonialService = {
  create: async (payload: CreateTestimonialPayload): Promise<ITestimonial> => {
    const testimonial = await Testimonial.create(payload);

    // Invalidate cache
    void deleteCache(CACHE_KEY);

    return testimonial;
  },

  getAll: async (isAdmin = false): Promise<unknown> => {
    // Try cache for public requests
    if (!isAdmin) {
      const cached = await getCache<unknown>(CACHE_KEY);
      if (cached) {
        return cached;
      }
    }

    const filter = isAdmin ? {} : { isVisible: true };
    const options = {
      page: 1,
      limit: 100, // Fetch all testimonials as they are usually few
      sort: "-createdAt",
    };

    const model = Testimonial;
    const results = await model.paginate(filter, options);

    // Cache results for public requests
    if (!isAdmin) {
      void setCache(CACHE_KEY, results, CACHE_TTL);
    }

    return results;
  },

  getById: async (id: string): Promise<ITestimonial> => {
    const testimonial = await Testimonial.findOne({ _id: { $eq: id } });
    if (!testimonial) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Testimonial not found");
    }
    return testimonial;
  },

  update: async (id: string, payload: UpdateTestimonialPayload): Promise<ITestimonial> => {

    const safePayload: Partial<UpdateTestimonialPayload> = {};
    if (payload.name !== undefined) { safePayload.name = payload.name; }
    if (payload.designation !== undefined) { safePayload.designation = payload.designation; }
    if (payload.company !== undefined) { safePayload.company = payload.company; }
    if (payload.content !== undefined) { safePayload.content = payload.content; }
    if (payload.rating !== undefined) { safePayload.rating = payload.rating; }
    if (payload.isVisible !== undefined) { safePayload.isVisible = payload.isVisible; }
    if (payload.image !== undefined) { safePayload.image = payload.image; }
    if (payload.video !== undefined) { safePayload.video = payload.video; }

    const testimonial = await Testimonial.findOneAndUpdate(
      { _id: { $eq: id } },
      { $set: safePayload },
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Testimonial not found");
    }

    // Invalidate cache
    void deleteCache(CACHE_KEY);

    return testimonial;
  },

  delete: async (id: string): Promise<void> => {
    const testimonial = await Testimonial.findOne({ _id: { $eq: id } });
    if (!testimonial) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Testimonial not found");
    }

    // Delete assets
    const deletePromises: Promise<unknown>[] = [];

    if (testimonial.image?.fileId) {
      deletePromises.push(imagekit.files.delete(testimonial.image.fileId));
    }

    if (testimonial.video?.fileId) {
      // Video assets are stored on Cloudinary
      deletePromises.push(cloudinary.uploader.destroy(testimonial.video.fileId, { resource_type: "video" }));
    }

    try {
      await Promise.all(deletePromises);
    } catch (err) {
      logger.error("Error deleting Testimonial assets:", err);
    }

    await Testimonial.findOneAndDelete({ _id: { $eq: id } });

    // Invalidate cache
    void deleteCache(CACHE_KEY);
  },
};
