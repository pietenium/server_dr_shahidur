import { AUTH_MESSAGES } from "@constants/messages.constant";
import type { Role } from "@constants/roles.constant";
import { ApiError } from "@utils/ApiError";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const authorize = (...roles: Role[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(StatusCodes.FORBIDDEN, AUTH_MESSAGES.FORBIDDEN));
      return;
    }

    next();
  };
};
