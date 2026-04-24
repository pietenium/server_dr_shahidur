import { Document, Model } from "mongoose";
import { AppointmentStatus } from "@constants/status.constant";
import { SmsLogEntry } from "@types-app/global.types";
import { PaginateResult } from "mongoose-paginate-v2";

export interface IAppointment extends Document {
  name: string;
  phone: string;
  email: string;
  reason: string;
  preferredDate: Date;
  status: AppointmentStatus;
  smsLog: SmsLogEntry[];
}

export interface CreateAppointmentPayload {
  name: string;
  phone: string;
  email: string;
  reason: string;
  preferredDate: string;
}

export interface AppointmentFilterQuery {
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentChartData {
  _id: string;
  count: number;
}

export interface SendSmsPayload {
  message: string;
}

export type AppointmentModel = Model<IAppointment> & {
  paginate: (
    filter: object,
    options: object,
  ) => Promise<PaginateResult<IAppointment>>;
};
