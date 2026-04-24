import { Document, Types, Model } from "mongoose";
import { PaginateResult } from "mongoose-paginate-v2";
import { IUser } from "@modules/auth/auth.interface";

export interface IActivityLog extends Document {
  user: Types.ObjectId | IUser;
  module: string;
  action: string;
  description: string;
  timestamp: Date;
}

export interface CreateLogPayload {
  user: string;
  module: string;
  action: string;
  description: string;
}

export interface LogFilterQuery {
  user?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BulkDeletePayload {
  ids: string[];
}

export type ActivityLogModel = Model<IActivityLog> & {
  paginate: (
    filter: object,
    options: object,
  ) => Promise<PaginateResult<IActivityLog>>;
};
