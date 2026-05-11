import { Article } from "@modules/article/article.model";
import { Research } from "@modules/research/research.model";
import { Testimonial } from "@modules/testimonial/testimonial.model";
import type { IArticle } from "@modules/article/article.interface";
import type { IResearch } from "@modules/research/research.interface";
import type { ITestimonial } from "@modules/testimonial/testimonial.interface";
import type {
  SearchQuery,
  UniversalSearchResult,
  ArticleSearchResult,
  ResearchSearchResult,
  TestimonialSearchResult,
} from "./search.interface";
import { logger } from "@utils/logger";

const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Service for universal search across articles, research, and testimonials.
 */
export const searchService = {
  /**
   * Performs a parallelized search across all enabled modules.
   */
  universalSearch: async (
    query: SearchQuery,
  ): Promise<UniversalSearchResult> => {
    const { q, type, limit = 10 } = query;
    const searchTerms = q.trim();

    // Run searches in parallel based on requested type
    const [articles, research, testimonials] = await Promise.all([
      !type || type === "article"
        ? searchArticles(searchTerms, limit)
        : Promise.resolve([] as ArticleSearchResult[]),
      !type || type === "research"
        ? searchResearch(searchTerms, limit)
        : Promise.resolve([] as ResearchSearchResult[]),
      !type || type === "testimonial"
        ? searchTestimonials(searchTerms, limit)
        : Promise.resolve([] as TestimonialSearchResult[]),
    ]);

    return {
      query: q,
      totalResults: articles.length + research.length + testimonials.length,
      results: {
        articles,
        research,
        testimonials,
      },
    };
  },
};

/**
 * Searches for published articles using text index with regex fallback.
 */
async function searchArticles(
  q: string,
  limit: number,
): Promise<ArticleSearchResult[]> {
  try {
    const docs = await Article.find(
      { $text: { $search: q }, status: "PUBLISHED" },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit);

    return (docs as unknown as IArticle[]).map((doc) => ({
      _id: String(doc._id),
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt,
      articleType: doc.articleType,
      resultType: "article",
    }));
  } catch (error) {
    logger.warn(
      `Article text search failed, falling back to regex: ${(error as Error).message}`,
    );
    try {
      const docs = await Article.find({
        status: "PUBLISHED",
        $or: [
          { title: { $regex: escapeRegex(q), $options: "i" } },
          { excerpt: { $regex: escapeRegex(q), $options: "i" } },
        ],
      }).limit(limit);

      return (docs as unknown as IArticle[]).map((doc) => ({
        _id: String(doc._id),
        title: doc.title,
        slug: doc.slug,
        excerpt: doc.excerpt,
        articleType: doc.articleType,
        resultType: "article",
      }));
    } catch {
      return [];
    }
  }
}

/**
 * Searches for published research papers using text index with regex fallback.
 */
async function searchResearch(
  q: string,
  limit: number,
): Promise<ResearchSearchResult[]> {
  try {
    const docs = await Research.find(
      { $text: { $search: q }, status: "PUBLISHED" },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit);

    return (docs as unknown as IResearch[]).map((doc) => ({
      _id: String(doc._id),
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      uploadType: doc.uploadType,
      resultType: "research",
    }));
  } catch (error) {
    logger.warn(
      `Research text search failed, falling back to regex: ${(error as Error).message}`,
    );
    try {
      const docs = await Research.find({
        status: "PUBLISHED",
        $or: [
          { title: { $regex: escapeRegex(q), $options: "i" } },
          { description: { $regex: escapeRegex(q), $options: "i" } },
        ],
      }).limit(limit);

      return (docs as unknown as IResearch[]).map((doc) => ({
        _id: String(doc._id),
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        uploadType: doc.uploadType,
        resultType: "research",
      }));
    } catch {
      return [];
    }
  }
}

/**
 * Searches for visible testimonials using text index with regex fallback.
 */
async function searchTestimonials(
  q: string,
  limit: number,
): Promise<TestimonialSearchResult[]> {
  try {
    const docs = await Testimonial.find(
      { $text: { $search: q }, isVisible: true },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit);

    return (docs as unknown as ITestimonial[]).map((doc) => ({
      _id: String(doc._id),
      name: doc.name,
      content: doc.content,
      designation: doc.designation,
      resultType: "testimonial",
    }));
  } catch (error) {
    logger.warn(
      `Testimonial text search failed, falling back to regex: ${(error as Error).message}`,
    );
    try {
      const docs = await Testimonial.find({
        isVisible: true,
        $or: [
          { name: { $regex: escapeRegex(q), $options: "i" } },
          { content: { $regex: escapeRegex(q), $options: "i" } },
        ],
      }).limit(limit);

      return (docs as unknown as ITestimonial[]).map((doc) => ({
        _id: String(doc._id),
        name: doc.name,
        content: doc.content,
        designation: doc.designation,
        resultType: "testimonial",
      }));
    } catch {
      return [];
    }
  }
}
