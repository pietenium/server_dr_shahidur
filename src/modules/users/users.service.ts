import { User } from "@modules/auth/auth.model";
import type { PaginateModel } from "mongoose";
import type { IUser } from "@modules/auth/auth.interface";
import type {
  UpdateProfilePayload,
  ChangePasswordPayload,
  InviteModeratorPayload,
  UserFilterQuery,
} from "./users.interface";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import { sendEmail } from "@emails/sendEmail";
import { moderatorInviteTemplate } from "@emails/template/moderator-invite.template";
import { env } from "@config/env";
import type { PaginatedResult } from "@types-app/global.types";

type SafeUser = Omit<IUser, "password">;

export const usersService = {
  getMe: async (userId: string): Promise<SafeUser> => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    return user;
  },

  updateMe: async (userId: string, payload: UpdateProfilePayload): Promise<SafeUser> => {
    const safeUpdate: Partial<UpdateProfilePayload> = {};
    if (typeof payload.name === "string") {
      const trimmedName = payload.name.trim();
      if (trimmedName.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Name cannot be empty");
      }
      safeUpdate.name = trimmedName;
    }

    if (payload.email) {
      if (typeof payload.email !== "string") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid email format");
      }
      const existing = await User.findOne({ email: { $eq: payload.email }, _id: { $ne: userId } });
      if (existing) {
        throw new ApiError(StatusCodes.CONFLICT, "Email already in use");
      }
      safeUpdate.email = payload.email;
    }

    const user = await User.findByIdAndUpdate(userId, safeUpdate, { new: true }).select("-password");
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    return user;
  },

  changePassword: async (userId: string, payload: ChangePasswordPayload): Promise<void> => {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    const isMatch = await user.comparePassword(payload.currentPassword);
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Current password is incorrect");
    }

    user.password = payload.newPassword;
    await user.save();
  },

  getAllUsers: async (query: UserFilterQuery): Promise<PaginatedResult<SafeUser>> => {
    const { role, isActive, search, page = 1, limit = 10 } = query;
    const filter: Record<string, unknown> = {};

    if (role) { filter.role = role; }
    if (typeof isActive === "boolean") { filter.isActive = isActive; }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const result = await (User as unknown as PaginateModel<IUser>).paginate(filter, {
      page,
      limit,
      select: "-password",
      sort: { createdAt: -1 },
    });

    return {
      results: result.docs as unknown as SafeUser[],
      pagination: {
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.page ?? 1,
        limit: result.limit ?? 10,
        hasNextPage: !!result.hasNextPage,
        hasPrevPage: !!result.hasPrevPage,
      },
    };
  },

  inviteModerator: async (payload: InviteModeratorPayload): Promise<SafeUser> => {
    if (typeof payload.email !== "string") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid email format");
    }
    if (typeof payload.name !== "string") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid name format");
    }
    const existing = await User.findOne({ email: { $eq: payload.email } });

    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, "User already exists with this email");
    }

    const temporaryPassword = crypto.randomBytes(8).toString("hex");

    const moderator = await User.create({
      name: payload.name,
      email: payload.email,
      password: temporaryPassword,
      role: "MODERATOR",
      isActive: true,
    });

    // Send invite email (non-blocking)
    void sendEmail({
      to: payload.email,
      subject: "Invitation to Join as Moderator",
      html: moderatorInviteTemplate({
        name: payload.name,
        email: payload.email,
        temporaryPassword,
        dashboardUrl: env.CLIENT_DASHBOARD_URL,
      }),
    });

    const { password: _, ...userObj } = moderator.toObject();
    return userObj as unknown as SafeUser;
  },

  toggleUserActive: async (adminId: string, userId: string): Promise<SafeUser> => {
    if (adminId === userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You cannot toggle your own account status");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    if (user.role === "ADMIN") {
      throw new ApiError(StatusCodes.FORBIDDEN, "Admin account status cannot be toggled");
    }

    user.isActive = !user.isActive;
    await user.save();

    const { password: _, ...userObj } = user.toObject();
    return userObj as unknown as SafeUser;
  },

  deleteUser: async (adminId: string, userId: string): Promise<void> => {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    if (userId === adminId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You cannot delete your own account");
    }

    if (user.role === "ADMIN") {
      const adminCount = await User.countDocuments({ role: "ADMIN" });
      if (adminCount <= 1) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Cannot delete the last administrator");
      }
    }

    await User.findByIdAndDelete(userId);
  },
};
