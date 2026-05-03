import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { researchService } from "./research.service";
import type { CreateResearchPayload, UpdateResearchPayload, ResearchFilterQuery } from "./research.interface";

export const researchController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as CreateResearchPayload;
    const research = await researchService.create(payload);

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Research publication created successfully",
      data: research,
    });
  }),

  getResearchList: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ResearchFilterQuery;
    
    const isAdmin = !!(req.user && (req.user.role === "ADMIN" || req.user.role === "MODERATOR"));

    const result = await researchService.getResearchList(query, isAdmin);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Research publications fetched successfully",
      data: result,
    });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    
    const isAdmin = !!(req.user && (req.user.role === "ADMIN" || req.user.role === "MODERATOR"));
    const isPublic = !isAdmin;

    const research = await researchService.getBySlug(slug as string, isPublic);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Research publication fetched successfully",
      data: research,
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body as UpdateResearchPayload;

    const research = await researchService.update(id as string, payload);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Research publication updated successfully",
      data: research,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await researchService.delete(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Research publication deleted successfully",
      data: null,
    });
  }),
};
