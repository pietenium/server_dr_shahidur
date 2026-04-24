export const APPOINTMENT_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;
export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const CONTENT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;
export type ContentStatus =
  (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];

export const UPLOAD_TYPE = {
  PDF: "PDF",
  DOI: "DOI",
} as const;
export type UploadType = (typeof UPLOAD_TYPE)[keyof typeof UPLOAD_TYPE];

export const ARTICLE_TYPE = {
  MEDICAL: "MEDICAL",
  POLITICAL: "POLITICAL",
} as const;
export type ArticleType = (typeof ARTICLE_TYPE)[keyof typeof ARTICLE_TYPE];
