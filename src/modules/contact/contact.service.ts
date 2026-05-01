import { Contact } from "./contact.model";
import type { IContact, CreateContactPayload } from "./contact.interface";

export const contactService = {
  create: async (payload: CreateContactPayload): Promise<IContact> => {
    return Contact.create(payload);
  },
};
