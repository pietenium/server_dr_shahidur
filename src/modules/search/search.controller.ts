import { SEARCH_MESSAGES } from "@constants/messages.constant";
import { ApiResponse } from "@utils/ApiResponse";
import { asyncHandler } from "@utils/asyncHandler";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { SearchQuery } from "./search.interface";
import { searchService } from "./search.service";

export const searchController = {
  universalSearch: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as SearchQuery;
    const result = await searchService.universalSearch(query);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: SEARCH_MESSAGES.SUCCESS,
      data: result,
    });
  }),
};
