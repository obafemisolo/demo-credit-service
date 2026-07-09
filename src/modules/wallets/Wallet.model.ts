import type { User } from "../../@types/users";
import type {
  Wallet,
  WalletResponse,
  WalletTransactionResponse,
} from "../../@types/wallets";
import { toUserResponse } from "../users/User.model";

export const WALLET_PROVIDER = "FAUX_PAYMENT_PROVIDER";
export const WALLETS_TABLE = "wallets";
export const DEFAULT_WALLET_CURRENCY = "NGN";
export const ACTIVE_WALLET_STATUS = "active";

export function toWalletResponse(wallet: Wallet): WalletResponse {
  return {
    id: wallet.id,
    userId: wallet.user_id,
    balance: Number(wallet.balance),
    currency: wallet.currency,
    status: wallet.status,
    createdAt: wallet.created_at,
    updatedAt: wallet.updated_at,
  };
}

export function toWalletTransactionResponse(
  type: WalletTransactionResponse["type"],
  amount: number,
  reference: string,
  user: User,
  wallet: Wallet,
  recipient?: User,
  recipientWallet?: Wallet,
): WalletTransactionResponse {
  return {
    reference,
    amount,
    type,
    user: toUserResponse(user),
    wallet: toWalletResponse(wallet),
    recipient: recipient ? toUserResponse(recipient) : undefined,
    recipientWallet: recipientWallet
      ? toWalletResponse(recipientWallet)
      : undefined,
  };
}
