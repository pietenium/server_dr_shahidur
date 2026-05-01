import { AppInfo } from "./app-info.model";
import type { IAppInfo, UpdateAppInfoPayload } from "./app-info.interface";

export const appInfoService = {
  get: async (): Promise<IAppInfo | null> => {
    return AppInfo.findOne();
  },
  update: async (payload: UpdateAppInfoPayload): Promise<IAppInfo | null> => {
    return AppInfo.findOneAndUpdate({}, payload, { new: true, upsert: true });
  },
};
