import { Contact } from "./contact.model";
import type {
  IContact,
  CreateContactPayload,
  ContactFilterQuery,
} from "./contact.interface";
import { deleteCache } from "@utils/cache";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { getGeoLocation } from "@utils/getGeoLocation";
import { sendTelegramMessage, formatContactMessage } from "@utils/sendTelegram";


const CACHE_KEY = "cache:contacts";

export const contactService = {
  create: async (payload: CreateContactPayload, ip: string): Promise<IContact> => {
    const location = await getGeoLocation(ip);
    
    const contact = await Contact.create({
      ...payload,
      ipAddress: ip,
      location,
    });

    // Send Telegram Notification (Async)
    const telegramMsg = formatContactMessage(contact);
    void sendTelegramMessage(telegramMsg).then((res) => {
      if (res.success && res.telegramMessageId) {
        void Contact.findByIdAndUpdate(contact._id, {
          telegramMessageId: res.telegramMessageId,
        });
      }
    });

    // Invalidate cache
    void deleteCache(CACHE_KEY);

    return contact;
  },

  getMessages: async (query: ContactFilterQuery): Promise<unknown> => {
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
      { new: true }
    );

    if (!contact) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
    }

    // Invalidate cache
    void deleteCache(CACHE_KEY);

    return contact;
  },

  delete: async (id: string): Promise<void> => {
    const contact = await Contact.findOneAndDelete({ _id: { $eq: id } });
    if (!contact) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
    }

    // Invalidate cache
    void deleteCache(CACHE_KEY);
  },
};
