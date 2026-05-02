import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { analyticsService } from "./analytics.service";
import type { TrackPageViewPayload } from "./analytics.interface";

export const analyticsController = {
  track: asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";

    // Fire-and-forget: explicitly mark as ignored for linting
    void analyticsService.trackPageView(req.body as TrackPageViewPayload, ip, userAgent);

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Page view tracked",
      data: null,
    });

    await Promise.resolve();
  }),

  getGeoStats: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getGeoStats();

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Geo stats retrieved",
      data,
    });
  }),

  getPageStats: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getPageStats();

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Page stats retrieved",
      data,
    });
  }),
};
