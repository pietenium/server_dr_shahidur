import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { contactService } from "./contact.service";
import type { CreateContactPayload, ContactFilterQuery } from "./contact.interface";

export const contactController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as CreateContactPayload;
    const ip = req.ip || "unknown";
    
    const contact = await contactService.create(payload, ip);

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  }),

  getMessages: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ContactFilterQuery;
    const result = await contactService.getMessages(query);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Messages fetched successfully",
      data: result,
    });
  }),

  getMessageById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contact = await contactService.getMessageById(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Message fetched successfully",
      data: contact,
    });
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contact = await contactService.markAsRead(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Message marked as read",
      data: contact,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await contactService.delete(id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Message deleted successfully",
      data: null,
    });
  }),
};
