declare module "mongoose-paginate-v2" {
  import { Schema, Model, Document, FilterQuery, QueryOptions } from "mongoose";

  interface PaginateOptions {
    select?: object | string;
    sort?: object | string;
    populate?: object | string | Array<object | string>;
    lean?: boolean;
    leanWithId?: boolean;
    offset?: number;
    page?: number;
    limit?: number;
    customLabels?: object;
    pagination?: boolean;
    useEstimatedCount?: boolean;
    useCustomCountFn?: boolean;
    forceCountFn?: boolean;
    allowDiskUse?: boolean;
    read?: object;
    options?: QueryOptions;
  }

  interface PaginateResult<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page?: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage?: number | null;
    nextPage?: number | null;
  }

  // The PaginateModel interface that combines Model with paginate method
  interface PaginateModel<
    T extends Document,
    TQueryHelpers = Record<string, unknown>,
    TMethods = Record<string, unknown>,
  > extends Model<T, TQueryHelpers, TMethods> {
    paginate(
      filter?: FilterQuery<T>,
      options?: PaginateOptions,
    ): Promise<PaginateResult<T>>;
  }

  function paginate<T extends Document>(schema: Schema<T>): void;

  export default paginate;
  export { PaginateResult, PaginateOptions, PaginateModel };
}
