import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

import { getRedisClient, isRedisReady } from "@config/redis";
import { StatusCodes } from "http-status-codes";

const createStore = () => {
  if (!isRedisReady()) {
    console.warn("Redis not ready. Using memory store.");
    return undefined;
  }

  const client = getRedisClient();

  return new RedisStore({
    // @ts-expect-error ioredis typing issue
    sendCommand: (...args: string[]) => {
      return client.call(...(args as [string, ...string[]]));
    },
  });
};

const commonConfig = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const authLimiter = rateLimit({
  ...commonConfig,

  windowMs: 15 * 60 * 1000,
  max: 50,

  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many authentication requests, please try again later.",
  },

  store: createStore(),
});

export const analyticsLimiter = rateLimit({
  ...commonConfig,

  windowMs: 60 * 1000,
  max: 60,

  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many tracking requests, please try again later.",
  },

  store: createStore(),
});

export const searchLimiter = rateLimit({
  ...commonConfig,

  windowMs: 60 * 1000,
  max: 30,

  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many search requests, please try again later.",
  },

  store: createStore(),
});

export const globalLimiter = rateLimit({
  ...commonConfig,

  windowMs: 15 * 60 * 1000,
  max: 100,

  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many requests from this IP, please try again later.",
  },

  store: createStore(),
});

export const appointmentLimiter = rateLimit({
  ...commonConfig,

  windowMs: 15 * 60 * 1000,
  max: 10,

  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many appointment requests, please try again later.",
  },

  store: createStore(),
});
