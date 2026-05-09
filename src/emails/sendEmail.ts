import { transporter } from "@config/nodemailer";
import { env } from "@config/env";
import { logger } from "@utils/logger";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sanitizeForLog = (value: string): string =>
  value.replace(/[\r\n]+/g, " ");

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    const safeTo = sanitizeForLog(options.to);
    const safeErrorMessage = sanitizeForLog((error as Error).message);
    logger.error(`Failed to send email to ${safeTo}: ${safeErrorMessage}`);
    throw error; // Re-throw so callers know it failed
  }
};
