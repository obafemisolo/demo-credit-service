import type { CreateUserRecord, User } from "../../../@types/users";
import {
  ConflictError,
  NotFoundError,
} from "../../../common/errors/globalErrorHandler";
import userRepository from "../User.repository";
import userService from "../User.service";
import walletRepository from "../../wallets/Wallet.repository";

jest.mock("../../adjutor/Adjutor.service", () => ({
  AdjutorService: {
    isBlacklisted: jest.fn().mockResolvedValue(false),
  },
}));

jest.mock("../User.repository", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByPhoneNumber: jest.fn(),
    updateBlacklistStatus: jest.fn(),
  },
}));

jest.mock("../../wallets/Wallet.repository", () => ({
  __esModule: true,
  default: {
    createForUser: jest.fn(),
  },
}));

const repository = jest.mocked(userRepository);
const wallet = jest.mocked(walletRepository);

function buildUser(overrides: Partial<User> = {}): User {
  const now = new Date("2026-07-09T10:00:00.000Z");

  return {
    id: "11111111-1111-4111-8111-111111111111",
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    phone_number: "08012345678",
    password_hash: "salt:hash",
    is_blacklisted: false,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("creates a user with normalized values and hides the password hash", async () => {
      repository.findByEmail.mockResolvedValue(undefined);
      repository.findByPhoneNumber.mockResolvedValue(undefined);
      repository.create.mockImplementation(async (record: CreateUserRecord) =>
        buildUser({
          id: record.id,
          first_name: record.first_name,
          last_name: record.last_name,
          email: record.email,
          phone_number: record.phone_number,
          password_hash: record.password_hash,
        }),
      );

      const result = await userService.createUser({
        firstName: " Ada ",
        lastName: " Lovelace ",
        email: "ADA@EXAMPLE.COM ",
        phoneNumber: " 08012345678 ",
        password: "secret123",
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: "Ada",
          last_name: "Lovelace",
          email: "ada@example.com",
          phone_number: "08012345678",
          password_hash: expect.not.stringContaining("secret123"),
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          phoneNumber: "08012345678",
          isBlacklisted: false,
        }),
      );
      expect(wallet.createForUser).toHaveBeenCalledWith(result.id);
      expect(result).not.toHaveProperty("password_hash");
      expect(result).not.toHaveProperty("password");
    });

    it("throws a conflict error when email already exists", async () => {
      repository.findByEmail.mockResolvedValue(buildUser());

      await expect(
        userService.createUser({
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          phoneNumber: "08012345678",
          password: "secret123",
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(repository.create).not.toHaveBeenCalled();
    });

    it("throws a conflict error when phone number already exists", async () => {
      repository.findByEmail.mockResolvedValue(undefined);
      repository.findByPhoneNumber.mockResolvedValue(buildUser());

      await expect(
        userService.createUser({
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          phoneNumber: "08012345678",
          password: "secret123",
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  it("returns paginated users", async () => {
    repository.findAll.mockResolvedValue({
      users: [buildUser()],
      total: 3,
    });

    const result = await userService.getUsers(2, 1);

    expect(repository.findAll).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(
      expect.objectContaining({
        total: 3,
        page: 2,
        pageSize: 1,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      }),
    );
    expect(result.data).toHaveLength(1);
  });

  it("returns a user by id", async () => {
    repository.findById.mockResolvedValue(buildUser());

    const result = await userService.getUserById("user-id");

    expect(repository.findById).toHaveBeenCalledWith("user-id");
    expect(result.email).toBe("ada@example.com");
  });

  it("throws not found when a user does not exist", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(userService.getUserById("missing-id")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("updates blacklist status", async () => {
    repository.updateBlacklistStatus.mockResolvedValue(
      buildUser({ is_blacklisted: true }),
    );

    const result = await userService.blacklistUser("user-id");

    expect(repository.updateBlacklistStatus).toHaveBeenCalledWith(
      "user-id",
      true,
    );
    expect(result.isBlacklisted).toBe(true);
  });
});
