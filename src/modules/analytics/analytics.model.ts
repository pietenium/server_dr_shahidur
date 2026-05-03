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

export const Analytics = mongoose.model<IAnalytics>("Analytics", analyticsSchema);
