import type { NextFunction, Request, Response } from "express";

import {
  authenticateFauxToken,
  authorizeRouteUser,
} from "../fauxAuth";
import userRepository from "../../modules/users/User.repository";

jest.mock("../../modules/users/User.repository", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

const repository = jest.mocked(userRepository);

function mockRequest(headers: Record<string, string> = {}, params = {}) {
  return {
    header: jest.fn((name: string) => headers[name.toLowerCase()]),
    params,
  } as unknown as Request;
}

function mockResponse() {
  return { locals: {} } as Response;
}

describe("fauxAuth middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("authenticates a valid x-user-id token", async () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    const req = mockRequest({ "x-user-id": userId });
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    repository.findById.mockResolvedValue({
      id: userId,
      is_blacklisted: false,
    } as never);

    await authenticateFauxToken(req, res, next);

    expect(repository.findById).toHaveBeenCalledWith(userId);
    expect(res.locals.userId).toBe(userId);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects missing or invalid faux tokens", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    await authenticateFauxToken(req, res, next);

    expect(repository.findById).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: "Valid faux token is required",
      }),
    );
  });

  it("rejects access to another user's route resource", () => {
    const req = mockRequest({}, { userId: "route-user-id" });
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    res.locals.userId = "token-user-id";

    authorizeRouteUser("userId")(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: "You cannot access another user's resource",
      }),
    );
  });
});
