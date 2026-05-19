import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IAChembers } from "./chembers.interface";

const chemberSchema = new Schema<IAChembers>(
  {
    chemberName: { type: String, required: true, trim: true },
    map: { type: String, required: true, trim: true },
    activeDates: [
      {
        activeDay: {
          type: String,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

chemberSchema.set("toJSON", {
  transform: (_doc, ret: { __v?: number }) => {
    delete ret.__v;
    return ret;
  },
});

chemberSchema.plugin(mongoosePaginate);

chemberSchema.index({ chemberName: 1 });

export const Chember = mongoose.model<IAChembers>("Chember", chemberSchema);
