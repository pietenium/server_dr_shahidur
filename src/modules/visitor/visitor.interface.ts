export interface VisitorCookiePayload {
  visitorId: string;
  sessionId: string;
  acceptCookie: boolean;
  timestamp: number;
}

export interface SetCookieResponse {
  visitorId: string;
  sessionId: string;
  acceptCookie: boolean;
}

export interface GetCookieStatusResponse {
  visitorId: string | null;
  sessionId: string | null;
  acceptCookie: boolean | null;
  isReturningVisitor: boolean;
  hasAcceptedCookies: boolean;
}
