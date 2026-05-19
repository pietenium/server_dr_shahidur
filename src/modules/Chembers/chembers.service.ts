import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";
import type {
  CreateChembersPayload,
  IAChembers,
  UpdateChembersPayload,
} from "./chembers.interface";
import { Chember } from "./chembers.model";

export const chemberService = {
  getAll: async (): Promise<IAChembers[]> => {
    const chembers = await Chember.find({});
    if (chembers.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, "No chambers found");
    }
    return chembers;
  },

  getById: async (id: string): Promise<IAChembers> => {
    const chember = await Chember.findById(id);
    if (!chember) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Chamber not found");
    }
    return chember;
  },

  create: async (payload: CreateChembersPayload): Promise<IAChembers> => {
    const chember = await Chember.create({ ...payload });
    return chember;
  },

  update: async (
    id: string,
    payload: UpdateChembersPayload,
  ): Promise<IAChembers> => {
    const chember = await Chember.findById(id);
    if (!chember) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Chamber not found");
    }

    if (payload.chemberName !== undefined) {
      chember.chemberName = payload.chemberName;
    }
    if (payload.activeDates !== undefined) {
      chember.activeDates = payload.activeDates;
    }
    if (payload.map !== undefined) {
      chember.map = payload.map;
    }

    await chember.save();
    return chember;
  },

  delete: async (id: string): Promise<void> => {
    const chember = await Chember.findById(id);
    if (!chember) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Chamber not found");
    }
    await chember.deleteOne();
  },
};
