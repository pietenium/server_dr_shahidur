import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { contactService } from "./contact.service";
import type {
  CreateContactPayload,
  ContactFilterQuery,
} from "./contact.interface";
import { CONTACT_MESSAGES, AUTH_MESSAGES } from "@constants/messages.constant";

export const contactController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as CreateContactPayload;
    const ip = req.ip || "unknown";

    const contact = await contactService.create(payload, ip);

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: CONTACT_MESSAGES.SUBMITTED,
      data: contact,
    });
  }),

  getMessages: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const query = req.query as unknown as ContactFilterQuery;
    const result = await contactService.getMessages(query);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: CONTACT_MESSAGES.FETCHED,
      data: result,
    });
  }),

  getMessageById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { id } = req.params;
    const contact = await contactService.getMessageById(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: CONTACT_MESSAGES.FETCHED,
      data: contact,
    });
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { id } = req.params;
    const contact = await contactService.markAsRead(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: CONTACT_MESSAGES.MARKED_READ,
      data: contact,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { id } = req.params;
    await contactService.delete(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: CONTACT_MESSAGES.DELETED,
      data: null,
    });
  }),
};
