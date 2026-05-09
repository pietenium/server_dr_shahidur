import mongoose, { Schema } from "mongoose";
import type { IAnalytics } from "./analytics.interface";

const analyticsSchema = new Schema<IAnalytics>(
  {
    page: { type: String, required: true },
    sessionId: { type: String, required: true },
    visitorId: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    referrer: { type: String },
    browser: { type: String },
    os: { type: String },
    device: { type: String },
    country: { type: String },
    city: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

analyticsSchema.set("toJSON", {
  transform: (_doc, ret: { __v?: number }) => {
    delete ret.__v;
    return ret;
  },
});

// Indexes for aggregation query performance
analyticsSchema.index({ page: 1, timestamp: -1 });
analyticsSchema.index({ country: 1, city: 1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ timestamp: -1 });

// TTL index: auto-delete analytics older than 90 days
analyticsSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

export const Analytics = mongoose.model<IAnalytics>(
  "Analytics",
  analyticsSchema,
);
