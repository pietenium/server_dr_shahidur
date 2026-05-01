import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { articleService } from "./article.service";
import type { CreateArticlePayload } from "./article.interface";

export const articleController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await articleService.create(req.body as CreateArticlePayload);
    new ApiResponse(201, "Article created", record).send(res);
  }),
};
