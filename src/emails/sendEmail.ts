import { isBrevoConfigured } from "@config/brevo";
import { env } from "@config/env";
import { logger } from "@utils/logger";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  toName?: string;
  text?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Send transactional email using Brevo REST API (HTTPS)
 * Uses direct fetch - no SDK dependency needed
 */
export const sendEmail = async (
  options: SendEmailOptions,
): Promise<SendEmailResponse> => {
  if (!isBrevoConfigured()) {
    return { success: false, error: "Brevo API key not configured" };
  }

  if (!options.to || !options.subject || !options.html) {
    return {
      success: false,
      error: "Missing required fields: to, subject, html",
    };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: env.SMTP_FROM_NAME,
          email: env.SMTP_FROM_EMAIL,
        },
        to: [
          {
            email: options.to,
            name: options.toName || options.to.split("@")[0],
          },
        ],
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text || stripHtml(options.html),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Brevo API error ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    const messageId = data.messageId as string;

    logger.info(`Email sent to ${options.to} (ID: ${messageId})`);

    return { success: true, messageId };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Email send failed: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};
