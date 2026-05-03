import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import chalk from "chalk";
import { logger } from "./logger";
import { env } from "@config/env";

let client: Client | null = null;
let isReady = false;

export const initWhatsApp = (): void => {
  try {
    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: env.WHATSAPP_SESSION_PATH,
      }),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    client.on("qr", (qr: string) => {
      logger.info(
        chalk.blue("WhatsApp QR Code received. Scan with your phone:"),
      );
      qrcode.generate(qr, { small: true });
    });

    client.on("ready", () => {
      isReady = true;
      logger.info(chalk.green("WhatsApp client is ready."));
    });

    client.on("disconnected", (reason: string) => {
      isReady = false;
      logger.warn(chalk.yellow(`WhatsApp disconnected: ${reason}`));
      logger.warn(
        chalk.yellow("Attempting to re-initialize WhatsApp in 5 seconds..."),
      );
      setTimeout(() => {
        initWhatsApp();
      }, 5000);
    });

    client.on("auth_failure", (message: string) => {
      isReady = false;
      logger.error(chalk.red(`WhatsApp authentication failure: ${message}`));
    });

    client.initialize().catch((error: Error) => {
      logger.warn(
        chalk.yellow(`WhatsApp initialization error: ${error.message}`),
      );
    });
  } catch (error) {
    logger.warn(
      chalk.yellow(`WhatsApp setup error: ${(error as Error).message}`),
    );
  }
};

export const getWhatsAppClient = (): Client | null => client;

export const sendWhatsAppMessage = async (
  phone: string,
  message: string,
): Promise<void> => {
  try {
    if (!client || !isReady) {
      logger.warn(chalk.yellow("WhatsApp client not ready. Message not sent."));
      return;
    }

    const chatId = `${phone}@c.us`;
    await client.sendMessage(chatId, message);
  } catch (error) {
    logger.warn(
      chalk.yellow(`WhatsApp send error: ${(error as Error).message}`),
    );
  }
};
