import type { User, UserResponse } from "../../@types/users";

export const USERS_TABLE = "users";

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phoneNumber: user.phone_number,
    isBlacklisted: Boolean(user.is_blacklisted),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}
