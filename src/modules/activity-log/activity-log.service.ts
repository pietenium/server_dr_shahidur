import { ActivityLog } from "./activity-log.model";
import type { Types } from "mongoose";
import type { IActivityLog, CreateLogPayload, LogFilterQuery } from "./activity-log.interface";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { ROLES } from "@constants/roles.constant";

export const activityLogService = {
  create: async (payload: CreateLogPayload): Promise<IActivityLog> => {
    const log = await ActivityLog.create(payload as unknown as Partial<IActivityLog>);
    return log;
  },

  getLogs: async (query: LogFilterQuery, user: Express.AuthenticatedUser): Promise<unknown> => {
    const { user: userFilter, module, startDate, endDate, page = 1, limit = 20 } = query;

    const filter: Record<string, unknown> = {};

    // Role-based scoping
    if (user.role === ROLES.MODERATOR) {
      filter.user = { $eq: user._id };
    } else if (userFilter) {
      filter.user = { $eq: userFilter };
    }

    if (module) {
      filter.module = { $eq: module };
    }
    if (startDate ?? endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) {dateFilter.$gte = new Date(startDate);}
      if (endDate) {dateFilter.$lte = new Date(endDate);}
      filter.createdAt = dateFilter;
    }

    const options = {
      page,
      limit,
      sort: "-createdAt",
      populate: {
        path: "user",
        select: "name email role",
      },
    };

    const results = await ActivityLog.paginate(filter, options);
    return results;
  },

  deleteById: async (id: string, user: Express.AuthenticatedUser): Promise<void> => {
    const log = await ActivityLog.findById(id);
    if (!log) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Activity log not found");
    }

    // Ownership check for moderators
    if (user.role === ROLES.MODERATOR && (log.user as Types.ObjectId).toHexString() !== user._id) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own logs");
    }

    await ActivityLog.findByIdAndDelete(id);
  },

  bulkDelete: async (ids: string[], user: Express.AuthenticatedUser): Promise<{ deletedCount: number }> => {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Provide a non-empty array of IDs");
    }

    const filter: Record<string, unknown> = { _id: { $in: ids } };
    
    // Ownership check for moderators
    if (user.role === ROLES.MODERATOR) {
      filter.user = { $eq: user._id };
    }

    const result = await ActivityLog.deleteMany(filter);
    return { deletedCount: result.deletedCount || 0 };
  },

  clearAll: async (user: Express.AuthenticatedUser): Promise<{ deletedCount: number }> => {
    const filter: Record<string, unknown> = {};
    
    // Ownership check for moderators
    if (user.role === ROLES.MODERATOR) {
      filter.user = { $eq: user._id };
    }

    const result = await ActivityLog.deleteMany(filter);
    return { deletedCount: result.deletedCount || 0 };
  },
};
