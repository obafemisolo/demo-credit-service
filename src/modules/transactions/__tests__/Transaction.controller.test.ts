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

jest.mock("../Transaction.service", () => ({
  __esModule: true,
  default: {
    getUserTransactions: jest.fn(),
  },
}));

import transactionController from "../Transaction.controller";
import transactionService from "../Transaction.service";

const service = jest.mocked(transactionService);

function mockResponse(): Response {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
}

describe("TransactionController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches user transaction history", async () => {
    const history = { data: [], total: 0, page: 1, pageSize: 20 };
    const req = {
      params: { userId: "user-id" },
      query: { page: "1", limit: "20" },
    } as unknown as Request;
    const res = mockResponse();
    const next = jest.fn();

    service.getUserTransactions.mockResolvedValue(history as never);

    await transactionController.getUserTransactions(req, res, next);

    expect(service.getUserTransactions).toHaveBeenCalledWith("user-id", 1, 20);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Transactions fetched successfully",
      data: history,
    });
  });
});
