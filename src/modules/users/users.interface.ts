import type { Role } from "@constants/roles.constant";

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface InviteModeratorPayload {
  name: string;
  email: string;
}

export interface UserFilterQuery {
  role?: Role;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
