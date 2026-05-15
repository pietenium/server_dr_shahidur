import { TESTIMONIAL_MESSAGES } from "@constants/messages.constant";
import { ApiError } from "@utils/ApiError";
import { deleteCache, getCache, setCache } from "@utils/cache";
import type {
  CreateTestimonialPayload,
  ITestimonial,
  UpdateTestimonialPayload,
} from "./testimonial.interface";
import { Testimonial } from "./testimonial.model";

export class TestimonialService {
  public async getTestimonials(
    adminView: boolean = false,
  ): Promise<ITestimonial[]> {
    if (!adminView) {
      const cacheKey = "cache:testimonials";
      const cached = await getCache<ITestimonial[]>(cacheKey);

      if (cached) {
        return cached;
      }
    }

    const filter: Record<string, unknown> = adminView
      ? {}
      : { isVisible: true };
    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });

    if (!adminView) {
      await setCache("cache:testimonials", testimonials, 600);
    }

    return testimonials;
  }

  public async createTestimonial(
    payload: CreateTestimonialPayload,
    image?: Express.Multer.File,
    video?: Express.Multer.File,
  ): Promise<ITestimonial> {
    const testimonialData: Partial<ITestimonial> = {
      name: payload.name,
      designation: payload.designation,
      company: payload.company,
      content: payload.content,
      rating: payload.rating,
      isVisible: payload.isVisible !== undefined ? payload.isVisible : true,
    };

    // Upload image to ImageKit
    if (image) {
      const { imagekit } = await import("@config/imagekit");
      const result = await imagekit.files.upload({
        file: image.buffer.toString("base64"),
        fileName: `testimonial-${Date.now()}`,
        folder: "/testimonials",
      });
      testimonialData.image = { url: result.url, fileId: result.fileId };
    }

    // Upload video to Cloudinary
    if (video) {
      const { cloudinaryUploader } = await import("@config/cloudinary");
      const result = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const uploadStream = cloudinaryUploader.upload_stream(
          { resource_type: "video", folder: "testimonials" },
          (error, result) => {
            if (error) {
              reject(
                new Error(
                  typeof error === "string"
                    ? error
                    : error?.message || "Upload failed",
                ),
              );
            } else {
              resolve(result as { secure_url: string; public_id: string });
            }
          },
        );
        uploadStream.end(video.buffer);
      });
      testimonialData.video = {
        url: result.secure_url,
        fileId: result.public_id,
      };
    }

    const testimonial = await Testimonial.create(testimonialData);

    // Invalidate cache
    await deleteCache("cache:testimonials");

    return testimonial;
  }

  public async updateTestimonial(
    id: string,
    payload: UpdateTestimonialPayload,
    image?: Express.Multer.File,
    video?: Express.Multer.File,
  ): Promise<ITestimonial> {
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      throw new ApiError(404, TESTIMONIAL_MESSAGES.NOT_FOUND);
    }

    if (payload.name) {
      testimonial.name = payload.name;
    }
    if (payload.designation !== undefined) {
      testimonial.designation = payload.designation;
    }
    if (payload.company !== undefined) {
      testimonial.company = payload.company;
    }
    if (payload.content) {
      testimonial.content = payload.content;
    }
    if (payload.rating) {
      testimonial.rating = payload.rating;
    }
    if (payload.isVisible !== undefined) {
      testimonial.isVisible = payload.isVisible;
    }

    // Handle image upload
    if (image) {
      // Delete old image from ImageKit
      if (testimonial.image?.fileId) {
        const { imagekit } = await import("@config/imagekit");
        await imagekit.files.delete(testimonial.image.fileId).catch(() => {});
      }
      const { imagekit } = await import("@config/imagekit");
      const result = await imagekit.files.upload({
        file: image.buffer.toString("base64"),
        fileName: `testimonial-${Date.now()}`,
        folder: "/testimonials",
      });
      testimonial.image = { url: result.url, fileId: result.fileId };
    }

    // Handle video upload
    if (video) {
      // Delete old video from Cloudinary
      if (testimonial.video?.fileId) {
        const { cloudinaryUploader } = await import("@config/cloudinary");
        await cloudinaryUploader.destroy(testimonial.video.fileId, {
          resource_type: "video",
        });
      }
      const { cloudinaryUploader } = await import("@config/cloudinary");
      const result = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const uploadStream = cloudinaryUploader.upload_stream(
          { resource_type: "video", folder: "testimonials" },
          (error, result) => {
            if (error) {
              reject(
                new Error(
                  typeof error === "string"
                    ? error
                    : error?.message || "Upload failed",
                ),
              );
            } else {
              resolve(result as { secure_url: string; public_id: string });
            }
          },
        );
        uploadStream.end(video.buffer);
      });
      testimonial.video = { url: result.secure_url, fileId: result.public_id };
    }

    await testimonial.save();

    // Invalidate cache
    await deleteCache("cache:testimonials");

    return testimonial;
  }

  public async deleteTestimonial(id: string): Promise<void> {
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      throw new ApiError(404, TESTIMONIAL_MESSAGES.NOT_FOUND);
    }

    // Delete image from ImageKit
    if (testimonial.image?.fileId) {
      const { imagekit } = await import("@config/imagekit");
      await imagekit.files.delete(testimonial.image.fileId).catch(() => {});
    }

    // Delete video from Cloudinary
    if (testimonial.video?.fileId) {
      const { cloudinaryUploader } = await import("@config/cloudinary");
      await cloudinaryUploader.destroy(testimonial.video.fileId, {
        resource_type: "video",
      });
    }

    await testimonial.deleteOne();

    // Invalidate cache
    await deleteCache("cache:testimonials");
  }

  public async getTestimonialById(id: string): Promise<ITestimonial> {
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      throw new ApiError(404, TESTIMONIAL_MESSAGES.NOT_FOUND);
    }

    return testimonial;
  }
}
