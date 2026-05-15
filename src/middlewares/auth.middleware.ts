import { env } from "@config/env";
import { getRedisClient } from "@config/redis";
import { AUTH_MESSAGES } from "@constants/messages.constant";
import type { JwtAccessPayload } from "@modules/auth/auth.interface";
import { ApiError } from "@utils/ApiError";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

// Extracts the Bearer token from the Authorization header.
// Returns an empty string if not present or malformed — jwt.verify will
// reject it deterministically, removing any user-controlled bypass.
const extractBearerToken = (req: Request): string => {
  const raw = req.headers.authorization;
  if (typeof raw !== "string") {
    return "";
  }
  const parts = raw.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return "";
  }
  return parts[1] ?? "";
};

// Checks the Redis blacklist for the JTI claim of an access token.
// Returns true if blacklisted (revoked), false otherwise.
// Falls back to false on Redis errors to avoid blocking legitimate requests.
const isJtiBlacklisted = async (jti: string): Promise<boolean> => {
  try {
    const redis = getRedisClient();
    const result = await redis.get(`blacklist:jti:${jti}`);
    return result !== null;
  } catch {
    return false;
  }
};

// Verifies the token and returns a decoded payload or throws.
// All error paths — empty token, bad signature, expired, blacklisted — throw an ApiError.
const verifyAndDecodeToken = async (
  token: string,
): Promise<JwtAccessPayload> => {
  // jwt.verify throws JsonWebTokenError for empty/invalid tokens,
  // so we never need to check the token value ourselves.
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;

  if (await isJtiBlacklisted(decoded.jti)) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Session has been invalidated. Please log in again.",
    );
  }

  return decoded;
};

export const authenticate: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = extractBearerToken(req);

  verifyAndDecodeToken(token)
    .then((decoded) => {
      req.user = {
        _id: decoded._id,
        role: decoded.role,
        jti: decoded.jti,
      };
      next();
    })
    .catch((error: unknown) => {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(
          new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED),
        );
      }
    });
};

export const optionalAuthenticate: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = extractBearerToken(req);

  // Always attempt verification. jwt.verify deterministically rejects
  // empty or malformed tokens — no user-controlled conditional guards.
  verifyAndDecodeToken(token)
    .then((decoded) => {
      req.user = {
        _id: decoded._id,
        role: decoded.role,
        jti: decoded.jti,
      };
      next();
    })
    .catch(() => {
      // All failure cases (no token, bad token, expired, blacklisted) are
      // silently ignored — the request proceeds as unauthenticated.
      next();
    });
};
