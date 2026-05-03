import { transporter } from "@config/nodemailer";
import { env } from "@config/env";
import { logger } from "@utils/logger";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}: ${(error as Error).message}`);
    throw error; // Re-throw so callers know it failed
  }
};
