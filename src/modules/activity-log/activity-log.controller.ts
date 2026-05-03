import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { activityLogService } from "./activity-log.service";
import { ApiError } from "@utils/ApiError";
import type { LogFilterQuery, BulkDeletePayload } from "./activity-log.interface";

export const activityLogController = {
  getLogs: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as LogFilterQuery;
    if (!req.user) {throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");}
    const result = await activityLogService.getLogs(query, req.user);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Activity logs fetched successfully",
      data: result,
    });
  }),

  deleteById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!req.user) {throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");}
    await activityLogService.deleteById(id as string, req.user);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Activity log deleted successfully",
      data: null,
    });
  }),

  bulkDelete: asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body as BulkDeletePayload;
    if (!req.user) {throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");}
    const result = await activityLogService.bulkDelete(ids, req.user);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: `${result.deletedCount} activity log(s) deleted successfully`,
      data: result,
    });
  }),

  clearAll: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");}
    const result = await activityLogService.clearAll(req.user);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Activity logs cleared successfully",
      data: result,
    });
  }),
};
