import TelegramBot from "node-telegram-bot-api";
import chalk from "chalk";
import { logger } from "./logger";
import dayjs from "dayjs";
import { env } from "@config/env";
import type { IAppointment } from "@modules/appointment/appointment.interface";
import type { IContact } from "@modules/contact/contact.interface";

let bot: TelegramBot;

const getBot = (): TelegramBot => {
  if (!bot) {
    bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return bot;
};

export const sendTelegramMessage = async (
  message: string,
): Promise<{
  success: boolean;
  telegramMessageId?: number;
  error?: string;
}> => {
  try {
    const telegramBot = getBot();
    const result = await telegramBot.sendMessage(
      env.TELEGRAM_CHAT_ID,
      message,
      {
        parse_mode: "HTML",
      },
    );
    return {
      success: true,
      telegramMessageId: result.message_id,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.warn(chalk.yellow(`Telegram send error: ${errorMessage}`));
    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const formatAppointmentMessage = (appointment: IAppointment): string => {
  return (
    `🗓 <b>New Appointment Request</b>\n\n` +
    `👤 <b>Patient:</b> ${appointment.name}\n` +
    `📞 <b>Phone:</b> ${appointment.phone}\n` +
    `📧 <b>Email:</b> ${appointment.email || "Not provided"}\n` +
    `📅 <b>Preferred Date:</b> ${dayjs(appointment.preferredDate).format("MMMM D, YYYY")}\n` +
    `⏰ <b>Preferred Time:</b> ${appointment.preferredTime}\n` +
    `💬 <b>Message:</b> ${appointment.message || "No message"}\n` +
    `📍 <b>Location:</b> ${appointment.location.city}, ${appointment.location.country}\n` +
    `🕐 <b>Submitted:</b> ${dayjs(appointment.createdAt).format("MMMM D, YYYY h:mm A")}\n\n` +
    `<i>Manage via dashboard.</i>`
  );
};

export const formatContactMessage = (contact: IContact): string => {
  return (
    `📩 <b>New Contact Message</b>\n\n` +
    `👤 <b>Name:</b> ${contact.name}\n` +
    `📧 <b>Email:</b> ${contact.email}\n` +
    `📞 <b>Phone:</b> ${contact.phone || "Not provided"}\n` +
    `🏷 <b>Subject:</b> ${contact.subject}\n` +
    `📋 <b>Reason:</b> ${contact.reason}\n` +
    `💬 <b>Message:</b> ${contact.message}\n` +
    `📍 <b>Location:</b> ${contact.location.city}, ${contact.location.country}\n` +
    `🕐 <b>Received:</b> ${dayjs(contact.createdAt).format("MMMM D, YYYY h:mm A")}`
  );
};
