import slugifyLib from "slugify";
import { v4 as uuidv4 } from "uuid";

export const generateSlug = (text: string, fallbackId?: string): string => {
  const slug = slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });

  if (!slug || slug.length === 0) {
    return fallbackId || uuidv4();
  }

  return slug;
};
