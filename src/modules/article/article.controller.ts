import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { ArticleService } from "./article.service";
import type {
  CreateArticlePayload,
  UpdateArticlePayload,
  ArticleFilterQuery,
} from "./article.interface";
import { ARTICLE_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";

type MulterFiles = Record<string, Express.Multer.File[] | undefined>;

const getMulterFile = (
  files: unknown,
  field: string,
): Express.Multer.File | undefined => {
  if (
    typeof files === "object" &&
    files !== null &&
    Object.prototype.hasOwnProperty.call(files, field)
  ) {
    const typedFiles = files as MulterFiles;
    return typedFiles[field]?.[0];
  }

  return undefined;
};

const articleService = new ArticleService();

export const articleController = {
  // --- Category Controllers ---

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { name, description } = req.body as {
      name: string;
      description?: string;
    };
    const data = await articleService.createCategory({ name, description });

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

    const { id } = req.params;
    const data = await articleService.updateCategory(
      id as string,
      req.body as { name?: string; description?: string },
    );

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

    const { id } = req.params;
    await articleService.deleteCategory(id as string);

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

    const payload = req.body as CreateArticlePayload;
    const featuredImage = getMulterFile(req.files, "featuredImage");
    const ogImage = getMulterFile(req.files, "ogImage");

    const data = await articleService.createArticle(
      payload,
      featuredImage,
      ogImage,
    );

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: ARTICLE_MESSAGES.CREATED,
      data,
    });
  }),

  getArticles: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ArticleFilterQuery;
    const isAdmin = !!(
      req.user &&
      (req.user.role === "ADMIN" || req.user.role === "MODERATOR")
    );

    // If not admin, only show published articles
    if (!isAdmin) {
      query.status = "PUBLISHED";
    }

    const result = await articleService.getArticles(query);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ARTICLE_MESSAGES.FETCHED,
      data: result.articles,
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

    const article = await articleService.getArticleBySlug(slug as string);

    // If not admin and article is not published, throw error
    if (!isAdmin && article.status !== "PUBLISHED") {
      throw new ApiError(StatusCodes.NOT_FOUND, ARTICLE_MESSAGES.NOT_FOUND);
    }

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ARTICLE_MESSAGES.FETCHED,
      data: article,
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { id } = req.params;
    const payload = req.body as UpdateArticlePayload;
    const featuredImage = getMulterFile(req.files, "featuredImage");
    const ogImage = getMulterFile(req.files, "ogImage");

    // First get the article by id to get its slug
    const existingArticle = await articleService.getArticleById(id as string);

    const data = await articleService.updateArticle(
      existingArticle.slug,
      payload,
      featuredImage,
      ogImage,
    );

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

    const { id } = req.params;

    // First get the article by id to get its slug
    const existingArticle = await articleService.getArticleById(id as string);

    await articleService.deleteArticle(existingArticle.slug);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: ARTICLE_MESSAGES.DELETED,
      data: null,
    });
  }),
};
