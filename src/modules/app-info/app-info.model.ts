import mongoose, { Schema } from "mongoose";
import type { IAppInfo } from "./app-info.interface";

const appInfoSchema = new Schema<IAppInfo>(
  {
    siteName: { type: String, required: true, trim: true },
    siteDescription: { type: String, trim: true },
    doctorName: { type: String, required: true, trim: true },
    doctorTitle: { type: String, required: true, trim: true },
    doctorSpecialty: { type: String, required: true, trim: true },
    doctorBio: { type: String, trim: true },
    doctorImage: {
      url: String,
      fileId: String,
    },
    ogImage: {
      url: String,
      fileId: String,
    },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String,
      youtube: String,
      instagram: String,
    },
    clinicHours: { type: String, trim: true },
    mapEmbedUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  },
);

export const AppInfo = mongoose.model<IAppInfo>("AppInfo", appInfoSchema);
