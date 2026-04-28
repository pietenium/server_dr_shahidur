import chalk from "chalk";
// import { validateEnv } from "./src/config/env"; // This runs zod validation on import
import { connectDB } from "./src/config/db";
import { connectRedis } from "./src/config/redis";
import { env } from "./src/config/env";
import { initWhatsApp } from "./src/utils/sendWhatsApp";
import app from "./src/app";

const seedAdmin = async (): Promise<void> => {
  const { User } = await import("./src/modules/auth/auth.model");
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
    console.log(chalk.green("Admin user seeded successfully"));
  } else {
    console.log(chalk.blue("Admin user already exists - skipping seed"));
  }
};

const startServer = async (): Promise<void> => {
  console.log(chalk.cyan("Starting server..."));

  // 1. Validate environment (already done by importing env)
  console.log(chalk.green("✓ Environment validated"));

  // 2. Connect to MongoDB
  await connectDB();
  console.log(chalk.green("✓ MongoDB connected"));

  // 3. Connect to Redis (non-fatal)
  await connectRedis();
  console.log(chalk.green("✓ Redis connection attempted"));

  // 4. Seed admin
  await seedAdmin();
  console.log(chalk.green("✓ Admin seed complete"));

  // 5. Initialize WhatsApp
  initWhatsApp();
  console.log(chalk.green("✓ WhatsApp client initializing"));

  // 6. Start server
  app.listen(env.PORT, () => {
    console.log(chalk.cyan(`\n🚀 Server running on port ${env.PORT}`));
    console.log(chalk.cyan(`Environment: ${env.NODE_ENV}`));
    console.log(chalk.cyan(`Public URL: ${env.CLIENT_PUBLIC_URL}`));
    console.log(chalk.cyan(`Dashboard URL: ${env.CLIENT_DASHBOARD_URL}\n`));
  });
};

startServer().catch((error) => {
  console.error(chalk.red("Failed to start server:"), error);
  process.exit(1);
});
