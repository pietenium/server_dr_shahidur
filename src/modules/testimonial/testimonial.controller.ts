import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { testimonialService } from "./testimonial.service";
import type { CreateTestimonialPayload, UpdateTestimonialPayload } from "./testimonial.interface";
import { TESTIMONIAL_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";

export const testimonialController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const payload = req.body as CreateTestimonialPayload;
    const testimonial = await testimonialService.create(payload);

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

    const result = await testimonialService.getAll(!isPublicRoute);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: TESTIMONIAL_MESSAGES.FETCHED,
      data: result,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { id } = req.params;
    const testimonial = await testimonialService.getById(id as string);

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
    const testimonial = await testimonialService.update(id as string, payload);

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
    await testimonialService.delete(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: TESTIMONIAL_MESSAGES.DELETED,
      data: null,
    });
  }),
};
