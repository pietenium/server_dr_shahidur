import type { Document } from "mongoose";

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
