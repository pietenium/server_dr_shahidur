import type { GeoLocation } from "@types-app/global.types";
import type { Document, Types } from "mongoose";
import type { IAChembers } from "@modules/Chembers/chembers.interface";

export interface IAppointment extends Document {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  chemberId: Types.ObjectId | IAChembers;
  preferredDate: Date;
  preferredTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  ipAddress: string;
  location: GeoLocation;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentPayload {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  chemberId: string;
  preferredDate: string;
  preferredTime: string;
}

export interface AppointmentFilterQuery {
  status?: string;
  chemberId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentChartData {
  dailyCounts: Array<{ _id: string; count: number }>;
  monthlyCounts: Array<{ _id: string; count: number }>;
  totalCount: number;
  statusDistribution: Array<{ _id: string; count: number }>;
}

export interface BulkDeletePayload {
  ids: string[];
  status?: "CANCELLED" | "CONFIRMED";
}
