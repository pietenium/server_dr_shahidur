import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { appointmentService } from "./appointment.service";
import type { CreateAppointmentPayload } from "./appointment.interface";

export const appointmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await appointmentService.create(req.body as CreateAppointmentPayload);
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Appointment created",
      data: record,
    });
  }),
};
