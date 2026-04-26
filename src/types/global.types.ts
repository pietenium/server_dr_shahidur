export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  ip: string;
}

export interface PaginationMeta {
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  results: T[];
  pagination: PaginationMeta;
}

export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors: Array<{ field?: string; message: string }>;
}

export interface OgImage {
  url: string;
  fileId: string;
}

export type RedisCacheKey =
  | "app-info"
  | "articles-list"
  | "research-list"
  | "article-slug"
  | "research-slug"
  | "testimonials-list";
