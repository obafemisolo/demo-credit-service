import type { TransactionResponse } from "../../@types/transactions";
import { NotFoundError } from "../../common/errors/globalErrorHandler";
import {
  createPaginatedResponse,
  type PaginatedResponse,
} from "../../utils/createPaginatedResponse";
import userRepository from "../users/User.repository";
import transactionRepository from "./Transaction.repository";
import { toTransactionResponse } from "./Transaction.model";

export class TransactionService {
  async getUserTransactions(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<TransactionResponse>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;
    const skip = (safePage - 1) * safeLimit;

    const { transactions, total } = await transactionRepository.findByUserId(
      userId,
      skip,
      safeLimit,
    );

    return createPaginatedResponse(
      transactions.map(toTransactionResponse),
      total,
      skip,
      safeLimit,
    );
  }
}

export default new TransactionService();
