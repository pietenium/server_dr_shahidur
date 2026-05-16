import { ARTICLE_MESSAGES } from "@constants/messages.constant";
import { ApiError } from "@utils/ApiError";
import {
  deleteCache,
  deleteCachePattern,
  getCache,
  setCache,
} from "@utils/cache";
import { sanitizeContent } from "@utils/sanitizeHtml";
import { generateSlug } from "@utils/slugify";
import { Types } from "mongoose";
import { ArticleCategory } from "./article-category.model";
import type {
  ArticleFilterQuery,
  CreateArticlePayload,
  FeaturedArticlesQuery,
  IArticle,
  IArticleCategory,
  ImpressionIncreasePayload,
  TopArticlesByCategoryQuery,
  UpdateArticlePayload,
} from "./article.interface";
import { Article } from "./article.model";
export class ArticleService {
  public async getArticles(query: ArticleFilterQuery): Promise<{
    articles: IArticle[];
    totalDocs: number;
    totalPages: number;
    currentPage: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const cacheKey = `cache:articles:${JSON.stringify(query)}`;
    const cached = await getCache<{
      articles: IArticle[];
      totalDocs: number;
      totalPages: number;
      currentPage: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status;
    }
    if (query.category) {
      filter.category = query.category;
    }
    if (query.articleType) {
      filter.articleType = query.articleType;
    }
    if (query.tag) {
      filter.tags = query.tag;
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { content: { $regex: query.search, $options: "i" } },
      ];
    }

    const sortOrder = query.sort === "oldest" ? 1 : -1;

    const result = await Article.paginate(filter, {
      page,
      limit,
      sort: { createdAt: sortOrder },
      populate: "category",
    });

    const data = {
      articles: result.docs as IArticle[],
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      currentPage: result.page || page,
    };

    if (query.status === "PUBLISHED") {
      await setCache(cacheKey, data, 300);
    }

