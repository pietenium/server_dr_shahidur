import { Article } from "./article.model";
import { ArticleCategory } from "./article-category.model";
import type {
  IArticle,
  IArticleCategory,
  CreateArticlePayload,
  UpdateArticlePayload,
  ArticleFilterQuery,
} from "./article.interface";
import { generateSlug } from "@utils/slugify";
import { sanitizeContent } from "@utils/sanitizeHtml";
import { getCache, setCache, deleteCache, deleteCachePattern } from "@utils/cache";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { imagekit } from "@config/imagekit";
import { logger } from "@utils/logger";
import type { Types } from "mongoose";
import type mongoose from "mongoose";

const CACHE_TTL_LIST = 300; // 5 minutes
const CACHE_TTL_DETAIL = 600; // 10 minutes

export const articleService = {
  // --- Category Methods ---

  createCategory: async (name: string, description?: string): Promise<IArticleCategory> => {
    const slug = generateSlug(name);
    const existing = await ArticleCategory.findOne({ slug });
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, "Category with this name/slug already exists");
    }

    const category = await ArticleCategory.create({ name, slug, description });
    return category;
  },

  getCategories: async (): Promise<IArticleCategory[]> => {
    return ArticleCategory.find().sort({ name: 1 });
  },

  updateCategory: async (
    id: string,
    payload: { name?: string; description?: string },
  ): Promise<IArticleCategory> => {
    const setData: Record<string, string | undefined> = {};
    if (typeof payload.name === "string") {
      setData.name = payload.name;
      setData.slug = generateSlug(payload.name);
    }

    if (typeof payload.description === "string" || payload.description === undefined) {
      setData.description = payload.description;
    }

    const category = await ArticleCategory.findByIdAndUpdate(id, { $set: setData }, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }

    return category;
  },

  deleteCategory: async (id: string): Promise<void> => {
    // Check if any articles reference this category
    const articleCount = await Article.countDocuments({ category: id });
    if (articleCount > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Cannot delete category that is referenced by articles",
      );
    }

    const category = await ArticleCategory.findByIdAndDelete(id);
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }
  },

  // --- Article Methods ---

  create: async (payload: CreateArticlePayload): Promise<IArticle> => {
    const slug = generateSlug(payload.title);
    const existing = await Article.findOne({ slug });
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, "Article with this title already exists");
    }

    const content = sanitizeContent(payload.content);

    const articleData = {
      ...payload,
      slug,
      content,
    };

    // @ts-expect-error - Mongoose create has complex type requirements for spread payloads
    const article = await Article.create(articleData);

    // Invalidate caches
    void deleteCachePattern("cache:articles:*");

    return article;
  },

  getArticles: async (query: ArticleFilterQuery, isAdmin = false): Promise<mongoose.PaginateResult<IArticle>> => {
    const { status, category, articleType, search, tag, page = 1, limit = 10, sort = "-createdAt" } = query;

    // For public users, only show published articles
    const filter: Record<string, unknown> = {};
    if (!isAdmin) {
      filter.status = "PUBLISHED";
    } else if (status) {
      filter.status = status.toUpperCase();
    }

    if (category) {
      filter.category = category;
    }
    if (articleType) {
      filter.articleType = articleType.toUpperCase();
    }
    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const cacheKey = `cache:articles:${JSON.stringify({ filter, page, limit, sort })}`;

    // Try cache if not admin
    if (!isAdmin) {
      const cached = await getCache<unknown>(cacheKey);
      if (cached) {
        return cached as mongoose.PaginateResult<IArticle>;
      }
    }

    const options = {
      page,
      limit,
      sort,
      populate: "category",
    };

    const model = Article;
    const results = await model.paginate(filter, options);

    if (!isAdmin) {
      void setCache(cacheKey, results, CACHE_TTL_LIST);
    }

    return results;
  },

  getBySlug: async (slug: string, isPublic = true): Promise<IArticle> => {
    const cacheKey = `cache:article:${slug}`;

    if (isPublic) {
      const cached = await getCache<IArticle>(cacheKey);
      if (cached) {
        // Atomic increment of impressions even on cache hit
        void Article.updateOne({ slug }, { $inc: { impressions: 1 } });
        return cached;
      }
    }

    const article = await Article.findOne({ slug }).populate("category");
    if (!article) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Article not found");
    }

    if (isPublic && article.status !== "PUBLISHED") {
      throw new ApiError(StatusCodes.FORBIDDEN, "This article is not published");
    }

    if (isPublic) {
      const updated = await Article.findOneAndUpdate(
        { slug },
        { $inc: { impressions: 1 } },
        { new: true },
      ).populate("category");
      if (!updated) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Article not found");
      }
      void setCache(cacheKey, updated, CACHE_TTL_DETAIL);
      return updated;
    }

    return article;
  },

  update: async (id: string, payload: UpdateArticlePayload): Promise<IArticle> => {
    if (typeof id !== "string") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid article id");
    }
    const existingArticle = await Article.findOne({ _id: { $eq: id } });
    if (!existingArticle) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Article not found");
    }

    const updateData: Partial<IArticle> = {};

    if (payload.title !== undefined) {
      if (typeof payload.title !== "string") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid title");
      }
      updateData.title = payload.title;
    }
    if (payload.excerpt !== undefined) {
      if (typeof payload.excerpt !== "string") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid excerpt");
      }
      updateData.excerpt = payload.excerpt;
    }
    if (payload.category !== undefined) {
      if (typeof payload.category !== "string") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid category");
      }
      updateData.category = payload.category as unknown as Types.ObjectId;
    }
    if (payload.tags !== undefined) {
      if (!Array.isArray(payload.tags) || !payload.tags.every((tag) => typeof tag === "string")) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid tags");
      }
      updateData.tags = payload.tags;
    }
    if (payload.status !== undefined) {
      if (
        payload.status !== "DRAFT" &&
        payload.status !== "PUBLISHED"
      ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid status");
      }
      updateData.status = payload.status;
    }
    if (payload.publishedAt !== undefined) {
      const publishedAt =
        (payload.publishedAt as unknown) instanceof Date
          ? (payload.publishedAt as unknown as Date)
          : new Date(payload.publishedAt);
      if (Number.isNaN(publishedAt.getTime())) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid publishedAt");
      }
      updateData.publishedAt = publishedAt;
    }

    if (payload.title) {
      const newSlug = generateSlug(payload.title);
      const slugExists = await Article.findOne({ slug: newSlug, _id: { $ne: id } });
      if (slugExists) {
        throw new ApiError(StatusCodes.CONFLICT, "An article with a similar title already exists");
      }
      updateData.slug = newSlug;
    }
    if (payload.content !== undefined) {
      if (typeof payload.content !== "string") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid content");
      }
      updateData.content = sanitizeContent(payload.content);
    }

    const article = await Article.findOneAndUpdate({ _id: { $eq: id } }, { $set: updateData }, {
      new: true,
      runValidators: true,
    }).populate("category");

    if (!article) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Article not found");
    }

    // Invalidate caches
    void deleteCachePattern("cache:articles:*");
    void deleteCache(`cache:article:${article.slug}`);
    if (existingArticle.slug !== article.slug) {
      void deleteCache(`cache:article:${existingArticle.slug}`);
    }

    return article;
  },

  delete: async (id: string): Promise<void> => {
    const article = await Article.findById(id);
    if (!article) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Article not found");
    }

    // Delete images from ImageKit
    const deletePromises: Promise<unknown>[] = [];
    if (article.featuredImage?.fileId) {
      deletePromises.push(imagekit.files.delete(article.featuredImage.fileId));
    }
    if (article.ogImage?.fileId) {
      deletePromises.push(imagekit.files.delete(article.ogImage.fileId));
    }

    try {
      await Promise.all(deletePromises);
    } catch (err) {
      logger.error("Error deleting Article images from ImageKit:", err);
    }

    await Article.findByIdAndDelete(id);

    // Invalidate caches
    void deleteCachePattern("cache:articles:*");
    void deleteCache(`cache:article:${article.slug}`);
  },
};
