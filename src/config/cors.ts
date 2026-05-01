import type cors from "cors";
import chalk from "chalk";
import { env } from "./env";
import { logger } from "@utils/logger";

const allowedOrigins = [env.CLIENT_PUBLIC_URL, env.CLIENT_DASHBOARD_URL];

export const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(chalk.yellow(`CORS blocked origin: ${origin}`));
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
