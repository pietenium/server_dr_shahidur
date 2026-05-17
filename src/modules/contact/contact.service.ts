import { sendEmail } from "@emails/sendEmail";
import { contactConfirmationTemplate } from "@emails/templates/contact-confirmation.template";
import { ApiError } from "@utils/ApiError";
import { getGeoLocation } from "@utils/getGeoLocation";
import { logger } from "@utils/logger";
import { formatContactMessage, sendTelegramMessage } from "@utils/sendTelegram";
import { StatusCodes } from "http-status-codes";
import type mongoose from "mongoose";
import type {
  ContactFilterQuery,
  CreateContactPayload,
  IContact,
} from "./contact.interface";
import { Contact } from "./contact.model";
import { notifyNewContactMessage } from "@config/socket";
export const contactService = {
  create: async (
    payload: CreateContactPayload,
    ip: string,
  ): Promise<IContact> => {
    // Save contact first for a fast HTTP response
    const contact = await Contact.create({
      ...payload,
      ipAddress: ip,
    });

    notifyNewContactMessage({
      _id: contact._id.toString(),
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      reason: contact.reason,
      isRead: contact.isRead,
      createdAt: contact.createdAt,
    });

    // Resolve geolocation asynchronously (non-blocking) — same pattern as appointment service
    void (async () => {
      try {
        const location = await getGeoLocation(ip);
        await Contact.findByIdAndUpdate(contact._id, { location });
      } catch (error) {
        logger.warn(
          `Failed to resolve geolocation for contact: ${(error as Error).message}`,
        );
      }
    })();

    // Send Telegram Notification (Async)
    const telegramMsg = formatContactMessage(contact);
    void sendTelegramMessage(telegramMsg)
      .then((res) => {
        if (res.success && res.telegramMessageId) {
          void Contact.findByIdAndUpdate(contact._id, {
            telegramMessageId: res.telegramMessageId,
          });
        }
      })
      .catch((error) => {
        logger.warn(
          `Failed to send Telegram notification: ${(error as Error).message}`,
        );
      });

    // Send Confirmation Email to Sender (Async)
    void sendEmail({
      to: contact.email,
      subject: "Message Received — Dr. Sahidur Rahman Khan",
      html: contactConfirmationTemplate({
        name: contact.name,
        subject: contact.subject,
      }),
    }).catch((error) => {
      logger.warn(
        `Failed to send confirmation email: ${(error as Error).message}`,
      );
    });

    return contact;
  },

  getMessages: async (
    query: ContactFilterQuery,
  ): Promise<mongoose.PaginateResult<IContact>> => {
    const { isRead, reason, page = 1, limit = 20 } = query;

    const filter: Record<string, unknown> = {};
    if (isRead !== undefined) {
      filter.isRead = { $eq: isRead };
    }
    if (reason) {
      filter.reason = { $eq: reason };
    }

    const options = {
      page,
      limit,
      sort: "-createdAt",
    };

    const model = Contact;
    const results = await model.paginate(filter, options);

    return results;
  },

  getMessageById: async (id: string): Promise<IContact> => {
    const contact = await Contact.findOne({ _id: { $eq: id } });
    if (!contact) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
    }
    return contact;
  },

  markAsRead: async (id: string): Promise<IContact> => {
    const contact = await Contact.findOneAndUpdate(
      { _id: { $eq: id } },
      { $set: { isRead: true } },
      { new: true },
    );

    if (!contact) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
    }

    return contact;
  },

  delete: async (id: string): Promise<void> => {
    const contact = await Contact.findOneAndDelete({ _id: { $eq: id } });
    if (!contact) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
    }
  },
};
