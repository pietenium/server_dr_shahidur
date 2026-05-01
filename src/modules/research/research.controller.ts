import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { researchService } from "./research.service";
import type { CreateResearchPayload } from "./research.interface";

export const researchController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await researchService.create(req.body as CreateResearchPayload);
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Research created",
      data: record,
    });
  }),
};
