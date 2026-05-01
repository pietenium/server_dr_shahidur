import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { articleService } from "./article.service";
import type { CreateArticlePayload } from "./article.interface";

export const articleController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await articleService.create(req.body as CreateArticlePayload);
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Article created",
      data: record,
    });
  }),
};