    return data;
  }

  public async getArticleBySlug(slug: string): Promise<IArticle> {
    const cacheKey = `cache:article:${slug}`;
    const cached = await getCache<IArticle>(cacheKey);

    if (cached) {
      // Increment impressions atomically
      await Article.findByIdAndUpdate(cached._id, {
        $inc: { impressions: 1 },
      }).exec();
      return cached;
    }

    const article = await Article.findOne({ slug }).populate("category");

    if (!article) {
      throw new ApiError(404, ARTICLE_MESSAGES.NOT_FOUND);
    }

    // Increment impressions
    article.impressions += 1;
    await article.save();

    const articleData = article.toJSON();
    await setCache(cacheKey, articleData, 600);

    return article;
  }

  public async createArticle(
    payload: CreateArticlePayload,
    featuredImage?: Express.Multer.File,
    ogImage?: Express.Multer.File,
  ): Promise<IArticle> {
    const slug = generateSlug(payload.title);

    // Check unique slug
    const existingArticle = await Article.findOne({ slug });
    if (existingArticle) {
      throw new ApiError(409, ARTICLE_MESSAGES.SLUG_EXISTS);
    }

    const articleData: Partial<IArticle> = {
      title: payload.title,
      slug,
      content: sanitizeContent(payload.content),
      excerpt: payload.excerpt,
      category: payload.category as unknown as IArticle["category"],
      articleType: payload.articleType,
      status: payload.status || "DRAFT",
      author: payload.author,
      tags: payload.tags,
      publishedAt: payload.publishedAt
        ? new Date(payload.publishedAt)
        : undefined,
    };

    // Upload featured image if provided
    if (featuredImage) {
      const { imagekit } = await import("@config/imagekit");
      const result = await imagekit.files.upload({
        file: featuredImage.buffer.toString("base64"),
        fileName: `article-${slug}-${Date.now()}`,
        folder: "/articles",
      });
      articleData.featuredImage = { url: result.url, fileId: result.fileId };
    }

    // Upload OG image if provided
    if (ogImage) {
      const { imagekit } = await import("@config/imagekit");
      const result = await imagekit.files.upload({
        file: ogImage.buffer.toString("base64"),
        fileName: `og-article-${slug}-${Date.now()}`,
        folder: "/og-images",
      });
      articleData.ogImage = { url: result.url, fileId: result.fileId };
    }

    const article = await Article.create(articleData);
    await article.populate("category");

    // Invalidate cache
    await deleteCachePattern("cache:articles:*");

    return article;
  }

  public async updateArticle(
    slug: string,
    payload: UpdateArticlePayload,
    featuredImage?: Express.Multer.File,
    ogImage?: Express.Multer.File,
  ): Promise<IArticle> {
    const article = await Article.findOne({ slug });

    if (!article) {
      throw new ApiError(404, ARTICLE_MESSAGES.NOT_FOUND);
    }

    if (payload.title && payload.title !== article.title) {
      const newSlug = generateSlug(payload.title);
      const existingArticle = await Article.findOne({
        slug: newSlug,
        _id: { $ne: article._id },
      });
      if (existingArticle) {
        throw new ApiError(409, ARTICLE_MESSAGES.SLUG_EXISTS);
      }
      article.title = payload.title;
      article.slug = newSlug;
    }

    if (payload.content) {
      article.content = sanitizeContent(payload.content);
    }
    if (payload.excerpt !== undefined) {
      article.excerpt = payload.excerpt;
    }
    if (payload.category) {
      article.category = payload.category as unknown as IArticle["category"];
    }
    if (payload.articleType) {
      article.articleType = payload.articleType;
    }
    if (payload.status) {
      article.status = payload.status;
    }
    if (payload.author !== undefined) {
      article.author = payload.author;
    }
    if (payload.tags) {
      article.tags = payload.tags;
    }
    if (payload.publishedAt) {
      article.publishedAt = new Date(payload.publishedAt);
    }

    // Handle image uploads
    if (featuredImage) {
      // Delete old image from ImageKit if exists
      if (article.featuredImage?.fileId) {
        const { imagekit } = await import("@config/imagekit");
        await imagekit.files.delete(article.featuredImage.fileId);
      }
      const { imagekit } = await import("@config/imagekit");
      const result = await imagekit.files.upload({
        file: featuredImage.buffer.toString("base64"),
        fileName: `article-${article.slug}-${Date.now()}`,
        folder: "/articles",
      });
      article.featuredImage = { url: result.url, fileId: result.fileId };
    }

    if (ogImage) {
      if (article.ogImage?.fileId) {
        const { imagekit } = await import("@config/imagekit");
        await imagekit.files.delete(article.ogImage.fileId);
      }
      const { imagekit } = await import("@config/imagekit");
      const result = await imagekit.files.upload({
        file: ogImage.buffer.toString("base64"),
        fileName: `og-article-${article.slug}-${Date.now()}`,
        folder: "/og-images",
      });
      article.ogImage = { url: result.url, fileId: result.fileId };
    }

    await article.save();
    await article.populate("category");

    // Invalidate caches
    await deleteCache(`cache:article:${slug}`);
    await deleteCachePattern("cache:articles:*");

    return article;
  }

  public async deleteArticle(slug: string): Promise<void> {
    const article = await Article.findOne({ slug });

    if (!article) {
      throw new ApiError(404, ARTICLE_MESSAGES.NOT_FOUND);
    }

    // Delete images from ImageKit
    const { imagekit } = await import("@config/imagekit");
    if (article.featuredImage?.fileId) {
      await imagekit.files.delete(article.featuredImage.fileId).catch(() => {});
    }
    if (article.ogImage?.fileId) {
      await imagekit.files.delete(article.ogImage.fileId).catch(() => {});
    }

    await article.deleteOne();

    // Invalidate caches
    await deleteCache(`cache:article:${slug}`);
    await deleteCachePattern("cache:articles:*");
  }

  // Category management
  public async getCategories(): Promise<IArticleCategory[]> {
    return ArticleCategory.find().sort({ name: 1 });
  }

  public async createCategory(payload: {
    name: string;
    description?: string;
  }): Promise<IArticleCategory> {
    const slug = generateSlug(payload.name);
    const category = await ArticleCategory.create({
      name: payload.name,
      slug,
      description: payload.description,
    });
    return category;
  }

  public async updateCategory(
    id: string,
    payload: { name?: string; description?: string },
  ): Promise<IArticleCategory> {
    const category = await ArticleCategory.findById(id);
    if (!category) {
      throw new ApiError(404, ARTICLE_MESSAGES.CATEGORY_NOT_FOUND);
    }

    if (payload.name) {
      category.name = payload.name;
      category.slug = generateSlug(payload.name);
    }
    if (payload.description !== undefined) {
      category.description = payload.description;
    }

    await category.save();
    return category;
  }

  public async deleteCategory(id: string): Promise<void> {
    const category = await ArticleCategory.findById(id);
    if (!category) {
      throw new ApiError(404, ARTICLE_MESSAGES.CATEGORY_NOT_FOUND);
    }

    const articlesCount = await Article.countDocuments({ category: id });
    if (articlesCount > 0) {
      throw new ApiError(409, ARTICLE_MESSAGES.CATEGORY_IN_USE);
    }

    await category.deleteOne();
  }
  public async getArticleById(id: string): Promise<IArticle> {
    const article = await Article.findById(id).populate("category");

    if (!article) {
      throw new ApiError(404, ARTICLE_MESSAGES.NOT_FOUND);
    }

    return article;
  }

  public async getFeaturedArticles(query: FeaturedArticlesQuery = {}): Promise<{
    articles: IArticle[];
    total: number;
    totalPage: number;
    page: number;
    limit: number;
  }> {
    const { limit = 10, minImpressions = 1000 } = query;
    const page = 1; // Featured articles are always page 1

    const cacheKey = `cache:featured-articles:${limit}:${minImpressions}`;
    const cached = await getCache<{
      articles: IArticle[];
      total: number;
      totalPage: number;
      page: number;
      limit: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const filter = {
      status: "PUBLISHED",
      impressions: { $gte: minImpressions },
      publishedAt: { $lte: new Date() },
    };

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate("category")
        .sort({ impressions: -1, publishedAt: -1 })
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    const data = {
      articles: articles as IArticle[],
      total,
      totalPage: Math.ceil(total / limit),
      page,
      limit,
    };

    await setCache(cacheKey, data, 300); // Cache for 5 minutes

    return data;
  }

  // New: Increase article impressions (with rate limiting per session)
  public async increaseImpressions(
    payload: ImpressionIncreasePayload,
  ): Promise<{
    success: boolean;
    currentImpressions: number;
  }> {
    const { articleId, sessionId, hoverDuration = 0 } = payload;

    if (!Types.ObjectId.isValid(articleId)) {
      throw new ApiError(400, "Invalid article ID");
    }

    // Validate hover duration (minimum 1 second to count as genuine read)
    const MIN_HOVER_DURATION = 1000; // 1 second
    if (hoverDuration < MIN_HOVER_DURATION) {
      return {
        success: false,
        currentImpressions: 0,
      };
    }

    // Check if this session has already counted impression for this article
    const sessionKey = `impression:${articleId}:${sessionId}`;
    const cached = await getCache<boolean>(sessionKey);

    if (cached) {
      // Already counted impression for this session
      return {
        success: false,
        currentImpressions: 0,
      };
    }

    // Update article impressions
    const article = await Article.findByIdAndUpdate(
      articleId,
      { $inc: { impressions: 1 } },
      { new: true },
    );

    if (!article) {
      throw new ApiError(404, ARTICLE_MESSAGES.NOT_FOUND);
    }

    // Set cache to prevent duplicate impressions from same session (24 hours)
    await setCache(sessionKey, true, 86400); // 24 hours

    // Invalidate relevant caches
    await deleteCachePattern("cache:featured-articles:*");
    await deleteCachePattern("cache:top-category-articles:*");
    await deleteCache(`cache:article:${article.slug}`);

    return {
      success: true,
      currentImpressions: article.impressions,
    };
  }

  // New: Get top articles by category (based on impressions)
  public async getTopArticlesByCategory(
    query: TopArticlesByCategoryQuery = {},
  ): Promise<{
    categories: Array<{
      category: IArticleCategory;
      articles: IArticle[];
    }>;
  }> {
    const { categoryId, limit = 5, articleType } = query;

    const cacheKey = `cache:top-category-articles:${categoryId || "all"}:${limit}:${articleType || "all"}`;
    const cached = await getCache<{
      categories: Array<{
        category: IArticleCategory;
        articles: IArticle[];
      }>;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // Build filter for articles
    const articleFilter: Record<string, unknown> = {
      status: "PUBLISHED",
      publishedAt: { $lte: new Date() },
    };

    if (articleType) {
      articleFilter.articleType = articleType;
    }

    let categories: IArticleCategory[];

    if (categoryId) {
      // Get specific category
      const category = await ArticleCategory.findById(categoryId);
      if (!category) {
        throw new ApiError(404, ARTICLE_MESSAGES.CATEGORY_NOT_FOUND);
      }
      categories = [category];
      articleFilter.category = categoryId;
    } else {
      // Get all categories
      categories = await ArticleCategory.find().sort({ name: 1 });
    }

    // Get top articles for each category
    const categoriesWithArticles = await Promise.all(
      categories.map(async (category) => {
        const articles = await Article.find({
          ...articleFilter,
          category: category._id,
        })
          .sort({ impressions: -1, publishedAt: -1 })
          .limit(limit)
          .lean();

        return {
          category,
          articles,
        };
      }),
    );

    // Filter out categories with no articles
    const result = {
      categories: categoriesWithArticles.filter(
        (item) => item.articles.length > 0,
      ),
    };

    await setCache(cacheKey, result, 600); // Cache for 10 minutes

    return result;
  }

  // New: Bulk get article impressions
  public async getMultipleArticleImpressions(articleIds: string[]): Promise<
    Array<{
      articleId: string;
      impressions: number;
      slug: string;
      title: string;
    }>
  > {
    const articles = await Article.find(
      { _id: { $in: articleIds } },
      { impressions: 1, slug: 1, title: 1 },
    ).lean();

    return articles.map((article) => ({
      articleId: article._id.toString(),
      impressions: article.impressions,
      slug: article.slug,
      title: article.title,
    }));
  }
}
