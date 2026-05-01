import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { contactService } from "./contact.service";
import type { CreateContactPayload } from "./contact.interface";

export const contactController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await contactService.create(req.body as CreateContactPayload);
    new ApiResponse(201, "Contact message sent", record).send(res);
  }),
};
