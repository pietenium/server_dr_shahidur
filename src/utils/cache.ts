import { getRedisClient, isRedisReady } from "@config/redis";
import chalk from "chalk";
import { logger } from "./logger";

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    if (!isRedisReady()) {
      return null;
    }
    const redisClient = getRedisClient();
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    logger.warn(
      chalk.yellow(
        `Cache get error for key ${key}: ${(error as Error).message}`,
      ),
    );
    return null;
  }
};

export const setCache = async <T>(
  key: string,
  data: T,
  ttlSeconds: number,
): Promise<void> => {
  try {
    if (!isRedisReady()) {
      return;
    }
    const redisClient = getRedisClient();
    await redisClient.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch (error) {
    logger.warn(
      chalk.yellow(
        `Cache set error for key ${key}: ${(error as Error).message}`,
      ),
    );
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    if (!isRedisReady()) {
      return;
    }
    const redisClient = getRedisClient();
    await redisClient.del(key);
  } catch (error) {
    logger.warn(
      chalk.yellow(
        `Cache delete error for key ${key}: ${(error as Error).message}`,
      ),
    );
  }
};

// KEYS is acceptable here because cache invalidation is low-frequency (triggered by admin writes, not user reads).
// In a high-write production environment, replace with SCAN for non-blocking iteration.
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    if (!isRedisReady()) {
      return;
    }
    const redisClient = getRedisClient();
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      const pipeline = redisClient.pipeline();
      keys.forEach((key: string) => {
        pipeline.del(key);
      });
      await pipeline.exec();
    }
  } catch (error) {
    logger.warn(
      chalk.yellow(
        `Cache pattern delete error for ${pattern}: ${(error as Error).message}`,
      ),
    );
  }
};
