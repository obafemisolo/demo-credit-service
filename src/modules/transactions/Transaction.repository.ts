import type { Transaction } from "../../@types/transactions";
import db from "../../database/connection";
import { TRANSACTIONS_TABLE } from "./Transaction.model";

export class TransactionRepository {
  async findByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const [transactions, countResult] = await Promise.all([
      db<Transaction>(TRANSACTIONS_TABLE)
        .where({ user_id: userId })
        .orderBy("created_at", "desc")
        .offset(skip)
        .limit(limit),
      db<Transaction>(TRANSACTIONS_TABLE)
        .where({ user_id: userId })
        .count<{ count: number | string }>({ count: "*" })
        .first(),
    ]);

    return {
      transactions,
      total: Number(countResult?.count || 0),
    };
  }
}

export default new TransactionRepository();
