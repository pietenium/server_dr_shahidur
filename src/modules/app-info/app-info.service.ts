import { AppInfo } from "./app-info.model";
import type { IAppInfo, UpdateAppInfoPayload } from "./app-info.interface";
import { getCache, setCache, deleteCache } from "@utils/cache";

const CACHE_KEY = "cache:app-info";
const CACHE_TTL = 3600; // 1 hour - this data changes rarely

export const appInfoService = {
  getAppInfo: async (): Promise<IAppInfo | null> => {
    // Try cache
    const cached = await getCache<IAppInfo>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Get from database
    const appInfo = await AppInfo.findOne().sort({ createdAt: -1 });
    
    if (appInfo) {
      void setCache(CACHE_KEY, appInfo, CACHE_TTL);
    }

    return appInfo;
  },

  updateAppInfo: async (payload: UpdateAppInfoPayload): Promise<IAppInfo> => {
    // We try to find the existing record, if not found we create a new one
    // We use findOneAndUpdate with upsert: true to handle the "singleton" behavior
    
    // Using $set to only update provided fields
    const appInfo = await AppInfo.findOneAndUpdate(
      {},
      { $set: payload },
      { 
        new: true, 
        upsert: true, 
        runValidators: true,
        setDefaultsOnInsert: true 
      }
    );

    // Invalidate cache
    void deleteCache(CACHE_KEY);

    return appInfo;
  },
};
