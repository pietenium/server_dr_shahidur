import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { researchService } from "./research.service";
import type { CreateResearchPayload, UpdateResearchPayload, ResearchFilterQuery } from "./research.interface";
import { RESEARCH_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";

export const researchController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const payload = req.body as CreateResearchPayload;
    const research = await researchService.create(payload);

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: RESEARCH_MESSAGES.CREATED,
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
      message: RESEARCH_MESSAGES.FETCHED,
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
      message: RESEARCH_MESSAGES.FETCHED,
      data: research,
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { id } = req.params;
    const payload = req.body as UpdateResearchPayload;

    const research = await researchService.update(id as string, payload);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: RESEARCH_MESSAGES.UPDATED,
      data: research,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { id } = req.params;

    await researchService.delete(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: RESEARCH_MESSAGES.DELETED,
      data: null,
    });
  }),
};
