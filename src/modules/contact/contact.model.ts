import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IContact } from "./contact.interface";

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    reason: {
      type: String,
      enum: ["medical-inquiry", "general", "media", "other"],
      default: "general",
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
    isRead: { type: Boolean, default: false },
    telegramMessageId: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  },
);

contactSchema.plugin(mongoosePaginate);

// Indexes for common queries
contactSchema.index({ isRead: 1 });
contactSchema.index({ reason: 1 });
contactSchema.index({ createdAt: -1 });

export const Contact = mongoose.model<
  IContact,
  mongoose.PaginateModel<IContact>
>("Contact", contactSchema);
