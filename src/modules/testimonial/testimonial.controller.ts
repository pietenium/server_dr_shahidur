import {
  AUTH_MESSAGES,
  TESTIMONIAL_MESSAGES,
} from "@constants/messages.constant";
import { ApiError } from "@utils/ApiError";
import { ApiResponse } from "@utils/ApiResponse";
import { asyncHandler } from "@utils/asyncHandler";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type {
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
} from "./testimonial.interface";
import { TestimonialService } from "./testimonial.service";

const testimonialService = new TestimonialService();

export const testimonialController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const payload = req.body as CreateTestimonialPayload;
    const uploadFiles = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;
    const image = uploadFiles?.["image"]?.[0];
    const video = uploadFiles?.["video"]?.[0];

    const testimonial = await testimonialService.createTestimonial(
      payload,
      image,
      video,
    );

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: TESTIMONIAL_MESSAGES.CREATED,
      data: testimonial,
    });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    // Check if the route is /admin
    const isPublicRoute = !req.originalUrl.includes("/admin");
    const adminView = !isPublicRoute;

    const testimonials = await testimonialService.getTestimonials(adminView);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: TESTIMONIAL_MESSAGES.FETCHED,
      data: testimonials,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { id } = req.params;
    const testimonial = await testimonialService.getTestimonialById(
      id as string,
    );

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: TESTIMONIAL_MESSAGES.FETCHED,
      data: testimonial,
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { id } = req.params;
    const payload = req.body as UpdateTestimonialPayload;
    const uploadFiles = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;
    const image = uploadFiles?.["image"]?.[0];
    const video = uploadFiles?.["video"]?.[0];

    const testimonial = await testimonialService.updateTestimonial(
      id as string,
      payload,
      image,
      video,
    );

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: TESTIMONIAL_MESSAGES.UPDATED,
      data: testimonial,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { id } = req.params;
    await testimonialService.deleteTestimonial(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: TESTIMONIAL_MESSAGES.DELETED,
      data: null,
    });
  }),
};
