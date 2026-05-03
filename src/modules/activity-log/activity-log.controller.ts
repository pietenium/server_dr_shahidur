import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { activityLogService } from "./activity-log.service";
import { ApiError } from "@utils/ApiError";
import type { LogFilterQuery, BulkDeletePayload } from "./activity-log.interface";
import { LOG_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";

export const activityLogController = {
  getLogs: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const query = req.query as unknown as LogFilterQuery;
    const result = await activityLogService.getLogs(query, req.user);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: LOG_MESSAGES.FETCHED,
      data: result,
    });
  }),

  deleteById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const { id } = req.params;
    await activityLogService.deleteById(id as string, req.user);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: LOG_MESSAGES.DELETED,
      data: null,
    });
  }),

  bulkDelete: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const { ids } = req.body as BulkDeletePayload;
    const result = await activityLogService.bulkDelete(ids, req.user);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: LOG_MESSAGES.DELETED,
      data: result,
    });
  }),

  clearAll: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const result = await activityLogService.clearAll(req.user);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: LOG_MESSAGES.CLEARED,
      data: result,
    });
  }),
};
