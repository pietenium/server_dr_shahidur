import { connectDB } from "@config/db";
import { env } from "@config/env";
import { connectRedis, getRedisClient } from "@config/redis";
import { logger } from "@utils/logger";
import { getWhatsAppClient, initWhatsApp } from "@utils/sendWhatsApp";
import chalk from "chalk";
import mongoose from "mongoose";
import app from "./app";

const seedAdmin = async (): Promise<void> => {
  const { User } = await import("@modules/auth/auth.model");

  const existingAdmin = await User.findOne({ email: env.ADMIN_SEED_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: "Dr. Sahidur Rahman Khan",
      email: env.ADMIN_SEED_EMAIL,
      password: env.ADMIN_SEED_PASSWORD,
      role: "ADMIN",
      isActive: true,
    });
    logger.info(chalk.green("Admin user seeded successfully"));
  } else {
    logger.info(chalk.blue("Admin user already exists - skipping seed"));
  }
};

const startServer = async (): Promise<void> => {
  logger.info(chalk.cyan("Starting server..."));

  // 1. Validate environment (already done by importing env)
  logger.info(chalk.green("✓ Environment validated"));

  // 2. Connect to MongoDB
  await connectDB();
  logger.info(chalk.green("✓ MongoDB connected"));

  // 3. Connect to Redis (non-fatal)
  try {
    await connectRedis();
    logger.info(chalk.green("✓ Redis connected"));
  } catch (_error) {
    logger.warn(chalk.yellow("Redis unavailable. Continuing without cache."));
  }

  // 4. Seed admin
  await seedAdmin();

  // 5. Initialize WhatsApp
  initWhatsApp();
  logger.info(chalk.green("✓ WhatsApp client initializing"));

  // 6. Start server
  const server = app.listen(env.PORT, () => {
    logger.info(chalk.cyan(`\n🚀 Server running on port ${env.PORT}`));
    logger.info(chalk.cyan(`Environment: ${env.NODE_ENV}`));
    logger.info(chalk.cyan(`Public URL: ${env.CLIENT_PUBLIC_URL}`));
    logger.info(chalk.cyan(`Dashboard URL: ${env.CLIENT_DASHBOARD_URL}\n`));
  });

  // 7. Graceful Shutdown
  const gracefulShutdown = (signal: string) => {
    logger.info(
      chalk.yellow(`\n${signal} received. Starting graceful shutdown...`),
    );

    server.close(() => {
      void (async () => {
        logger.info(chalk.blue("HTTP server closed."));

        try {
          // Close MongoDB
          await mongoose.connection.close();
          logger.info(chalk.blue("MongoDB connection closed."));

          // Close Redis
          const redis = getRedisClient();
          await redis.quit();
          logger.info(chalk.blue("Redis connection closed."));

          // Close WhatsApp client if it exists
          const waClient = getWhatsAppClient();
          if (waClient) {
            await waClient.destroy();
            logger.info(chalk.blue("WhatsApp client destroyed."));
          }

          logger.info(chalk.green("Graceful shutdown complete. Exiting."));
          process.exit(0);
        } catch (err) {
          logger.error(chalk.red("Error during graceful shutdown:"), err);
          process.exit(1);
        }
      })();
    });

    // Force close if it takes too long
    setTimeout(() => {
      logger.error(
        chalk.red(
          "Could not close connections in time, forcefully shutting down",
        ),
      );
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

startServer().catch((error) => {
  logger.error(chalk.red("Failed to start server:"), error);
  process.exit(1);
});
