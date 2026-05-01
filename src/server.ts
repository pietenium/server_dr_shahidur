import chalk from "chalk";
import { logger } from "@utils/logger";
import { connectDB } from "@config/db";
import { connectRedis } from "@config/redis";
import { env } from "@config/env";
import { initWhatsApp } from "@utils/sendWhatsApp";
import app from "./app";

const seedAdmin = async (): Promise<void> => {
  const { User } = await import("@modules/auth/auth.model");
  const bcrypt = await import("bcrypt");

  const existingAdmin = await User.findOne({ email: env.ADMIN_SEED_EMAIL });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(env.ADMIN_SEED_PASSWORD, 12);

    await User.create({
      name: "Dr. Sahidur Rahman Khan",
      email: env.ADMIN_SEED_EMAIL,
      password: hashedPassword,
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
  await connectRedis();
  logger.info(chalk.green("✓ Redis connection attempted"));

  // 4. Seed admin
  await seedAdmin();
  logger.info(chalk.green("✓ Admin seed complete"));

  // 5. Initialize WhatsApp
  initWhatsApp();
  logger.info(chalk.green("✓ WhatsApp client initializing"));

  // 6. Start server
  app.listen(env.PORT, () => {
    logger.info(chalk.cyan(`\n🚀 Server running on port ${env.PORT}`));
    logger.info(chalk.cyan(`Environment: ${env.NODE_ENV}`));
    logger.info(chalk.cyan(`Public URL: ${env.CLIENT_PUBLIC_URL}`));
    logger.info(chalk.cyan(`Dashboard URL: ${env.CLIENT_DASHBOARD_URL}\n`));
  });
};

startServer().catch((error) => {
  logger.error(chalk.red("Failed to start server:"), error);
  process.exit(1);
});
