import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { appInfoService } from "./app-info.service";
import type { UpdateAppInfoPayload } from "./app-info.interface";

export const appInfoController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    const data = await appInfoService.get();
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "App info retrieved",
      data,
    });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await appInfoService.update(req.body as UpdateAppInfoPayload);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "App info updated",
      data,
    });
  }),
};
