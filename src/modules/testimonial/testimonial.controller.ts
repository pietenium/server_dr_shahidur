import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { testimonialService } from "./testimonial.service";
import type { CreateTestimonialPayload } from "./testimonial.interface";

export const testimonialController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await testimonialService.create(req.body as CreateTestimonialPayload);
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Testimonial created",
      data: record,
    });
  }),
};
