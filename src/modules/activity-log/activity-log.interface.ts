import { Document, Types } from "mongoose";
import { IUser } from "@modules/auth/auth.interface";

export interface IActivityLog extends Document {
  user: Types.ObjectId | IUser;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface CreateLogPayload {
  user: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  userAgent: string;
}

export interface LogFilterQuery {
  user?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BulkDeletePayload {
  ids: string[];
}
