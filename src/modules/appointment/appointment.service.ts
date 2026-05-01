import { Appointment } from "./appointment.model";
import type { IAppointment, CreateAppointmentPayload } from "./appointment.interface";

export const appointmentService = {
  create: async (payload: CreateAppointmentPayload): Promise<IAppointment> => {
    return Appointment.create(payload);
  },
};
