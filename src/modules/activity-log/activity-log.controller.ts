import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";

export const activityLogController = {
  getLogs: asyncHandler(async (_req: Request, res: Response) => {
    await Promise.resolve();
    new ApiResponse(200, "Logs retrieved", []).send(res);
  }),
};
