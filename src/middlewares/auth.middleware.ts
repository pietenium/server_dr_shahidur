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
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];
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

  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as JwtAccessPayload;

    const redis = getRedisClient();
    void redis.get(`blacklist:jti:${decoded.jti}`).then((isBlacklisted) => {
      if (!isBlacklisted) {
        req.user = {
          _id: decoded._id,
          role: decoded.role,
          email: "",
          name: "",
        };
      }
      next();
    }).catch(() => {
      // Redis error should not block optional identity
      req.user = {
        _id: decoded._id,
        role: decoded.role,
        email: "",
        name: "",
      };
      next();
    });
  } catch (_error) {
    // If token is invalid, just proceed as unauthenticated
    next();
  }
};


