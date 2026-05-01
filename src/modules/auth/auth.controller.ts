import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { authService } from "./auth.service";
import type { LoginPayload } from "./auth.interface";

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.login(req.body as LoginPayload);
    new ApiResponse(200, "Login successful", { user }).send(res);
  }),
};
