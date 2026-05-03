import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { articleService } from "./article.service";
import type {
  CreateArticlePayload,
  UpdateArticlePayload,
} from "./article.interface";
import { ARTICLE_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";

export const articleController = {
  // --- Category Controllers ---

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { name, description } = req.body as { name: string; description?: string };
    const data = await articleService.createCategory(name, description);

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: ARTICLE_MESSAGES.CATEGORY_CREATED,
      data,
    });
  }),

  getCategories: asyncHandler(async (_req: Request, res: Response) => {
    const data = await articleService.getCategories();

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ARTICLE_MESSAGES.CATEGORY_FETCHED,
      data,
    });
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const data = await articleService.updateCategory(req.params.id as string, req.body as { name?: string; description?: string });

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ARTICLE_MESSAGES.CATEGORY_UPDATED,
      data,
    });
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    await articleService.deleteCategory(req.params.id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ARTICLE_MESSAGES.CATEGORY_DELETED,
      data: null,
    });
  }),

  // --- Article Controllers ---

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const data = await articleService.create(req.body as CreateArticlePayload);

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: ARTICLE_MESSAGES.CREATED,
      data,
    });
  }),

  getArticles: asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = !!(req.user && (req.user.role === "ADMIN" || req.user.role === "MODERATOR"));
    
    const data = await articleService.getArticles(
      req.query,
      isAdmin,
    );

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ARTICLE_MESSAGES.FETCHED,
      data,
    });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = !!(req.user && (req.user.role === "ADMIN" || req.user.role === "MODERATOR"));
    const data = await articleService.getBySlug(req.params.slug as string, !isAdmin);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ARTICLE_MESSAGES.FETCHED,
      data,
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const data = await articleService.update(req.params.id as string, req.body as UpdateArticlePayload);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ARTICLE_MESSAGES.UPDATED,
      data,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    await articleService.delete(req.params.id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ARTICLE_MESSAGES.DELETED,
      data: null,
    });
  }),
};
