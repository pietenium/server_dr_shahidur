import type { Response } from "express";

interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  minImpressions?: number;
}

interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: IMeta;
}

export const ApiResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    meta: data.meta,
  });
};
