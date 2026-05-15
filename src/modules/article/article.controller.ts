import { ARTICLE_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";
import { ApiError } from "@utils/ApiError";
import { ApiResponse } from "@utils/ApiResponse";
import { asyncHandler } from "@utils/asyncHandler";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type {
  ArticleFilterQuery,
  ArticleType,
  CreateArticlePayload,
  FeaturedArticlesQuery,
  ImpressionIncreasePayload,
  TopArticlesByCategoryQuery,
  UpdateArticlePayload,
} from "./article.interface";
import { ArticleService } from "./article.service";

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
        minImpressions: 0,
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

  getFeaturedArticles: asyncHandler(async (req: Request, res: Response) => {
    const limitParam = req.query.limit;
    const minImpressionsParam = req.query.minImpressions;

    const query: FeaturedArticlesQuery = {
      limit: typeof limitParam === "string" ? parseInt(limitParam, 10) : 10,
      minImpressions:
        typeof minImpressionsParam === "string"
          ? parseInt(minImpressionsParam, 10)
          : 1000,
    };

    const result = await articleService.getFeaturedArticles(query);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Featured articles fetched successfully",
      data: result.articles,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPage: result.totalPage,
        minImpressions: query.minImpressions as number,
      },
    });
  }),

  increaseImpressions: asyncHandler(async (req: Request, res: Response) => {
    const {
      articleId,
      hoverDuration,
      visitorId: bodyVisitorId,
      sessionId: bodySessionId,
    } = req.body as {
      articleId?: string;
      visitorId?: string;
      sessionId?: string;
      hoverDuration?: number;
    };

    const sessionId = (req.headers["x-session-id"] as string) || bodySessionId;
    const visitorId = (req.headers["x-visitor-id"] as string) || bodyVisitorId;

    if (!articleId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Article ID is required");
    }

    if (!sessionId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Session ID is required");
    }

    const payload: ImpressionIncreasePayload = {
      articleId,
      sessionId,
      visitorId,
      hoverDuration: hoverDuration || 0,
    };

    const result = await articleService.increaseImpressions(payload);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: result.success,
      message: result.success ? "Impression counted" : "Impression not counted",
      data: {
        currentImpressions: result.currentImpressions,
      },
    });
  }),

  getTopArticlesByCategory: asyncHandler(
    async (req: Request, res: Response) => {
      const categoryIdParam = req.query.categoryId;
      const limitParam = req.query.limit;
      const articleTypeParam = req.query.articleType;

      const query: TopArticlesByCategoryQuery = {
        categoryId:
          typeof categoryIdParam === "string" ? categoryIdParam : undefined,
        limit: typeof limitParam === "string" ? parseInt(limitParam, 10) : 5,
        articleType:
          typeof articleTypeParam === "string"
            ? (articleTypeParam as ArticleType)
            : undefined,
      };

      const result = await articleService.getTopArticlesByCategory(query);

      ApiResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Top articles by category fetched successfully",
        data: result.categories,
      });
    },
  ),

  getMultipleImpressions: asyncHandler(async (req: Request, res: Response) => {
    const { articleIds } = req.body as { articleIds: string[] };

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Article IDs array is required",
      );
    }

    const result =
      await articleService.getMultipleArticleImpressions(articleIds);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Article impressions fetched successfully",
      data: result,
    });
  }),
};
