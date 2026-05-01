import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IAppointment } from "./appointment.interface";

const appointmentSchema = new Schema<IAppointment>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    message: { type: String },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "PENDING" },
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

appointmentSchema.plugin(mongoosePaginate);

export const Appointment = mongoose.model<IAppointment>("Appointment", appointmentSchema);
