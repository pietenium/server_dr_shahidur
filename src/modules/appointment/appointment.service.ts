import type mongoose from "mongoose";
import { Appointment } from "./appointment.model";
import type {
  IAppointment,
  CreateAppointmentPayload,
  AppointmentFilterQuery,
  AppointmentChartData,
} from "./appointment.interface";
import { getGeoLocation } from "@utils/getGeoLocation";
import { sendWhatsAppMessage } from "@utils/sendWhatsApp";
import { sendEmail } from "@emails/sendEmail";
import { appointmentConfirmationTemplate } from "@emails/templates/appointment-confirmation.template";
import { env } from "@config/env";
import dayjs from "dayjs";
import { logger } from "@utils/logger";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";
import type { PaginateModel } from "mongoose";

interface AppointmentFilter {
  status?: string;
  preferredDate?: {
    $gte?: Date;
    $lte?: Date;
  };
  $or?: Array<
    | { name: { $regex: string; $options: string } }
    | { phone: { $regex: string; $options: string } }
  >;
}

export const appointmentService = {
  create: async (
    payload: CreateAppointmentPayload,
    ip: string,
  ): Promise<IAppointment> => {
    // 1. Save appointment first
    const appointment = await Appointment.create({
      ...payload,
      ipAddress: ip,
      status: "PENDING",
    });

    // 2. Resolve geolocation, send email, and send WhatsApp async (non-blocking)
    // We use Promise.allSettled to ensure failure in one doesn't affect others
    void (async () => {
      try {
        const geo = await getGeoLocation(ip);
        appointment.location = geo;
        await appointment.save();

        const notificationPromises = [];

        // Patient Email Confirmation
        if (payload.email) {
          notificationPromises.push(
            sendEmail({
              to: payload.email,
              subject: "Appointment Request Received - Dr. Sahidur Rahman Khan",
              html: appointmentConfirmationTemplate({
                name: payload.name,
                preferredDate: dayjs(payload.preferredDate).format(
                  "DD MMMM, YYYY",
                ),
                preferredTime: payload.preferredTime,
              }),
            }),
          );
        }

        //         // WhatsApp to Doctor
        const whatsappMessage = `🗓 *New Appointment Request*

        👤 *Patient:* ${payload.name}
        📞 *Phone:* ${payload.phone}
        📧 *Email:* ${payload.email || "Not provided"}
        📅 *Preferred Date:* ${dayjs(payload.preferredDate).format("DD MMMM, YYYY")}
        ⏰ *Preferred Time:* ${payload.preferredTime}
        💬 *Message:* ${payload.message || "No message"}
        📍 *Location:* ${geo.city}, ${geo.country}
        🕐 *Submitted:* ${dayjs().format("DD/MM/YYYY HH:mm")}

        Manage via dashboard.`;

        notificationPromises.push(
          sendWhatsAppMessage(env.DOCTOR_WHATSAPP_NUMBER, whatsappMessage),
        );

        await Promise.allSettled(notificationPromises);
      } catch (error) {
        logger.error("Appointment background task error:", error);
      }
    })();

    return appointment;
  },

  get: async (
    query: AppointmentFilterQuery,
  ): Promise<mongoose.PaginateResult<IAppointment>> => {
    const { status, startDate, endDate, search, page = 1, limit = 10 } = query;
    const filter: AppointmentFilter = {};

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (startDate || endDate) {
      filter.preferredDate = {};
      if (startDate) {
        filter.preferredDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.preferredDate.$lte = new Date(endDate);
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
    };

    const model = Appointment as unknown as PaginateModel<IAppointment>;
    return model.paginate(filter, options);
  },

  getById: async (id: string): Promise<IAppointment> => {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Appointment not found");
    }
    return appointment;
  },

  updateStatus: async (
    id: string,
    status: "CONFIRMED" | "CANCELLED",
  ): Promise<IAppointment> => {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: status.toUpperCase() },
      { new: true, runValidators: true },
    );

    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Appointment not found");
    }

    return appointment;
  },

  getCharts: async (): Promise<AppointmentChartData> => {
    const thirtyDaysAgo = dayjs().subtract(30, "days").toDate();
    const twelveMonthsAgo = dayjs()
      .subtract(12, "months")
      .startOf("month")
      .toDate();

    const [dailyCounts, monthlyCounts, statusDistribution, totalCount] =
      await Promise.all([
        Appointment.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]) as unknown as Promise<Array<{ _id: string; count: number }>>,
        Appointment.aggregate([
          { $match: { createdAt: { $gte: twelveMonthsAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]) as unknown as Promise<Array<{ _id: string; count: number }>>,
        Appointment.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]) as unknown as Promise<Array<{ _id: string; count: number }>>,
        Appointment.countDocuments(),
      ]);

    return {
      dailyCounts,
      monthlyCounts,
      totalCount,
      statusDistribution,
    };
  },
};
