export interface SearchQuery {
  q: string;
  type?: "article" | "research" | "testimonial";
  limit?: number;
}

export interface ArticleSearchResult {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  type: string;
}

export interface ResearchSearchResult {
  _id: string;
  title: string;
  slug: string;
  abstract: string;
}

export interface TestimonialSearchResult {
  _id: string;
  text: string;
  authorName: string;
}

export interface UniversalSearchResult {
  query: string;
  totalResults: number;
  results: {
    articles: ArticleSearchResult[];
    research: ResearchSearchResult[];
    testimonials: TestimonialSearchResult[];
  };
}
