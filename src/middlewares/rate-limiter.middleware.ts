import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { getRedisClient, isRedisReady } from "@config/redis";
import { StatusCodes } from "http-status-codes";

// Helper to get store
const getStore = () => {
  return new RedisStore({
    // @ts-expect-error - Known typing issue with rate-limit-redis and ioredis
    sendCommand: (...args: string[]) => {
      const client = getRedisClient();
      if (isRedisReady()) {
        return client.call(...(args as [string, ...string[]]));
      }
      return Promise.reject(new Error("Redis not ready"));
    },
  });
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many authentication requests, please try again later.",
  },
  store: getStore(),
});

export const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many tracking requests, please try again later.",
  },
  store: getStore(),
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many search requests, please try again later.",
  },
  store: getStore(),
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many requests from this IP, please try again later.",
  },
  store: getStore(),
});

export const appointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many appointment requests, please try again later.",
  },
  store: getStore(),
});
