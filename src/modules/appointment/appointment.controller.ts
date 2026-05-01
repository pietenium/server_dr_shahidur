import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { appointmentService } from "./appointment.service";
import type { CreateAppointmentPayload } from "./appointment.interface";

export const appointmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await appointmentService.create(req.body as CreateAppointmentPayload);
    new ApiResponse(201, "Appointment created", record).send(res);
  }),
};
