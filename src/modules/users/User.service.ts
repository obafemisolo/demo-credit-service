import crypto from "crypto";

import type { CreateUserRequest, UserResponse } from "../../@types/users";

import {
  createPaginatedResponse,
  type PaginatedResponse,
} from "../../utils/createPaginatedResponse";
import userRepository from "./User.repository";
import { toUserResponse } from "./User.model";
import {
  ConflictError,
  NotFoundError,
} from "../../common/errors/globalErrorHandler";
import { AdjutorService } from "../adjutor/Adjutor.service";
import { AppError } from "../../common/errors/AppError";

export class UserService {
  async createUser(dto: CreateUserRequest): Promise<UserResponse> {
    const email = dto.email.trim().toLowerCase();
    const phoneNumber = dto.phoneNumber.trim();

    const isBlacklisted = await this.isBlackListed(dto);

    if (isBlacklisted) {
      throw new AppError(403, "User cannot be onboarded");
    }

    const existingEmail = await userRepository.findByEmail(email);

    if (existingEmail) {
      throw new ConflictError("Email already exists");
    }

    const existingPhoneNumber =
      await userRepository.findByPhoneNumber(phoneNumber);
    if (existingPhoneNumber) {
      throw new ConflictError("Phone number already exists");
    }

    const user = await userRepository.create({
      id: crypto.randomUUID(),
      first_name: dto.firstName.trim(),
      last_name: dto.lastName.trim(),
      email,
      phone_number: phoneNumber,
      password_hash: this.hashPassword(dto.password),
    });

    return toUserResponse(user);
  }

  async getUsers(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<UserResponse>> {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;
    const skip = (safePage - 1) * safeLimit;

    const { users, total } = await userRepository.findAll(skip, safeLimit);

    return createPaginatedResponse(
      users.map(toUserResponse),
      total,
      skip,
      safeLimit,
    );
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return toUserResponse(user);
  }

  async blacklistUser(id: string): Promise<UserResponse> {
    return this.updateBlacklistStatus(id, true);
  }

  async unblacklistUser(id: string): Promise<UserResponse> {
    return this.updateBlacklistStatus(id, false);
  }

  private async updateBlacklistStatus(
    id: string,
    isBlacklisted: boolean,
  ): Promise<UserResponse> {
    const user = await userRepository.updateBlacklistStatus(id, isBlacklisted);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return toUserResponse(user);
  }

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");

    return `${salt}:${hash}`;
  }

  private async isBlackListed(dto: CreateUserRequest) {
    return await AdjutorService.isBlacklisted(dto.email, dto.phoneNumber);
  }
}

export default new UserService();
