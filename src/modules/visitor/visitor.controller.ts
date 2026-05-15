/* eslint-disable @typescript-eslint/require-await */
import { ApiResponse } from "@utils/ApiResponse";
import { asyncHandler } from "@utils/asyncHandler";
import type { Request, Response } from "express";
import { visitorService } from "./visitor.service";

export const visitorController = {
  // GET - Check if visitor has cookies set
  getCookieStatus: asyncHandler(async (req: Request, res: Response) => {
    const status = visitorService.getCookieStatus(req);

    ApiResponse(res, {
      statusCode: 200,
      success: true,
      message: "Cookie status retrieved",
      data: status,
    });
  }),

  // POST - Accept cookies and set visitor/session IDs
  acceptCookies: asyncHandler(async (req: Request, res: Response) => {
    const result = visitorService.setVisitorCookies(req, res);

    ApiResponse(res, {
      statusCode: 200,
      success: true,
      message: "Cookies accepted and visitor IDs set",
      data: result,
    });
  }),

  // POST - Decline cookies (only sets acceptCookie=false)
  declineCookies: asyncHandler(async (req: Request, res: Response) => {
    visitorService.declineCookies(req, res);

    ApiResponse(res, {
      statusCode: 200,
      success: true,
      message: "Cookies declined",
      data: {
        acceptCookie: false,
      },
    });
  }),
};
