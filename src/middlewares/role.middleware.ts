import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "@utils/ApiError";
import { Role } from "@constants/roles.constant";
import { AUTH_MESSAGES } from "@constants/messages.constant";

export const authorize = (...roles: Role[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, AUTH_MESSAGES.UNAUTHORIZED));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, AUTH_MESSAGES.FORBIDDEN));
      return;
    }

    next();
  };
};
