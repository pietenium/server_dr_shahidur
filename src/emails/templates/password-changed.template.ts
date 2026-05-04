export interface PasswordChangedData {
  name: string;
}

export const passwordChangedTemplate = (data: PasswordChangedData): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1a6b4a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Dr. Sahidur Rahman Khan</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1a6b4a;">Password Changed Successfully</h2>
        <p>Hello ${data.name},</p>
        <p>This is a confirmation that the password for your account has been successfully changed.</p>
        <p>If you did not make this change, please contact the administrator immediately or try to reset your password again.</p>
        <p style="color: #666; margin-top: 30px;">For security reasons, do not share your login credentials with anyone.</p>
      </div>
    </div>
  `;
};
