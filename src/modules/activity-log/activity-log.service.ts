import { ActivityLog } from "./activity-log.model";
import type {
  IActivityLog,
  CreateLogPayload,
  LogFilterQuery,
} from "./activity-log.interface";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";

export const activityLogService = {
  create: async (payload: CreateLogPayload): Promise<IActivityLog> => {
    const log = await ActivityLog.create(payload as unknown as Partial<IActivityLog>);
    return log;
  },

  getLogs: async (query: LogFilterQuery): Promise<unknown> => {
    const { user, module, startDate, endDate, page = 1, limit = 20 } = query;

    const filter: Record<string, unknown> = {};

    if (user) {
      filter.user = { $eq: user };
    }
    if (module) {
      filter.module = { $eq: module };
    }
    if (startDate ?? endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
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

  deleteById: async (id: string): Promise<void> => {
    const log = await ActivityLog.findOne({ _id: { $eq: id } });
    if (!log) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Activity log not found");
    }
    await ActivityLog.findOneAndDelete({ _id: { $eq: id } });
  },

  bulkDelete: async (ids: string[]): Promise<{ deletedCount: number }> => {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Provide a non-empty array of IDs");
    }
    const result = await ActivityLog.deleteMany({ _id: { $in: ids } });
    return { deletedCount: result.deletedCount || 0 };
  },

  clearAll: async (): Promise<{ deletedCount: number }> => {
    const result = await ActivityLog.deleteMany({});
    return { deletedCount: result.deletedCount || 0 };
  },
};
