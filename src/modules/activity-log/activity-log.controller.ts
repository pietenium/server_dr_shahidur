import { AUTH_MESSAGES, LOG_MESSAGES } from "@constants/messages.constant";
import { ApiError } from "@utils/ApiError";
import { ApiResponse } from "@utils/ApiResponse";
import { asyncHandler } from "@utils/asyncHandler";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type {
  BulkDeletePayload,
  LogFilterQuery,
} from "./activity-log.interface";
import { activityLogService } from "./activity-log.service";

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
