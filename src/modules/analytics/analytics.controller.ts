import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { analyticsService } from "./analytics.service";
import type { TrackPageViewPayload } from "./analytics.interface";

export const analyticsController = {
  track: asyncHandler(async (req: Request, res: Response) => {
    const record = await analyticsService.trackPageView(req.body as TrackPageViewPayload);
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Page view tracked",
      data: record,
    });
  }),
};
