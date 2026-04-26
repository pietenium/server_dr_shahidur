export interface SearchQuery {
  q: string;
  type?: "article" | "research" | "testimonial";
  limit?: number;
}
export interface ArticleSearchResult {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  articleType: "MEDICAL" | "POLITICAL";
  resultType: "article";
}

export interface ResearchSearchResult {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  uploadType: "PDF" | "DOI";
  resultType: "research";
}

export interface TestimonialSearchResult {
  _id: string;
  name: string;
  content: string;
  designation?: string;
  resultType: "testimonial";
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
