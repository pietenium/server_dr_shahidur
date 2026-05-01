import { Article } from "./article.model";
import type { IArticle, CreateArticlePayload } from "./article.interface";

export const articleService = {
  create: async (payload: CreateArticlePayload): Promise<IArticle> => {
    return Article.create(payload as unknown as Partial<IArticle>);
  },
};
