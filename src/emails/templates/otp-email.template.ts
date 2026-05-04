export interface OtpEmailData {
  otp: string;
  name: string;
}

export const otpEmailTemplate = (data: OtpEmailData): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1a6b4a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Dr. Sahidur Rahman Khan</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1a6b4a;">Password Reset OTP</h2>
        <p>Hello ${data.name},</p>
        <p>You requested a password reset. Use the following OTP code to verify your identity:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 4px;">
          <h1 style="color: #1a6b4a; letter-spacing: 5px; margin: 0; font-size: 36px;">${data.otp}</h1>
        </div>
        <p style="color: #666;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
};
