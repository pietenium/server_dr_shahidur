import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { articleService } from "./article.service";
import type {
  CreateArticlePayload,
  UpdateArticlePayload,
} from "./article.interface";

export const articleController = {
  // --- Category Controllers ---

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body as { name: string; description?: string };
    const data = await articleService.createCategory(name, description);

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Category created successfully",
      data,
    });
  }),

  getCategories: asyncHandler(async (_req: Request, res: Response) => {
    const data = await articleService.getCategories();

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Categories retrieved successfully",
      data,
    });
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const data = await articleService.updateCategory(req.params.id as string, req.body as { name?: string; description?: string });

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Category updated successfully",
      data,
    });
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    await articleService.deleteCategory(req.params.id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
  }),

  // --- Article Controllers ---

  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await articleService.create(req.body as CreateArticlePayload);

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Article created successfully",
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
      message: "Articles retrieved successfully",
      data,
    });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = !!(req.user && (req.user.role === "ADMIN" || req.user.role === "MODERATOR"));
    const data = await articleService.getBySlug(req.params.slug as string, !isAdmin);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Article retrieved successfully",
      data,
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await articleService.update(req.params.id as string, req.body as UpdateArticlePayload);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Article updated successfully",
      data,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await articleService.delete(req.params.id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Article deleted successfully",
      data: null,
    });
  }),
};
