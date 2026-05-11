import { AppInfo } from "./app-info.model";
import { ApiError } from "@utils/ApiError";
import { APP_INFO_MESSAGES } from "@constants/messages.constant";
import type { UpdateAppInfoPayload, IAppInfo } from "./app-info.interface";
import { getCache, setCache, deleteCache } from "@utils/cache";

export class AppInfoService {
  public async getAppInfo(): Promise<IAppInfo> {
    const cacheKey = "cache:app-info";
    const cached = await getCache<IAppInfo>(cacheKey);

    if (cached) {
      return cached;
    }

    let appInfo = await AppInfo.findOne();

    if (!appInfo) {
      // Create default singleton if it doesn't exist
      // Include ALL required fields from the model
      appInfo = await AppInfo.create({
        siteName: "Dr. Sahidur Rahman Khan",
        siteDescription:
          "Official website of Dr. Md. Sahidur Rahman Khan, Orthopedic Surgeon",
        doctorName: "Dr. Md. Sahidur Rahman Khan",
        doctorTitle: "Orthopedic Surgeon",
        doctorSpecialty: "Orthopedic Surgery",
        doctorBio:
          "Experienced orthopedic surgeon specializing in joint replacement and trauma surgery.",
        email: "contact@domain.com",
        phone: "+8103882343424",
        address: "Dhaka, Bangladesh",
        clinicHours: "Saturday to Thursday: 9:00 AM - 5:00 PM",
        socialLinks: {
          facebook: "",
          twitter: "",
          linkedin: "",
          youtube: "",
          instagram: "",
        },
      });
    }

    const appInfoData = appInfo.toJSON() as IAppInfo;
    await setCache(cacheKey, appInfoData, 3600);
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
      throw new ApiError(
        404,
        APP_INFO_MESSAGES.UPDATED.replace("updated", "not found"),
      );
    }

    // Handle doctor image upload
    if (files?.doctorImage) {
      const { imagekit } = await import("@config/imagekit");
      const uploadResult = await imagekit.files.upload({
        file: files.doctorImage.buffer.toString("base64"),
        fileName: `doctor-image-${Date.now()}`,
        folder: "/doctor-images",
      });
      appInfo.doctorImage = {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      };
    }

    // Handle OG image upload
    if (files?.ogImage) {
      const { imagekit } = await import("@config/imagekit");
      const uploadResult = await imagekit.files.upload({
        file: files.ogImage.buffer.toString("base64"),
        fileName: `og-image-${Date.now()}`,
        folder: "/og-images",
      });
      appInfo.ogImage = {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      };
    }

    // Update only the fields that are provided
    if (payload.siteName !== undefined) {
      appInfo.siteName = payload.siteName;
    }
    if (payload.siteDescription !== undefined) {
      appInfo.siteDescription = payload.siteDescription;
    }
    if (payload.doctorName !== undefined) {
      appInfo.doctorName = payload.doctorName;
    }
    if (payload.doctorTitle !== undefined) {
      appInfo.doctorTitle = payload.doctorTitle;
    }
    if (payload.doctorSpecialty !== undefined) {
      appInfo.doctorSpecialty = payload.doctorSpecialty;
    }
    if (payload.doctorBio !== undefined) {
      appInfo.doctorBio = payload.doctorBio;
    }
    if (payload.email !== undefined) {
      appInfo.email = payload.email;
    }
    if (payload.phone !== undefined) {
      appInfo.phone = payload.phone;
    }
    if (payload.address !== undefined) {
      appInfo.address = payload.address;
    }
    if (payload.socialLinks) {
      // Initialize socialLinks if it doesn't exist
      if (!appInfo.socialLinks) {
        appInfo.socialLinks = {};
      }

      if (payload.socialLinks.facebook !== undefined) {
        appInfo.socialLinks.facebook = payload.socialLinks.facebook;
      }
      if (payload.socialLinks.twitter !== undefined) {
        appInfo.socialLinks.twitter = payload.socialLinks.twitter;
      }
      if (payload.socialLinks.linkedin !== undefined) {
        appInfo.socialLinks.linkedin = payload.socialLinks.linkedin;
      }
      if (payload.socialLinks.youtube !== undefined) {
        appInfo.socialLinks.youtube = payload.socialLinks.youtube;
      }
      if (payload.socialLinks.instagram !== undefined) {
        appInfo.socialLinks.instagram = payload.socialLinks.instagram;
      }
    }
    if (payload.clinicHours !== undefined) {
      appInfo.clinicHours = payload.clinicHours;
    }
    if (payload.mapEmbedUrl !== undefined) {
      appInfo.mapEmbedUrl = payload.mapEmbedUrl;
    }

    await appInfo.save();

    // Invalidate cache
    await deleteCache("cache:app-info");

    return appInfo;
  }
}
