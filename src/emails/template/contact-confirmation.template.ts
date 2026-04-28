export interface ContactConfirmationData {
  name: string;
  subject: string;
}

export const contactConfirmationTemplate = (
  data: ContactConfirmationData,
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1a6b4a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Dr. Sahidur Rahman Khan</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1a6b4a;">Message Received</h2>
        <p>Dear ${data.name},</p>
        <p>Thank you for reaching out. We have received your message regarding:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>${data.subject}</strong></p>
        </div>
        <p>We typically respond within 24-48 hours. If your matter is urgent, please call our office.</p>
        <p style="color: #666;">Thank you for your patience.</p>
      </div>
    </div>
  `;
};
