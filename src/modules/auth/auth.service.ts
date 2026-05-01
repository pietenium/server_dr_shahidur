import { User } from "./auth.model";
import { ApiError } from "@utils/ApiError";
import type { IUser, LoginPayload } from "./auth.interface";
import { StatusCodes } from "http-status-codes";

export const authService = {
  login: async (payload: LoginPayload): Promise<IUser> => {
    const user = await User.findOne({ email: payload.email });
    if (!user || !(await user.comparePassword(payload.password))) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }
    return user;
  },
};
