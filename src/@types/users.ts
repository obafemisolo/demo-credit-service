export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isBlacklisted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password_hash: string;
  is_blacklisted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password_hash: string;
}
