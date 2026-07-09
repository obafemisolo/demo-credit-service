import type { Request, Response } from "express";

jest.mock("../../../config/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
  },
  morganStream: {
    write: jest.fn(),
  },
}));

jest.mock("../User.service", () => ({
  __esModule: true,
  default: {
    createUser: jest.fn(),
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    blacklistUser: jest.fn(),
    unblacklistUser: jest.fn(),
  },
}));

import userController from "../User.controller";
import userService from "../User.service";

const service = jest.mocked(userService);

function mockResponse(): Response {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
}

describe("UserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user and returns a created response", async () => {
    const user = { id: "user-id", email: "ada@example.com" };
    const req = { body: { email: "ada@example.com" } } as Request;
    const res = mockResponse();
    const next = jest.fn();

    service.createUser.mockResolvedValue(user as never);

    await userController.createUser(req, res, next);

    expect(service.createUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User created successfully",
      data: user,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("fetches paginated users using query params", async () => {
    const users = { data: [], total: 0, page: 1, pageSize: 20 };
    const req = { query: { page: "1", limit: "20" } } as unknown as Request;
    const res = mockResponse();
    const next = jest.fn();

    service.getUsers.mockResolvedValue(users as never);

    await userController.getUsers(req, res, next);

    expect(service.getUsers).toHaveBeenCalledWith(1, 20);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  });

  it("fetches a user by id", async () => {
    const user = { id: "user-id", email: "ada@example.com" };
    const req = { params: { id: "user-id" } } as unknown as Request;
    const res = mockResponse();
    const next = jest.fn();

    service.getUserById.mockResolvedValue(user as never);

    await userController.getUserById(req, res, next);

    expect(service.getUserById).toHaveBeenCalledWith("user-id");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  });

  it("passes service errors to next", async () => {
    const error = new Error("boom");
    const req = { params: { id: "user-id" } } as unknown as Request;
    const res = mockResponse();
    const next = jest.fn();

    service.blacklistUser.mockRejectedValue(error);

    await userController.blacklistUser(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});
