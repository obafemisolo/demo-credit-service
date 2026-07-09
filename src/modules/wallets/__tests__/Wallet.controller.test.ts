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

jest.mock("../Wallet.service", () => ({
  __esModule: true,
  default: {
    fundUser: jest.fn(),
    withdrawUserFunds: jest.fn(),
    transferFunds: jest.fn(),
  },
}));

import walletController from "../Wallet.controller";
import walletService from "../Wallet.service";

const service = jest.mocked(walletService);

function mockResponse(): Response {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
}

describe("WalletController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("funds a user account", async () => {
    const transaction = { reference: "ref", type: "fund", amount: 5000 };
    const req = {
      params: { userId: "user-id" },
      body: { amount: 5000 },
    } as unknown as Request;
    const res = mockResponse();
    const next = jest.fn();

    service.fundUser.mockResolvedValue(transaction as never);

    await walletController.fundUser(req, res, next);

    expect(service.fundUser).toHaveBeenCalledWith("user-id", req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Account funded successfully",
      data: transaction,
    });
  });

  it("withdraws funds", async () => {
    const transaction = { reference: "ref", type: "withdraw", amount: 2000 };
    const req = {
      params: { userId: "user-id" },
      body: { amount: 2000 },
    } as unknown as Request;
    const res = mockResponse();
    const next = jest.fn();

    service.withdrawUserFunds.mockResolvedValue(transaction as never);

    await walletController.withdrawUserFunds(req, res, next);

    expect(service.withdrawUserFunds).toHaveBeenCalledWith("user-id", req.body);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Withdrawal successful",
      data: transaction,
    });
  });

  it("transfers funds", async () => {
    const transaction = { reference: "ref", type: "transfer", amount: 2000 };
    const req = {
      params: { userId: "sender-id" },
      body: { recipientUserId: "recipient-id", amount: 2000 },
    } as unknown as Request;
    const res = mockResponse();
    const next = jest.fn();

    service.transferFunds.mockResolvedValue(transaction as never);

    await walletController.transferFunds(req, res, next);

    expect(service.transferFunds).toHaveBeenCalledWith("sender-id", req.body);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Transfer successful",
      data: transaction,
    });
  });
});
