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

export const searchService = {
  universalSearch: async (query: SearchQuery): Promise<UniversalSearchResult> => {
    const { q, type, limit = 10 } = query;
    const searchTerms = q.trim();

    // Search results arrays
    let articles: ArticleSearchResult[] = [];
    let research: ResearchSearchResult[] = [];
    let testimonials: TestimonialSearchResult[] = [];

    // Helper to format results
    const formatArticle = (doc: IArticle): ArticleSearchResult => ({
      _id: String(doc._id),
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt,
      articleType: doc.articleType,
      resultType: "article",
    });

    const formatResearch = (doc: IResearch): ResearchSearchResult => ({
      _id: String(doc._id),
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      uploadType: doc.uploadType,
      resultType: "research",
    });

    const formatTestimonial = (doc: ITestimonial): TestimonialSearchResult => ({
      _id: String(doc._id),
      name: doc.name,
      content: doc.content,
      designation: doc.designation,
      resultType: "testimonial",
    });

    // Execute searches in parallel
    const searchPromises: Promise<void>[] = [];

    if (!type || type === "article") {
      searchPromises.push(
        Article.find(
          { $text: { $search: searchTerms }, status: "PUBLISHED" },
          { score: { $meta: "textScore" } }
        )
          .sort({ score: { $meta: "textScore" } })
          .limit(limit)
          .then((docs) => {
            articles = (docs as unknown as IArticle[]).map(formatArticle);
          })
          // Fallback if text search fails or yields no results
          .catch(async (error) => {
            logger.warn(`Article text search failed, falling back to regex: ${(error as Error).message}`);
            const docs = await Article.find({
              status: "PUBLISHED",
              $or: [
                { title: { $regex: escapeRegex(searchTerms), $options: "i" } },
                { excerpt: { $regex: escapeRegex(searchTerms), $options: "i" } }
              ]
            }).limit(limit);
            articles = (docs as unknown as IArticle[]).map(formatArticle);
          })
      );
    }

    if (!type || type === "research") {
      searchPromises.push(
        Research.find(
          { $text: { $search: searchTerms }, status: "PUBLISHED" },
          { score: { $meta: "textScore" } }
        )
          .sort({ score: { $meta: "textScore" } })
          .limit(limit)
          .then((docs) => {
            research = (docs as unknown as IResearch[]).map(formatResearch);
          })
          .catch(async (error) => {
            logger.warn(`Research text search failed, falling back to regex: ${(error as Error).message}`);
            const docs = await Research.find({
              status: "PUBLISHED",
              $or: [
                { title: { $regex: escapeRegex(searchTerms), $options: "i" } },
                { description: { $regex: escapeRegex(searchTerms), $options: "i" } }
              ]
            }).limit(limit);
            research = (docs as unknown as IResearch[]).map(formatResearch);
          })
      );
    }

    if (!type || type === "testimonial") {
      searchPromises.push(
        Testimonial.find(
          { $text: { $search: searchTerms }, isVisible: true },
          { score: { $meta: "textScore" } }
        )
          .sort({ score: { $meta: "textScore" } })
          .limit(limit)
          .then((docs) => {
            testimonials = (docs as unknown as ITestimonial[]).map(formatTestimonial);
          })
          .catch(async (error) => {
            logger.warn(`Testimonial text search failed, falling back to regex: ${(error as Error).message}`);
            const docs = await Testimonial.find({
              isVisible: true,
              $or: [
                { name: { $regex: escapeRegex(searchTerms), $options: "i" } },
                { content: { $regex: escapeRegex(searchTerms), $options: "i" } }
              ]
            }).limit(limit);
            testimonials = (docs as unknown as ITestimonial[]).map(formatTestimonial);
          })
      );
    }

    await Promise.all(searchPromises);

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
