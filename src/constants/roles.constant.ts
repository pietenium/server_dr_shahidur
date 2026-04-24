export const ROLES = {
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
