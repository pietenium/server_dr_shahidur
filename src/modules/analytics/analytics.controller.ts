import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { analyticsService } from "./analytics.service";
import type { TrackPageViewPayload } from "./analytics.interface";

export const analyticsController = {
  track: asyncHandler(async (req: Request, res: Response) => {
    const record = await analyticsService.trackPageView(req.body as TrackPageViewPayload);
    new ApiResponse(201, "Page view tracked", record).send(res);
  }),
};
