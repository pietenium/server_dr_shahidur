import { AppInfo } from "./app-info.model";
import type { IAppInfo, UpdateAppInfoPayload } from "./app-info.interface";
import { getCache, setCache, deleteCache } from "@utils/cache";
import { imagekit } from "@config/imagekit";

const CACHE_KEY = "cache:app-info";
const CACHE_TTL = 3600; // 1 hour - this data changes rarely

export const appInfoService = {
  getAppInfo: async (): Promise<IAppInfo | null> => {
    // Try cache
    const cached = await getCache<IAppInfo>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Get from database - consistently target the newest document
    const appInfo = await AppInfo.findOne().sort({ createdAt: -1 });

    if (appInfo) {
      void setCache(CACHE_KEY, appInfo, CACHE_TTL);
    }

    return appInfo;
  },

  updateAppInfo: async (payload: UpdateAppInfoPayload): Promise<IAppInfo> => {
    // Get existing to check for image changes
    const appInfoExists = await AppInfo.findOne().sort({ createdAt: -1 });

    // Build a sanitized update object from allowlisted fields only.
    const allowedKeys: ReadonlyArray<keyof UpdateAppInfoPayload> = [
      "siteName",
      "siteDescription",
      "doctorName",
      "doctorTitle",
      "doctorSpecialty",
      "doctorBio",
      "doctorImage",
      "ogImage",
      "email",
      "phone",
      "address",
      "socialLinks",
      "clinicHours",
      "mapEmbedUrl",
    ];

    const sanitizedPayload: Partial<UpdateAppInfoPayload> = {};
    for (const key of allowedKeys) {
      const value = payload[key];
      if (value !== undefined) {
        Object.assign(sanitizedPayload, { [key]: value });
      }
    }

    // FIX 15: Delete old images from ImageKit if they are being replaced
    if (appInfoExists) {
      if (sanitizedPayload.doctorImage && appInfoExists.doctorImage?.fileId) {
        void imagekit.files.delete(appInfoExists.doctorImage.fileId).catch(() => {});
      }
      if (sanitizedPayload.ogImage && appInfoExists.ogImage?.fileId) {
        void imagekit.files.delete(appInfoExists.ogImage.fileId).catch(() => {});
      }
    }

    // FIX 16: Consistent document targeting using sort
    const appInfo = await AppInfo.findOneAndUpdate(
      {},
      { $set: sanitizedPayload },
      {
        sort: { createdAt: -1 },
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // Invalidate cache
    void deleteCache(CACHE_KEY);

    return appInfo;
  },
};