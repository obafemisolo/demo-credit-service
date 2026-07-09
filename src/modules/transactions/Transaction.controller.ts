import type { Request, Response } from "express";

import { ApiResponse } from "../../common/ApiResponse";
import { asyncHandler } from "../../common/asyncHandler";
import transactionService from "./Transaction.service";

export class TransactionController {
  getUserTransactions = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const transactions = await transactionService.getUserTransactions(
      String(req.params.userId),
      page,
      limit,
    );

    res
      .status(200)
      .json(
        ApiResponse.success("Transactions fetched successfully", transactions),
      );
  });
}

export default new TransactionController();
