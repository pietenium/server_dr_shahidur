import { Analytics } from "./analytics.model";
import type {
  TrackPageViewPayload,
  GeoAggregationResult,
  PageViewAggregationResult,
  PipelineStage,
} from "./analytics.interface";
import { getGeoLocation } from "@utils/getGeoLocation";
import { UAParser } from "ua-parser-js";
import { logger } from "@utils/logger";

export const analyticsService = {
  trackPageView: async (
    payload: TrackPageViewPayload,
    ip: string,
    userAgent: string,
  ): Promise<void> => {
    try {
      const geo = await getGeoLocation(ip);
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser();
      const os = parser.getOS();
      const device = parser.getDevice();

      await Analytics.create({
        ...payload,
        ip,
        userAgent,
        country: geo.country,
        city: geo.city,
        browser: browser.name || "Unknown",
        os: os.name || "Unknown",
        device: device.type || "desktop",
      });
    } catch (error) {
      logger.error("Failed to track page view", error);
    }
  },

  getGeoStats: async (): Promise<GeoAggregationResult[]> => {
    const pipeline: PipelineStage[] = [
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
          country: { $first: "$country" },
        },
      },
      { $sort: { count: -1 } },
    ];
    return Analytics.aggregate(pipeline);
  },

  getPageStats: async (): Promise<PageViewAggregationResult[]> => {
    const pipeline: PipelineStage[] = [
      {
        $group: {
          _id: "$page",
          count: { $sum: 1 },
          page: { $first: "$page" },
        },
      },
      { $sort: { count: -1 } },
    ];
    return Analytics.aggregate(pipeline);
  },
};
