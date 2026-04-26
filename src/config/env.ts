import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535).default(5000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGO_URI: z.string().url().default("mongodb://localhost:27017/dr_sahidur"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(10)
    .default("default-access-secret-key-min-32-characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(10)
    .default("default-refresh-secret-key-min-32-characters"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  CLIENT_PUBLIC_URL: z.string().url().default("http://localhost:3000"),
  CLIENT_DASHBOARD_URL: z.string().url().default("http://localhost:5173"),
  SMTP_HOST: z.string().default("smtp.mailtrap.io"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default("default"),
  SMTP_PASS: z.string().default("default"),
  SMTP_FROM_NAME: z.string().default("Dr. Md. Sahidur Rahman Khan"),
  SMTP_FROM_EMAIL: z.string().email().default("info@drsahidur.com"),
  RECAPTCHA_V3_SECRET: z.string().default("default"),
  TWILIO_ACCOUNT_SID: z.string().default("default"),
  TWILIO_AUTH_TOKEN: z.string().default("default"),
  TWILIO_PHONE_NUMBER: z.string().default("+1234567890"),
  DOCTOR_PHONE_NUMBER: z.string().default("+8801712345678"),
  ADMIN_SEED_EMAIL: z.string().email().default("admin@drsahidur.com"),
  ADMIN_SEED_PASSWORD: z.string().min(8).default("Admin@123456"),
  TELEGRAM_BOT_TOKEN: z.string().default("default"),
  TELEGRAM_CHAT_ID: z.string().default("default"),
});

export type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;
try {
  config = envSchema.parse(process.env);
  console.log("✅ Environment variables validated");
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:");
    error.issues.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export default config;
