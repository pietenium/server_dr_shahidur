export const AUTH_MESSAGES: Record<string, string> = {
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_INACTIVE: "Account is deactivated",
  OTP_SENT: "OTP sent to email",
  OTP_VERIFIED: "OTP verified successfully",
  INVALID_OTP: "Invalid or expired OTP",
  MAGIC_LOGIN_SUCCESS: "Magic login successful",
  PASSWORD_RESET_SUCCESS: "Password reset successful",
  TOKEN_REFRESHED: "Token refreshed successfully",
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "Access denied",
  SESSION_INVALIDATED: "Session has been invalidated. Please log in again.",
};

export const ARTICLE_MESSAGES: Record<string, string> = {
  CREATED: "Article created successfully",
  UPDATED: "Article updated successfully",
  DELETED: "Article deleted successfully",
  NOT_FOUND: "Article not found",
  CATEGORY_CREATED: "Category created successfully",
  CATEGORY_UPDATED: "Category updated successfully",
  CATEGORY_DELETED: "Category deleted successfully",
  CATEGORY_NOT_FOUND: "Category not found",
  CATEGORY_IN_USE: "Cannot delete category that has articles",
  SLUG_EXISTS: "Article with this title already exists",
};

export const RESEARCH_MESSAGES: Record<string, string> = {
  CREATED: "Research paper created successfully",
  UPDATED: "Research paper updated successfully",
  DELETED: "Research paper deleted successfully",
  NOT_FOUND: "Research paper not found",
  INVALID_DOI: "Invalid DOI format",
};

export const APPOINTMENT_MESSAGES: Record<string, string> = {
  CREATED: "Appointment request submitted successfully",
  STATUS_UPDATED: "Appointment status updated",
  NOT_FOUND: "Appointment not found",
};

export const TESTIMONIAL_MESSAGES: Record<string, string> = {
  CREATED: "Testimonial created successfully",
  UPDATED: "Testimonial updated successfully",
  DELETED: "Testimonial deleted successfully",
  NOT_FOUND: "Testimonial not found",
};

export const CONTACT_MESSAGES: Record<string, string> = {
  SUBMITTED: "Message sent successfully",
  MARKED_READ: "Message marked as read",
  DELETED: "Message deleted successfully",
  NOT_FOUND: "Message not found",
};

export const LOG_MESSAGES: Record<string, string> = {
  DELETED: "Logs deleted successfully",
  NOT_FOUND: "Log not found",
};

export const SEARCH_MESSAGES: Record<string, string> = {
  SUCCESS: "Search completed",
  QUERY_TOO_SHORT: "Search query must be at least 2 characters",
};

export const APP_INFO_MESSAGES: Record<string, string> = {
  UPDATED: "App info updated successfully",
  FETCHED: "App info fetched successfully",
};

export const USER_MESSAGES: Record<string, string> = {
  PASSWORD_CHANGED: "Password changed successfully",
  USER_NOT_FOUND: "User not found",
  CANNOT_DELETE_SELF: "Cannot delete your own account",
  CANNOT_DELETE_LAST_ADMIN: "Cannot delete the last admin user",
  MODERATOR_INVITED: "Moderator invited successfully",
};
