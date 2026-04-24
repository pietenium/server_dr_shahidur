import { Document } from "mongoose";

export interface IAnalytics extends Document {
  page: string;
  sessionId: string;
  timestamp: Date;
  ip: string;
}

export interface TrackPageViewPayload {
  page: string;
  sessionId: string;
}

export interface GeoAggregationResult {
  _id: string;
  count: number;
}

export interface PageViewAggregationResult {
  _id: { $dateToString: { format: string; date: string } };
  count: number;
}
