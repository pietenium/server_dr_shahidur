import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import chalk from "chalk";
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
      console.log(
        chalk.blue("WhatsApp QR Code received. Scan with your phone:"),
      );
      qrcode.generate(qr, { small: true });
    });

    client.on("ready", () => {
      isReady = true;
      console.log(chalk.green("WhatsApp client is ready."));
    });

    client.on("disconnected", (reason: string) => {
      isReady = false;
      console.log(chalk.yellow(`WhatsApp disconnected: ${reason}`));
      console.log(
        chalk.yellow("Attempting to re-initialize WhatsApp in 5 seconds..."),
      );
      setTimeout(() => {
        initWhatsApp();
      }, 5000);
    });

    client.on("auth_failure", (message: string) => {
      isReady = false;
      console.log(chalk.red(`WhatsApp authentication failure: ${message}`));
    });

    client.initialize().catch((error: Error) => {
      console.log(
        chalk.yellow(`WhatsApp initialization error: ${error.message}`),
      );
    });
  } catch (error) {
    console.log(
      chalk.yellow(`WhatsApp setup error: ${(error as Error).message}`),
    );
  }
};

export const sendWhatsAppMessage = async (
  phone: string,
  message: string,
): Promise<void> => {
  try {
    if (!client || !isReady) {
      console.log(chalk.yellow("WhatsApp client not ready. Message not sent."));
      return;
    }

    const chatId = `${phone}@c.us`;
    await client.sendMessage(chatId, message);
  } catch (error) {
    console.log(
      chalk.yellow(`WhatsApp send error: ${(error as Error).message}`),
    );
  }
};
