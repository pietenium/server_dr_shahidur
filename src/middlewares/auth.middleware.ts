import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { ApiError } from "@utils/ApiError";
import type { JwtAccessPayload } from "@modules/auth/auth.interface";
import { AUTH_MESSAGES } from "@constants/messages.constant";
import { StatusCodes } from "http-status-codes";
import { getRedisClient } from "@config/redis";

export const authenticate: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED));
  }

  const token = authHeader.substring(7);
  if (!token) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED));
  }

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as JwtAccessPayload;

    // Check Redis blacklist for JTI
    const redis = getRedisClient();
    void redis.get(`blacklist:jti:${decoded.jti}`).then((isBlacklisted) => {
      if (isBlacklisted) {
        return next(new ApiError(StatusCodes.UNAUTHORIZED, "Session has been invalidated. Please log in again."));
      }

      req.user = {
        _id: decoded._id,
        role: decoded.role,
        email: "",
        name: "",
      };

      next();
    }).catch(() => {
      // Redis error should not block authentication
      req.user = {
        _id: decoded._id,
        role: decoded.role,
        email: "",
        name: "",
      };
      next();
    });
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED));
    }
  }
};

export const optionalAuthenticate: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  // We use a non-blocking identification flow.
  // If no valid token is provided, req.user remains undefined, and we proceed.
  Promise.resolve().then(async () => {
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token) {
        try {
          const decoded = jwt.verify(
            token,
            env.JWT_ACCESS_SECRET,
          ) as JwtAccessPayload;

          const redis = getRedisClient();
          const isBlacklisted = await redis.get(`blacklist:jti:${decoded.jti}`);

          if (!isBlacklisted) {
            req.user = {
              _id: decoded._id,
              role: decoded.role,
              email: "",
              name: "",
            };
          }
        } catch {
          // Ignore verification errors for optional identification
        }
      }
    }
    next();
  }).catch(() => next());
};
