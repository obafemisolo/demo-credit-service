import type { UserResponse } from "./users";

export type WalletStatus = "active" | "disabled";

export interface Wallet {
  id: string;
  user_id: string;
  balance: string | number;
  currency: string;
  status: WalletStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWalletRecord {
  id: string;
  user_id: string;
  balance?: number;
  currency?: string;
  status?: WalletStatus;
}

export interface WalletResponse {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: WalletStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletAmountRequest {
  amount: number;
}

export interface TransferFundsRequest extends WalletAmountRequest {
  recipientUserId: string;
}

export interface WalletTransactionResponse {
  reference: string;
  amount: number;
  type: "fund" | "withdraw" | "transfer";
  user: UserResponse;
  wallet: WalletResponse;
  recipient?: UserResponse;
  recipientWallet?: WalletResponse;
}
