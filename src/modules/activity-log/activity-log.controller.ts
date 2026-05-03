import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { activityLogService } from "./activity-log.service";
import type { LogFilterQuery, BulkDeletePayload } from "./activity-log.interface";

export const activityLogController = {
  getLogs: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as LogFilterQuery;
    const result = await activityLogService.getLogs(query);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Activity logs fetched successfully",
      data: result,
    });
  }),

  deleteById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await activityLogService.deleteById(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Activity log deleted successfully",
      data: null,
    });
  }),

  bulkDelete: asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body as BulkDeletePayload;
    const result = await activityLogService.bulkDelete(ids);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: `${result.deletedCount} activity log(s) deleted successfully`,
      data: result,
    });
  }),

  clearAll: asyncHandler(async (_req: Request, res: Response) => {
    const result = await activityLogService.clearAll();

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "All activity logs cleared successfully",
      data: result,
    });
  }),
};
