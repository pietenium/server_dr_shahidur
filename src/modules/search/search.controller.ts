import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { searchService } from "./search.service";

export const searchController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const results = await searchService.universalSearch({ q: query });
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Search results",
      data: results,
    });
  }),
};
