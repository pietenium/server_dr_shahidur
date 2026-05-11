import { Analytics } from "./analytics.model";
import type {
  TrackPageViewPayload,
  GeoAggregationResult,
  PageViewAggregationResult,
  PipelineStage,
  SpecificPageStatsResult,
  DateRangeQuery,
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

  // New method: Get specific page statistics
  getSpecificPageStats: async (
    pageSlug: string,
    query: DateRangeQuery = {},
  ): Promise<SpecificPageStatsResult> => {
    const { startDate, endDate } = query;

    // Build date filter
    const dateFilter: {
      page: string;
      timestamp?: {
        $gte: Date;
        $lte: Date;
      };
    } = { page: pageSlug };
    if (startDate && endDate) {
      dateFilter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get total views
    const totalViews = await Analytics.countDocuments(dateFilter);

    // Get unique visitors
    const uniqueVisitors = await Analytics.distinct("visitorId", dateFilter);

    // Get last viewed timestamp
    const lastViewed = await Analytics.findOne(dateFilter)
      .sort({ timestamp: -1 })
      .select("timestamp");

    // Get daily views aggregation
    const dailyViews = await Analytics.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]);

    // Get referrer statistics
    const referrers = await Analytics.aggregate<{
      source: string;
      count: number;
    }>([
      { $match: dateFilter },
      {
        $group: {
          _id: "$referrer",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { source: "$_id", count: 1, _id: 0 } },
    ]);

    // Get device statistics
    const devices = await Analytics.aggregate<{ type: string; count: number }>([
      { $match: dateFilter },
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ]);

    // Get browser statistics
    const browsers = await Analytics.aggregate<{ name: string; count: number }>(
      [
        { $match: dateFilter },
        {
          $group: {
            _id: "$browser",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { name: "$_id", count: 1, _id: 0 } },
      ],
    );

    return {
      page: pageSlug,
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      lastViewedAt: lastViewed?.timestamp || null,
      dailyViews: (dailyViews as { date: string; count: number }[]).map(
        (d) => ({ date: d.date, count: d.count }),
      ),
      referrers: referrers.map((r) => ({
        source: r.source || "Direct",
        count: r.count,
      })),
      devices: devices.map((d) => ({
        type: d.type || "Unknown",
        count: d.count,
      })),
      browsers: browsers.map((b) => ({
        name: b.name || "Unknown",
        count: b.count,
      })),
    };
  },
};
