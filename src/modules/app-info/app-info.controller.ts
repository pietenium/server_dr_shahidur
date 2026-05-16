import { APP_INFO_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";
import { ApiError } from "@utils/ApiError";
import { ApiResponse } from "@utils/ApiResponse";
import { asyncHandler } from "@utils/asyncHandler";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { UpdateAppInfoPayload } from "./app-info.interface";
import { AppInfoService } from "./app-info.service";

const appInfoService = new AppInfoService();

export const appInfoController = {
  getAppInfo: asyncHandler(async (_req: Request, res: Response) => {
    const appInfo = await appInfoService.getAppInfo();

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

    // Get uploaded files
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const doctorImage = files?.doctorImage?.[0];
    const ogImage = files?.ogImage?.[0];

    const appInfo = await appInfoService.updateAppInfo(payload, {
      doctorImage,
      ogImage,
    });

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: APP_INFO_MESSAGES.UPDATED,
      data: appInfo,
    });
  }),
};
