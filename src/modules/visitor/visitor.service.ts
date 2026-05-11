import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type {
  VisitorCookiePayload,
  SetCookieResponse,
  GetCookieStatusResponse,
} from "./visitor.interface";

// Cookie names (constants)
const COOKIE_NAME = "visitor_data";
const COOKIE_SEPARATOR = "|";

export const visitorService = {
  // Parse cookie from request
  parseCookie(req: Request): VisitorCookiePayload | null {
    try {
      const rawCookie = req.cookies?.[COOKIE_NAME] as string;

      if (!rawCookie) {
        return null;
      }

      // Format: visitorId|sessionId|acceptCookie|timestamp
      const parts = rawCookie.split(COOKIE_SEPARATOR);

      if (parts.length !== 4) {
        return null;
      }

      return {
        visitorId: parts[0],
        sessionId: parts[1],
        acceptCookie: parts[2] === "true",
        timestamp: parseInt(parts[3], 10),
      };
    } catch {
      return null;
    }
  },

  // Serialize cookie data to string
  serializeCookie(data: VisitorCookiePayload): string {
    return [
      data.visitorId,
      data.sessionId,
      data.acceptCookie.toString(),
      data.timestamp.toString(),
    ].join(COOKIE_SEPARATOR);
  },

  // Set visitor cookies on response
  setCookieOnResponse(res: Response, data: VisitorCookiePayload): void {
    const cookieValue = this.serializeCookie(data);

    res.cookie(COOKIE_NAME, cookieValue, {
      httpOnly: false, // Allow JavaScript access (frontend needs it)
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // No maxAge/expires = session cookie (deleted when browser closes)
    });
  },

  // GET - Check current cookie status
  getCookieStatus(req: Request): GetCookieStatusResponse {
    const cookieData = this.parseCookie(req);

    return {
      visitorId: cookieData?.visitorId || null,
      sessionId: cookieData?.sessionId || null,
      acceptCookie: cookieData?.acceptCookie ?? null,
      isReturningVisitor: !!cookieData?.visitorId,
      hasAcceptedCookies:
        cookieData?.acceptCookie === true || cookieData?.acceptCookie === false,
    };
  },

  // POST - Accept cookies and generate visitor/session IDs
  setVisitorCookies(req: Request, res: Response): SetCookieResponse {
    // Check if visitor already has IDs
    const existingCookie = this.parseCookie(req);

    const visitorId = existingCookie?.visitorId || uuidv4();
    const sessionId = uuidv4(); // Always generate new session ID
    const acceptCookie = true;

    const cookieData: VisitorCookiePayload = {
      visitorId,
      sessionId,
      acceptCookie,
      timestamp: Date.now(),
    };

    this.setCookieOnResponse(res, cookieData);

    return {
      visitorId,
      sessionId,
      acceptCookie,
    };
  },

  // POST - Decline cookies
  declineCookies(req: Request, res: Response): void {
    const cookieData: VisitorCookiePayload = {
      visitorId: "", // No tracking IDs set
      sessionId: "",
      acceptCookie: false,
      timestamp: Date.now(),
    };

    this.setCookieOnResponse(res, cookieData);
  },

  // Helper: Get visitor ID from request (for other modules)
  getVisitorId(req: Request): string | null {
    const cookieData = this.parseCookie(req);
    return cookieData?.visitorId || null;
  },

  // Helper: Get session ID from request (for other modules)
  getSessionId(req: Request): string | null {
    const cookieData = this.parseCookie(req);
    return cookieData?.sessionId || null;
  },

  // Helper: Check if visitor accepted cookies
  hasAcceptedCookies(req: Request): boolean {
    const cookieData = this.parseCookie(req);
    return cookieData?.acceptCookie === true;
  },
};
