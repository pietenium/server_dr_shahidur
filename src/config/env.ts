import { logger } from "../utils/logger";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGO_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  CLIENT_PUBLIC_URL: z.string().url(),
  CLIENT_DASHBOARD_URL: z.string().url(),
  IMAGEKIT_PUBLIC_KEY: z.string(),
  IMAGEKIT_PRIVATE_KEY: z.string(),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string(),
  SMTP_FROM_NAME: z.string(),
  SMTP_FROM_EMAIL: z.string().email(),
  RECAPTCHA_V3_SECRET: z.string(),
  DOCTOR_WHATSAPP_NUMBER: z.string(),
  WHATSAPP_SESSION_PATH: z.string().default("./whatsapp-session"),
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_CHAT_ID: z.string(),
  ADMIN_SEED_EMAIL: z.string().email(),
  ADMIN_SEED_PASSWORD: z.string().min(8),
  TEMP_PASS: z.string().min(8),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error("❌ Invalid environment variables:");
  logger.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
export type EnvConfig = z.infer<typeof envSchema>;
