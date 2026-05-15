import { logger } from "@utils/logger";
import chalk from "chalk";
import Redis from "ioredis";
import { env } from "./env";

let redisClient: Redis;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,

      retryStrategy(times: number) {
        if (times > 3) {
          return null;
        }

        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on("connect", () => {
      logger.info(chalk.green("Redis connected."));
    });

    redisClient.on("ready", () => {
      logger.info(chalk.green("Redis ready."));
    });

    redisClient.on("error", (err: Error) => {
      logger.error(chalk.red(err.message));
    });

    await redisClient.connect();

    await redisClient.ping();
  } catch (error) {
    logger.warn(
      chalk.yellow(
        "Redis unavailable.",
        error instanceof Error ? error.message : error,
      ),
    );
  }
};

export const getRedisClient = (): Redis => redisClient;

export const isRedisReady = (): boolean => {
  return redisClient?.status === "ready";
};
