import { env } from "@config/env";
import { sendEmail } from "@emails/sendEmail";
import { appointmentConfirmationTemplate } from "@emails/templates/appointment-confirmation.template";
import { ApiError } from "@utils/ApiError";
import { getGeoLocation } from "@utils/getGeoLocation";
import { logger } from "@utils/logger";
import { sendWhatsAppMessage } from "@utils/sendWhatsApp";
import dayjs from "dayjs";
import { StatusCodes } from "http-status-codes";
import type mongoose from "mongoose";
import { type PaginateModel, Types } from "mongoose";
import type {
  AppointmentChartData,
  AppointmentFilterQuery,
  CreateAppointmentPayload,
  IAppointment,
  BulkDeletePayload,
} from "./appointment.interface";
import { Appointment } from "./appointment.model";
import { notifyNewAppointment } from "@config/socket";

interface AppointmentFilter {
  status?: string;
  chemberId?: string;
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
    const appointment = await Appointment.create({
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      message: payload.message,
      chemberId: new Types.ObjectId(payload.chemberId),
      preferredDate: new Date(payload.preferredDate),
      preferredTime: payload.preferredTime,
      ipAddress: ip,
      status: "PENDING",
    });

    // Background tasks (non-blocking)
    void (async () => {
      try {
        const geo = await getGeoLocation(ip);
        appointment.location = geo;
        await appointment.save();

        // Socket notification
        notifyNewAppointment({
          _id: appointment._id.toString(),
          name: appointment.name,
          phone: appointment.phone,
          email: appointment.email,
          preferredDate: appointment.preferredDate,
          preferredTime: appointment.preferredTime,
          message: appointment.message,
          status: appointment.status,
          createdAt: appointment.createdAt,
        });

        const notificationPromises: Promise<unknown>[] = [];

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

        const whatsappMessage = `🗓 *New Appointment Request*\n\n👤 *Patient:* ${payload.name}\n📞 *Phone:* ${payload.phone}\n📧 *Email:* ${payload.email || "Not provided"}\n📅 *Preferred Date:* ${dayjs(payload.preferredDate).format("DD MMMM, YYYY")}\n⏰ *Preferred Time:* ${payload.preferredTime}\n💬 *Message:* ${payload.message || "No message"}\n📍 *Location:* ${geo.city}, ${geo.country}\n🕐 *Submitted:* ${dayjs().format("DD/MM/YYYY HH:mm")}\n\nManage via dashboard.`;

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
    const {
      status,
      chemberId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
    } = query;
    const filter: AppointmentFilter = {};

    if (status) {
      filter.status = status.toUpperCase();
    }
    if (chemberId) {
      filter.chemberId = chemberId;
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
      sort: { createdAt: -1 } as const,
      populate: "chemberId",
    };

    const model = Appointment as unknown as PaginateModel<IAppointment>;
    return model.paginate(filter, options);
  },

  getById: async (id: string): Promise<IAppointment> => {
    const appointment = await Appointment.findById(id).populate("chemberId");
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

  deleteById: async (id: string): Promise<void> => {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Appointment not found");
    }
    await appointment.deleteOne();
  },

  bulkDelete: async (
    payload: BulkDeletePayload,
  ): Promise<{ deletedCount: number }> => {
    const filter: Record<string, unknown> = {};

    if (payload.ids && payload.ids.length > 0) {
      filter._id = { $in: payload.ids };
    }

    if (payload.status) {
      filter.status = payload.status.toUpperCase();
    }

    if (Object.keys(filter).length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "No filter criteria provided",
      );
    }

    const result = await Appointment.deleteMany(filter);
    return { deletedCount: result.deletedCount || 0 };
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
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]) as unknown as Promise<Array<{ _id: string; count: number }>>,
        Appointment.countDocuments(),
      ]);

    return { dailyCounts, monthlyCounts, totalCount, statusDistribution };
  },
};
