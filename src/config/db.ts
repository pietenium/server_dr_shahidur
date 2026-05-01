import mongoose from "mongoose";
import chalk from "chalk";
import { env } from "./env";
import { logger } from "@utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(chalk.green(`MongoDB connected: ${conn.connection.host}`));
  } catch (error) {
    logger.error(
      chalk.red(`MongoDB connection error: ${(error as Error).message}`),
    );
    process.exit(1);
  }
};
