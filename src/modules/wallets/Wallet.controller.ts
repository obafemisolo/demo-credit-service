import type { Request, Response } from "express";

import { ApiResponse } from "../../common/ApiResponse";
import { asyncHandler } from "../../common/asyncHandler";
import walletService from "./Wallet.service";

export class WalletController {
  fundUser = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await walletService.fundUser(
      String(req.params.userId),
      req.body,
    );

    res
      .status(200)
      .json(ApiResponse.success("Account funded successfully", transaction));
  });

  withdrawUserFunds = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await walletService.withdrawUserFunds(
      String(req.params.userId),
      req.body,
    );

    res
      .status(200)
      .json(ApiResponse.success("Withdrawal successful", transaction));
  });

  transferFunds = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await walletService.transferFunds(
      String(req.params.userId),
      req.body,
    );

    res
      .status(200)
      .json(ApiResponse.success("Transfer successful", transaction));
  });
}

export default new WalletController();
