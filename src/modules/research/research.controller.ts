import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { researchService } from "./research.service";
import type { CreateResearchPayload } from "./research.interface";

export const researchController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await researchService.create(req.body as CreateResearchPayload);
    new ApiResponse(201, "Research created", record).send(res);
  }),
};
