import { Document } from "mongoose";
export interface IAppInfo extends Document {
  siteName: string;
  siteDescription?: string;
  doctorName: string;
  doctorTitle: string;
  doctorSpecialty: string;
  doctorBio?: string;
  doctorImage?: {
    url: string;
    fileId: string;
  };
  ogImage?: {
    url: string;
    fileId: string;
  };
  email: string;
  phone: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
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
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
  };
  clinicHours?: string;
  mapEmbedUrl?: string;
}
