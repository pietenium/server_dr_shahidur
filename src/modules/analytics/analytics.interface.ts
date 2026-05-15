import type { Document, PipelineStage } from "mongoose";

export interface IAnalytics extends Document {
  page: string;
  sessionId: string;
  visitorId: string;
  ip: string;
  userAgent: string;
  referrer: string;
  browser: string;
  os: string;
  device: string;
  country: string;
  city: string;
  timestamp: Date;
}

export interface TrackPageViewPayload {
  page: string;
  sessionId: string;
  visitorId?: string;
  referrer?: string;
}

export interface GeoAggregationResult {
  _id: string;
  count: number;
  country: string;
}

export interface PageViewAggregationResult {
  _id: string;
  count: number;
  page: string;
}

// New interfaces for specific page analytics
export interface SpecificPageStatsResult {
  page: string;
  totalViews: number;
  uniqueVisitors: number;
  averageTimeOnPage?: number;
  lastViewedAt?: Date | null;
  dailyViews: Array<{
    date: string;
    count: number;
  }>;
  referrers: Array<{
    source: string;
    count: number;
  }>;
  devices: Array<{
    type: string;
    count: number;
  }>;
  browsers: Array<{
    name: string;
    count: number;
  }>;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

// Re-export PipelineStage for convenience in service
export type { PipelineStage };
