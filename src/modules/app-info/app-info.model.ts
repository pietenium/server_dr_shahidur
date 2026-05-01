import mongoose, { Schema } from "mongoose";
import type { IAppInfo } from "./app-info.interface";

const appInfoSchema = new Schema<IAppInfo>(
  {
    siteName: { type: String, required: true },
    siteDescription: { type: String },
    doctorName: { type: String, required: true },
    doctorTitle: { type: String, required: true },
    doctorSpecialty: { type: String, required: true },
    doctorBio: { type: String },
    doctorImage: {
      url: String,
      fileId: String,
    },
    ogImage: {
      url: String,
      fileId: String,
    },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String,
      youtube: String,
      instagram: String,
    },
    clinicHours: { type: String },
    mapEmbedUrl: { type: String },
  },
  { timestamps: true },
);

export const AppInfo = mongoose.model<IAppInfo>("AppInfo", appInfoSchema);
