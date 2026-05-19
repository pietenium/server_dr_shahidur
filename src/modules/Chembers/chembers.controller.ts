import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { chemberService } from "./chembers.service";
import type {
  CreateChembersPayload,
  UpdateChembersPayload,
} from "./chembers.interface";
import { AUTH_MESSAGES } from "@constants/messages.constant";

export const chemberController = {
  getAll: asyncHandler(async (_req: Request, res: Response) => {
    const chembers = await chemberService.getAll();
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Chambers fetched successfully",
      data: chembers,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const chember = await chemberService.getById(id as string);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Chamber fetched successfully",
      data: chember,
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const payload = req.body as CreateChembersPayload;
    const chember = await chemberService.create(payload);
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Chamber created successfully",
      data: chember,
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const { id } = req.params;
    const payload = req.body as UpdateChembersPayload;
    const chember = await chemberService.update(id as string, payload);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Chamber updated successfully",
      data: chember,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const { id } = req.params;
    await chemberService.delete(id as string);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Chamber deleted successfully",
      data: null,
    });
  }),
};
