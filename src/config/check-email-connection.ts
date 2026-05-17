/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
import { isBrevoConfigured } from "./brevo";
import { logger } from "@utils/logger";
import { env } from "./env";
import chalk from "chalk";

interface EmailConnectionStatus {
  success: boolean;
  message: string;
  details?: {
    apiKeyValid: boolean;
    accountEmail?: string;
    accountName?: string;
  };
}

/**
 * Verify Brevo API connection by calling the account endpoint
 */
export const checkEmailConnection =
  async (): Promise<EmailConnectionStatus> => {
    if (!isBrevoConfigured()) {
      return { success: false, message: "Brevo API key not configured" };
    }

    try {
      const response = await fetch("https://api.brevo.com/v3/account", {
        headers: {
          "api-key": env.BREVO_API_KEY,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as Record<string, unknown>;

      logger.info(
        chalk.green(`✓ Email service ready (${data.email || "connected"})`),
      );

      return {
        success: true,
        message: "Brevo API connection successful",
        details: {
          apiKeyValid: true,
          accountEmail: data.email as string,
          accountName: data.companyName as string,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.warn(chalk.yellow(`Email connection check: ${errorMessage}`));
      return { success: false, message: errorMessage };
    }
  };

/**
 * Non-blocking startup check
 */
export const verifyEmailConfigOnStartup = async (): Promise<void> => {
  const status = await checkEmailConnection();
  if (status.success) {
    logger.info(chalk.green("✓ Email service ready"));
  } else {
    logger.warn(chalk.yellow(`⚠ Email service: ${status.message}`));
  }
};
