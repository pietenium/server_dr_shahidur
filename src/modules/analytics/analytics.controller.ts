import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { analyticsService } from "./analytics.service";
import type { TrackPageViewPayload } from "./analytics.interface";
import {
  ANALYTICS_MESSAGES,
  AUTH_MESSAGES,
} from "@constants/messages.constant";

export const analyticsController = {
  track: asyncHandler((req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";

    // Fire-and-forget: explicitly mark as ignored for linting
    void analyticsService.trackPageView(
      req.body as TrackPageViewPayload,
      ip,
      userAgent,
    );

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: ANALYTICS_MESSAGES.TRACKED,
      data: null,
    });

    return Promise.resolve();
  }),

  getGeoStats: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const data = await analyticsService.getGeoStats();

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ANALYTICS_MESSAGES.STATS_RETRIEVED,
      data,
    });
  }),

  getPageStats: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const data = await analyticsService.getPageStats();

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ANALYTICS_MESSAGES.STATS_RETRIEVED,
      data,
    });
  }),

  // New: Get specific page statistics
  getSpecificPageStats: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { pageSlug } = req.params;
    const { startDate: startDateQuery, endDate: endDateQuery } = req.query;

    const parseQueryParam = (value: unknown): string | undefined => {
      if (Array.isArray(value)) {
        return typeof value[0] === "string" ? value[0] : undefined;
      }

      return typeof value === "string" ? value : undefined;
    };

    const startDate = parseQueryParam(startDateQuery);
    const endDate = parseQueryParam(endDateQuery);

    const data = await analyticsService.getSpecificPageStats(
      pageSlug as string,
      {
        startDate,
        endDate,
      },
    );

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ANALYTICS_MESSAGES.STATS_RETRIEVED,
      data,
    });
  }),
};
