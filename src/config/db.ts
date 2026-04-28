import mongoose from "mongoose";
import chalk from "chalk";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(chalk.green(`MongoDB connected: ${conn.connection.host}`));
  } catch (error) {
    console.error(
      chalk.red(`MongoDB connection error: ${(error as Error).message}`),
    );
    process.exit(1);
  }
};
