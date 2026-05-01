import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";

export const activityLogController = {
  getLogs: asyncHandler(async (_req: Request, res: Response) => {
    await Promise.resolve();
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Logs retrieved",
      data: [],
    });
  }),
};
