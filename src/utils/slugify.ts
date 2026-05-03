import slugifyLib from "slugify";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a URL-friendly slug from a string.
 * Handles Bangla text by attempting transliteration and falling back to a UUID if needed.
 */
export const generateSlug = (text: string, fallbackId?: string): string => {
  // Try to slugify with Bangla locale support
  let slug = slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
    locale: "bn", // Specific support for Bangla
  });

  // If slugify stripped everything (e.g., all non-transliteratable characters)
  if (!slug || slug.length === 0) {
    // If we have a fallbackId (like an ID), use it, otherwise generate a UUID
    return fallbackId || uuidv4().split("-")[0];
  }

  // Ensure slug is not too long
  if (slug.length > 100) {
    slug = slug.substring(0, 100);
  }

  return slug;
};
