import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { appInfoService } from "./app-info.service";
import type { UpdateAppInfoPayload } from "./app-info.interface";

export const appInfoController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    const data = await appInfoService.get();
    new ApiResponse(200, "App info retrieved", data).send(res);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await appInfoService.update(req.body as UpdateAppInfoPayload);
    new ApiResponse(200, "App info updated", data).send(res);
  }),
};
