export interface ModeratorInviteData {
  name: string;
  email: string;
  temporaryPassword: string;
  dashboardUrl: string;
}

export const moderatorInviteTemplate = (data: ModeratorInviteData): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1a6b4a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Dr. Sahidur Rahman Khan</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1a6b4a;">Moderator Invitation</h2>
        <p>Hello ${data.name},</p>
        <p>You have been invited to join as a moderator for Dr. Sahidur Rahman Khan's platform.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Your Credentials:</strong></p>
          <p>Email: ${data.email}</p>
          <p>Password: ${data.temporaryPassword}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" style="background-color: #1a6b4a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Access Dashboard
          </a>
        </div>
        <p style="color: #ff6b6b;">Please change your password after logging in for the first time.</p>
      </div>
    </div>
  `;
};
