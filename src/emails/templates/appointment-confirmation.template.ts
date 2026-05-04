export interface AppointmentConfirmationData {
  name: string;
  preferredDate: string;
  preferredTime: string;
}

export const appointmentConfirmationTemplate = (
  data: AppointmentConfirmationData,
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1a6b4a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Dr. Sahidur Rahman Khan</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1a6b4a;">Appointment Request Received</h2>
        <p>Dear ${data.name},</p>
        <p>Thank you for requesting an appointment. Your request has been received with the following details:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
          <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
        </div>
        <p>We will review your request and get back to you shortly to confirm the appointment.</p>
        <p style="color: #666;">If you have any questions, please contact us.</p>
      </div>
    </div>
  `;
};
