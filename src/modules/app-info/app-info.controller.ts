import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import type { UpdateAppInfoPayload } from "./app-info.interface";
import { AppInfoService } from "./app-info.service";
import { APP_INFO_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";

const appInfoService = new AppInfoService();

export const appInfoController = {
  getAppInfo: asyncHandler(async (_req: Request, res: Response) => {
    const appInfo = await (
      appInfoService as { getAppInfo: () => Promise<unknown> }
    ).getAppInfo();

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: APP_INFO_MESSAGES.FETCHED,
      data: appInfo,
    });
  }),

  updateAppInfo: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const payload = req.body as UpdateAppInfoPayload;
    const appInfo = await appInfoService.updateAppInfo(payload);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: APP_INFO_MESSAGES.UPDATED,
      data: appInfo,
    });
  }),
};
