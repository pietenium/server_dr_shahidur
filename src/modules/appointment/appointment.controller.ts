import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { appointmentService } from "./appointment.service";
import type { CreateAppointmentPayload } from "./appointment.interface";
import {
  APPOINTMENT_MESSAGES,
  AUTH_MESSAGES,
} from "@constants/messages.constant";

export const appointmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || "Unknown";
    const record = await appointmentService.create(
      req.body as CreateAppointmentPayload,
      ip,
    );
    // appointmentConfirmationTemplate
    ApiResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: APPOINTMENT_MESSAGES.CREATED,
      data: record,
    });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const data = await appointmentService.get(req.query);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: APPOINTMENT_MESSAGES.FETCHED,
      data,
    });
  }),

  getCharts: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const data = await appointmentService.getCharts();

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: APPOINTMENT_MESSAGES.CHARTS_FETCHED,
      data,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const data = await appointmentService.getById(req.params.id as string);

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: APPOINTMENT_MESSAGES.FETCHED,
      data,
    });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { status } = req.body as { status: "CONFIRMED" | "CANCELLED" };
    const data = await appointmentService.updateStatus(
      req.params.id as string,
      status,
    );

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: APPOINTMENT_MESSAGES.STATUS_UPDATED,
      data,
    });
  }),
};
