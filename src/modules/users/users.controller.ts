import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { StatusCodes } from "http-status-codes";
import { usersService } from "./users.service";
import { ApiError } from "@utils/ApiError";
import type {
  UpdateProfilePayload,
  ChangePasswordPayload,
  InviteModeratorPayload,
} from "./users.interface";
import { USER_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";

export const usersController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const user = await usersService.getMe(req.user._id);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: USER_MESSAGES.PROFILE_FETCHED,
      data: user,
    });
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const user = await usersService.updateMe(req.user._id, req.body as UpdateProfilePayload);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: USER_MESSAGES.PROFILE_UPDATED,
      data: user,
    });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    await usersService.changePassword(req.user._id, req.body as ChangePasswordPayload);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: USER_MESSAGES.PASSWORD_CHANGED,
      data: null,
    });
  }),

  getAllUsers: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const result = await usersService.getAllUsers(req.query);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: USER_MESSAGES.FETCHED,
      data: result,
    });
  }),

  inviteModerator: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const moderator = await usersService.inviteModerator(req.body as InviteModeratorPayload);
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: USER_MESSAGES.MODERATOR_INVITED,
      data: moderator,
    });
  }),

  toggleUserActive: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    const user = await usersService.toggleUserActive(req.user._id, req.params.id as string);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: USER_MESSAGES.STATUS_TOGGLED,
      data: user,
    });
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }
    await usersService.deleteUser(req.user._id, req.params.id as string);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: USER_MESSAGES.DELETED,
      data: null,
    });
  }),
};
