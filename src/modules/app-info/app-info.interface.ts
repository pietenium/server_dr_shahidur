import { type Document } from "mongoose";

export interface IAppInfo extends Document {
  siteName: string;
  siteDescription?: string;
  doctorName: string;
  doctorTitle: string;
  doctorSpecialty: string;
  doctorBio?: string;
  doctorImage?: {
    url: string | undefined;
    fileId: string | undefined;
  };
  ogImage?: {
    url: string | undefined;
    fileId: string | undefined;
  };
  email: string;
  phone: string;
  address?: string;
  socialLinks?: {
    facebook?: string | undefined;
    twitter?: string | undefined;
    linkedin?: string | undefined;
    youtube?: string | undefined;
    instagram?: string | undefined;
  };
  clinicHours?: string;
  mapEmbedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateAppInfoPayload {
  siteName?: string;
  siteDescription?: string;
  doctorName?: string;
  doctorTitle?: string;
  doctorSpecialty?: string;
  doctorBio?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: {
    facebook?: string | undefined;
    twitter?: string | undefined;
    linkedin?: string | undefined;
    youtube?: string | undefined;
    instagram?: string | undefined;
  };
  clinicHours?: string;
  mapEmbedUrl?: string;
}
