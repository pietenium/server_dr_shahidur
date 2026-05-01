import { ActivityLog } from "./activity-log.model";
import type { IActivityLog, CreateLogPayload } from "./activity-log.interface";

export const activityLogService = {
  create: async (payload: CreateLogPayload): Promise<IActivityLog> => {
    return ActivityLog.create(payload as any);
  },
};
