export interface MagicLoginData {
  magicLink: string;
  name: string;
}

export const magicLoginTemplate = (data: MagicLoginData): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1a6b4a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Dr. Sahidur Rahman Khan</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1a6b4a;">Magic Login Link</h2>
        <p>Hello ${data.name},</p>
        <p>Click the button below to log in securely without a password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.magicLink}" style="background-color: #1a6b4a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Log In Securely
          </a>
        </div>
        <p style="color: #666;">This magic link is valid for 10 minutes. Do not share it with anyone.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
};
