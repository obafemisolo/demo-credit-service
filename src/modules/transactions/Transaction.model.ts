import type { Transaction, TransactionResponse } from "../../@types/transactions";

export const TRANSACTIONS_TABLE = "transactions";

export function toTransactionResponse(
  transaction: Transaction,
): TransactionResponse {
  return {
    id: transaction.id,
    reference: transaction.reference,
    walletId: transaction.wallet_id,
    userId: transaction.user_id,
    relatedWalletId: transaction.related_wallet_id,
    relatedUserId: transaction.related_user_id,
    type: transaction.type,
    direction: transaction.direction,
    amount: Number(transaction.amount),
    balanceBefore: Number(transaction.balance_before),
    balanceAfter: Number(transaction.balance_after),
    status: transaction.status,
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at,
  };
}
