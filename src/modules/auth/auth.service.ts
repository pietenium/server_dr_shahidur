import { User } from "./auth.model";
import { ApiError } from "@utils/ApiError";
import type { IUser, LoginPayload } from "./auth.interface";

export const authService = {
  login: async (payload: LoginPayload): Promise<IUser> => {
    const user = await User.findOne({ email: payload.email });
    if (!user || !(await user.comparePassword(payload.password))) {
      throw new ApiError(401, "Invalid email or password");
    }
    return user;
  },
};
