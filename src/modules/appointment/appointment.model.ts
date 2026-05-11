import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IAppointment } from "./appointment.interface";
import { APPOINTMENT_STATUS } from "@constants/status.constant";

const appointmentSchema = new Schema<IAppointment>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    message: { type: String },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING,
    },
    ipAddress: { type: String },
    location: {
      country: String,
      region: String,
      city: String,
      lat: Number,
      lon: Number,
      ip: String,
    },
  },
  { timestamps: true },
);

appointmentSchema.set("toJSON", {
  transform: (_doc, ret: { __v?: number }) => {
    delete ret.__v;
    return ret;
  },
});

appointmentSchema.plugin(mongoosePaginate);

// Indexes for admin list and date-range queries
appointmentSchema.index({ status: 1, createdAt: -1 });
appointmentSchema.index({ preferredDate: 1 });

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema,
);
