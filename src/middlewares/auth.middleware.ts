import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { ApiError } from "@utils/ApiError";
import type { JwtAccessPayload } from "@modules/auth/auth.interface";
import { AUTH_MESSAGES } from "@constants/messages.constant";

export const authenticate: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as JwtAccessPayload;

    req.user = {
      _id: decoded._id,
      role: decoded.role,
      email: "",
      name: "",
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, AUTH_MESSAGES.UNAUTHORIZED));
    }
  }
};
