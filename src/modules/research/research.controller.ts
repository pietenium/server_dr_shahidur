import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { ResearchService } from "./research.service";
import type {
  CreateResearchPayload,
  UpdateResearchPayload,
  ResearchFilterQuery,
} from "./research.interface";
import { RESEARCH_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";
import type { Types } from "mongoose";

const researchService = new ResearchService();

export const researchController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const payload = req.body as CreateResearchPayload;
    const pdfFile = req.file as Express.Multer.File;
    // If you have multiple file uploads for thumbnail
    const thumbnailImage = (req.files as { thumbnail?: Express.Multer.File[] })
      ?.thumbnail?.[0];

    const research = await researchService.createResearch(
      payload,
      pdfFile,
      thumbnailImage,
    );

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: RESEARCH_MESSAGES.CREATED,
      data: research,
    });
  }),

  getResearchList: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ResearchFilterQuery;

    const isAdmin = !!(
      req.user &&
      (req.user.role === "ADMIN" || req.user.role === "MODERATOR")
    );

    // If not admin, only show published papers
    if (!isAdmin) {
      query.status = "PUBLISHED";
    }

    const result = await researchService.getResearchList(query);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: RESEARCH_MESSAGES.FETCHED,
      data: result.papers,
      meta: {
        page: result.currentPage,
        limit: query.limit || 10,
        total: result.totalDocs,
        totalPage: result.totalPages,
      },
    });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const isAdmin = !!(
      req.user &&
      (req.user.role === "ADMIN" || req.user.role === "MODERATOR")
    );

    const research = await researchService.getResearchBySlug(slug as string);

    // If not admin and research is not published, throw error
    if (!isAdmin && research.status !== "PUBLISHED") {
      throw new ApiError(StatusCodes.NOT_FOUND, RESEARCH_MESSAGES.NOT_FOUND);
    }

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
    const pdfFile = req.file as Express.Multer.File;
    const thumbnailImage = (req.files as { thumbnail?: Express.Multer.File[] })
      ?.thumbnail?.[0];

    // First get the research by id to get its slug
    const existingResearch = await researchService.getResearchById(
      id as unknown as Types.ObjectId,
    );

    const research = await researchService.updateResearch(
      existingResearch.slug,
      payload,
      pdfFile,
      thumbnailImage,
    );

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

    // First get the research by id to get its slug
    const existingResearch = await researchService.getResearchById(
      id as unknown as Types.ObjectId,
    );

    await researchService.deleteResearch(existingResearch.slug);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: RESEARCH_MESSAGES.DELETED,
      data: null,
    });
  }),
};
