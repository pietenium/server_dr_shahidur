import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IContact } from "./contact.interface";

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    reason: { type: String, enum: ["medical-inquiry", "general", "media", "other"], required: true },
    ipAddress: { type: String },
    location: {
      country: String,
      region: String,
      city: String,
      lat: Number,
      lon: Number,
      ip: String,
    },
    isRead: { type: Boolean, default: false },
    telegramMessageId: { type: Number },
  },
  { timestamps: true },
);

contactSchema.plugin(mongoosePaginate);

export const Contact = mongoose.model<IContact>("Contact", contactSchema);
