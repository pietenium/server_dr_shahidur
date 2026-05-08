import { AppInfo } from "./app-info.model";
import { ApiError } from "@utils/ApiError";
import type { UpdateAppInfoPayload, IAppInfo } from "./app-info.interface";
import { getCache, setCache, deleteCache } from "@utils/cache";
export class AppInfoService {
  public async getAppInfo(): Promise<IAppInfo | null> {
    const cacheKey = "cache:app-info";
    const cached = await getCache<IAppInfo>(cacheKey);

    if (cached) {
      return cached;
    }

    let appInfo = await AppInfo.findOne();

    if (!appInfo) {
      // Create default singleton if it doesn't exist
      appInfo = await AppInfo.create({
        siteName: "Dr. Sahidur Rahman Khan",
        doctorName: "Dr. Md. Sahidur Rahman Khan",
        doctorTitle: "Orthopedic Surgeon",
        doctorSpecialty: "Orthopedic Surgery",
        email: "contact@domain.com",
        phone: "+880XXXXXXXXXX",
      });
    }

    await setCache(cacheKey, appInfo.toJSON(), 3600);
    return appInfo;
  }

  public async updateAppInfo(
    payload: UpdateAppInfoPayload,
    files?: {
      doctorImage?: Express.Multer.File;
      ogImage?: Express.Multer.File;
    },
  ): Promise<IAppInfo> {
    const appInfo = await AppInfo.findOne();

    if (!appInfo) {
      throw new ApiError(404, "App info not found");
    }

    // Handle image uploads
    if (files?.doctorImage) {
      const { imagekit } = await import("../../config/imagekit");
      const result = await imagekit.files.upload({
        file: files.doctorImage.buffer.toString("base64"),
        fileName: `doctor-image-${Date.now()}`,
        folder: "/doctor-images",
      });
      appInfo.doctorImage = {
        url: result.url,
        fileId: result.fileId,
      };
    }

    if (files?.ogImage) {
      const { imagekit } = await import("../../config/imagekit");
      const result = await imagekit.files.upload({
        file: files.ogImage.buffer.toString("base64"),
        fileName: `og-image-${Date.now()}`,
        folder: "/og-images",
      });
      appInfo.ogImage = {
        url: result.url,
        fileId: result.fileId,
      };
    }

    // Update fields
    Object.assign(appInfo, payload);
    await appInfo.save();

    // Invalidate cache
    await deleteCache("cache:app-info");

    return appInfo;
  }
}
