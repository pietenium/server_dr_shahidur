import { Document } from "mongoose";
import { GeoLocation } from "@types-app/global.types";

export interface IAppointment extends Document {
  name: string;
  phone: string;
  email?: string;
  message?: string;
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
  preferredDate: string;
  preferredTime: string;
}

export interface AppointmentFilterQuery {
  status?: string;
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
