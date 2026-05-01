import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { contactService } from "./contact.service";
import type { CreateContactPayload } from "./contact.interface";

export const contactController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await contactService.create(req.body as CreateContactPayload);
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Contact message sent",
      data: record,
    });
  }),
};
