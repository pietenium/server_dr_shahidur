import { Analytics } from "./analytics.model";
import type { IAnalytics, TrackPageViewPayload } from "./analytics.interface";

export const analyticsService = {
  trackPageView: async (payload: TrackPageViewPayload): Promise<IAnalytics> => {
    const record = await Analytics.create(payload);
    return record;
  },
};
