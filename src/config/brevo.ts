import { env } from "./env";
import { logger } from "@utils/logger";

/**
 * Verify Brevo API key is configured
 */
export const isBrevoConfigured = (): boolean => {
  return (
    Boolean(env.BREVO_API_KEY) && env.BREVO_API_KEY.startsWith("xkeysib-")
  );
};

// Log initialization status
if (isBrevoConfigured()) {
  logger.info("Brevo API configuration verified");
} else {
  logger.warn("Brevo API key not configured - email sending will fail");
}
