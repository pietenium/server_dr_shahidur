import { Document } from "mongoose";

export interface IAppInfo extends Document {
  doctorName: string;
  about: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export interface UpdateAppInfoPayload {
  doctorName?: string;
  about?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}
