export type TransactionType = "fund" | "withdraw" | "transfer";
export type TransactionDirection = "credit" | "debit";
export type TransactionStatus = "successful" | "failed";

export interface Transaction {
  id: string;
  reference: string;
  wallet_id: string;
  user_id: string;
  related_wallet_id?: string | null;
  related_user_id?: string | null;
  type: TransactionType;
  direction: TransactionDirection;
  amount: string | number;
  balance_before: string | number;
  balance_after: string | number;
  status: TransactionStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTransactionRecord {
  id: string;
  reference: string;
  wallet_id: string;
  user_id: string;
  related_wallet_id?: string | null;
  related_user_id?: string | null;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  balance_before: number;
  balance_after: number;
  status?: TransactionStatus;
}

export interface TransactionResponse {
  id: string;
  reference: string;
  walletId: string;
  userId: string;
  relatedWalletId?: string | null;
  relatedUserId?: string | null;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}
