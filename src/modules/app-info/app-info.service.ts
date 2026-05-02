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
    // 1. Destructure to create an explicit allowlist (Security best practice)
    const {
      siteName,
      siteDescription,
      doctorName,
      doctorTitle,
      doctorSpecialty,
      doctorBio,
      email,
      phone,
      address,
      socialLinks,
      clinicHours,
      mapEmbedUrl,
    } = payload;

    // 2. Build sanitized object (Only including defined fields)
    const sanitizedPayload: Partial<UpdateAppInfoPayload> = {};

    if (siteName !== undefined) {
      sanitizedPayload.siteName = siteName;
    }
    if (siteDescription !== undefined) {
      sanitizedPayload.siteDescription = siteDescription;
    }
    if (doctorName !== undefined) {
      sanitizedPayload.doctorName = doctorName;
    }
    if (doctorTitle !== undefined) {
      sanitizedPayload.doctorTitle = doctorTitle;
    }
    if (doctorSpecialty !== undefined) {
      sanitizedPayload.doctorSpecialty = doctorSpecialty;
    }
    if (doctorBio !== undefined) {
      sanitizedPayload.doctorBio = doctorBio;
    }
    if (phone !== undefined) {
      sanitizedPayload.phone = phone;
    }
    if (address !== undefined) {
      sanitizedPayload.address = address;
    }
    if (socialLinks !== undefined) {
      sanitizedPayload.socialLinks = socialLinks;
    }
    if (clinicHours !== undefined) {
      sanitizedPayload.clinicHours = clinicHours;
    }
    if (mapEmbedUrl !== undefined) {
      sanitizedPayload.mapEmbedUrl = mapEmbedUrl;
    }

    // 3. Normalize email securely
    if (typeof email === "string") {
      sanitizedPayload.email = email.trim().toLowerCase();
    }

    // 4. Update using $set and secure query
    const updatedAppInfo = await AppInfo.findOneAndUpdate(
      {},
      { $set: sanitizedPayload },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    if (updatedAppInfo) {
      await deleteCache(CACHE_KEY);
    }

    return updatedAppInfo;
  },
};
