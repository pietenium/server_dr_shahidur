import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { appointmentService } from "./appointment.service";
import type { CreateAppointmentPayload } from "./appointment.interface";

export const appointmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || "Unknown";
    const record = await appointmentService.create(req.body as CreateAppointmentPayload, ip);

    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Appointment request submitted successfully",
      data: record,
    });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await appointmentService.get(req.query);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Appointments retrieved successfully",
      data,
    });
  }),

  getCharts: asyncHandler(async (_req: Request, res: Response) => {
    const data = await appointmentService.getCharts();

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Appointment charts retrieved successfully",
      data,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const data = await appointmentService.getById(req.params.id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Appointment retrieved successfully",
      data,
    });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body as { status: "CONFIRMED" | "CANCELLED" };
    const data = await appointmentService.updateStatus(req.params.id as string, status);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: `Appointment status updated to ${status.toLowerCase()}`,
      data,
    });
  }),
};
