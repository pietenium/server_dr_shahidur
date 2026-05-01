import type { SearchQuery, UniversalSearchResult } from "./search.interface";

export const searchService = {
  universalSearch: async (query: SearchQuery): Promise<UniversalSearchResult> => {
    // Basic mock implementation to resolve errors
    await Promise.resolve();
    return {
      query: query.q,
      totalResults: 0,
      results: {
        articles: [],
        research: [],
        testimonials: [],
      },
    };
  },
};
