import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IActivityLog } from "./activity-log.interface";

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    description: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activityLogSchema.plugin(mongoosePaginate);

export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
