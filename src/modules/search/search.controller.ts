import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { searchService } from "./search.service";
import type { SearchQuery } from "./search.interface";

export const searchController = {
  universalSearch: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as SearchQuery;
    const result = await searchService.universalSearch(query);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Search completed successfully",
      data: result,
    });
  }),
};
