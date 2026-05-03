import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import type { UpdateAppInfoPayload } from "./app-info.interface";
import { appInfoService } from "./app-info.service";

export const appInfoController = {
    getAppInfo: asyncHandler(async (_req: Request, res: Response) => {
        const appInfo = await appInfoService.getAppInfo();

        ApiResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Application information fetched successfully",
            data: appInfo,
        });
    }),

    updateAppInfo: asyncHandler(async (req: Request, res: Response) => {
        const payload = req.body as UpdateAppInfoPayload;
        const appInfo = await appInfoService.updateAppInfo(payload);

        ApiResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Application information updated successfully",
            data: appInfo,
        });
    }),
};