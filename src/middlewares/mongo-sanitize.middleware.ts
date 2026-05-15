import type { NextFunction, Request, Response } from "express";

const FORBIDDEN_KEYS = ["__proto__", "constructor", "prototype"];

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string" && value.startsWith("$")) {
    return value.replace(/^\$/, "");
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const sanitizedKey = key.startsWith("$") ? key.replace(/^\$/, "") : key;
      if (FORBIDDEN_KEYS.includes(sanitizedKey)) {
        continue;
      }
      sanitized[sanitizedKey] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
};

export const mongoSanitize = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body) {
    req.body = sanitizeValue(req.body) as Record<string, unknown>;
  }
  // Don't try to modify req.query directly - it's read-only in some Express versions
  if (req.query && typeof req.query === "object") {
    const sanitizedQuery = sanitizeValue({ ...req.query }) as Record<
      string,
      unknown
    >;
    // Reassign query params individually
    Object.keys(sanitizedQuery).forEach((key) => {
      (req.query as Record<string, unknown>)[key] = sanitizedQuery[key];
    });
  }
  next();
};
