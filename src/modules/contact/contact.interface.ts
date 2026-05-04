import type { Document } from "mongoose";
import type { GeoLocation } from "@types-app/global.types";

import type { ContactReason } from "@constants/status.constant";

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  reason: ContactReason;
  ipAddress: string;
  location: GeoLocation;
  isRead: boolean;
  telegramMessageId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  reason: ContactReason;
}

export interface ContactFilterQuery {
  isRead?: boolean;
  reason?: ContactReason;
  page?: number;
  limit?: number;
}
