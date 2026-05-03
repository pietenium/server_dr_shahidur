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

export const usersController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");}
    const user = await usersService.getMe(req.user._id);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");}
    const user = await usersService.updateMe(req.user._id, req.body as UpdateProfilePayload);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");}
    await usersService.changePassword(req.user._id, req.body as ChangePasswordPayload);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Password changed successfully",
      data: null,
    });
  }),

  getAllUsers: asyncHandler(async (req: Request, res: Response) => {
    const result = await usersService.getAllUsers(req.query);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  }),

  inviteModerator: asyncHandler(async (req: Request, res: Response) => {
    const moderator = await usersService.inviteModerator(req.body as InviteModeratorPayload);
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Moderator invited successfully",
      data: moderator,
    });
  }),

  toggleUserActive: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");}
    const user = await usersService.toggleUserActive(req.user._id, req.params.id as string);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User status toggled successfully",
      data: user,
    });
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");}
    await usersService.deleteUser(req.user._id, req.params.id as string);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User deleted successfully",
      data: null,
    });
  }),
};
