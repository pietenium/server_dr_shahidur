import { AppInfo } from "./app-info.model";
import type { IAppInfo, UpdateAppInfoPayload } from "./app-info.interface";
import { getCache, setCache, deleteCache } from "@utils/cache";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";

const CACHE_KEY = "cache:app-info";
const CACHE_TTL = 3600; // 1 hour

export const appInfoService = {
  get: async (): Promise<IAppInfo> => {
    const cachedData = await getCache<IAppInfo>(CACHE_KEY);
    if (cachedData) {
      return cachedData;
    }

    const appInfo = await AppInfo.findOne();
    if (!appInfo) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "App information not found. Please seed the initial data.",
      );
    }

    await setCache(CACHE_KEY, appInfo, CACHE_TTL);
    return appInfo;
  },

  update: async (payload: UpdateAppInfoPayload): Promise<IAppInfo | null> => {
    // Basic type validation for critical fields if necessary (though validator handles it)
    if (payload.email && typeof payload.email === "string") {
      payload.email = payload.email.trim().toLowerCase();
    }

    const updatedAppInfo = await AppInfo.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    if (updatedAppInfo) {
      await deleteCache(CACHE_KEY);
    }

    return updatedAppInfo;
  },
};
