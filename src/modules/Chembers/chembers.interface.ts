import type { Document } from "mongoose";

export interface AvailableTime {
  activeDay: string;
  startTime: string;
  endTime: string;
}

export interface IAChembers extends Document {
  chemberName: string;
  activeDates: AvailableTime[];
  map: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChembersPayload {
  chemberName: string;
  activeDates: AvailableTime[];
  map: string;
}

export type UpdateChembersPayload = Partial<CreateChembersPayload>;
