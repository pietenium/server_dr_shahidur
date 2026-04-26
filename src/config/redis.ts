import Redis from "ioredis";
import chalk from "chalk";
import { env } from "./env";

let redisClient: Redis;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times: number) {
        const delay = Math.min(times * 200, 2000);
        if (times > 3) {
          return null;
        }
        return delay;
      },
    });

    redisClient.on("connect", () => {
      console.log(chalk.green("Redis connected successfully."));
    });

    redisClient.on("error", (error: Error) => {
      console.log(chalk.red(`Redis error: ${error.message}`));
    });

    redisClient.on("close", () => {
      console.log(chalk.yellow("Redis connection closed."));
    });

    // Test connection
    await redisClient.ping();
  } catch (error) {
    console.log(
      chalk.yellow(
        "Warning: Redis connection failed. Continuing without cache.",
      ),
    );
    console.log(chalk.yellow(`Redis error: ${(error as Error).message}`));
  }
};

export const getRedisClient = (): Redis => {
  return redisClient;
};

export const isRedisReady = (): boolean => {
  return redisClient?.status === "ready";
};
