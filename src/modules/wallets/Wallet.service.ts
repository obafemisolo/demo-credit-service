import crypto from "crypto";

import type {
  TransferFundsRequest,
  Wallet,
  WalletAmountRequest,
  WalletTransactionResponse,
} from "../../@types/wallets";
import type { User } from "../../@types/users";
import { AppError } from "../../common/errors/AppError";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../common/errors/globalErrorHandler";
import walletRepository from "./Wallet.repository";
import { toWalletTransactionResponse, WALLET_PROVIDER } from "./Wallet.model";

export class WalletService {
  async fundUser(
    userId: string,
    dto: WalletAmountRequest,
  ): Promise<WalletTransactionResponse> {
    const user = await walletRepository.findUserById(userId);
    this.ensureUserCanTransact(user, "User not found");
    const wallet = await walletRepository.findOrCreateWalletByUserId(userId);
    this.ensureWalletCanTransact(wallet);

    const payment = this.simulateProviderPayment();
    const fundedWallet = await walletRepository.fundUser(
      userId,
      dto.amount,
      payment.reference,
    );

    if (!fundedWallet) {
      throw new NotFoundError("Wallet not found");
    }

    return toWalletTransactionResponse(
      "fund",
      dto.amount,
      payment.reference,
      user,
      fundedWallet,
    );
  }

  async withdrawUserFunds(
    userId: string,
    dto: WalletAmountRequest,
  ): Promise<WalletTransactionResponse> {
    const user = await walletRepository.findUserById(userId);
    this.ensureUserCanTransact(user, "User not found");
    const wallet = await walletRepository.findOrCreateWalletByUserId(userId);
    this.ensureWalletCanTransact(wallet);
    this.ensureSufficientBalance(Number(wallet.balance), dto.amount);

    const payment = this.simulateProviderPayment();
    const result = await walletRepository.withdrawFromUser(
      userId,
      dto.amount,
      payment.reference,
    );

    if (!result.wallet) {
      throw new NotFoundError("Wallet not found");
    }

    if (!result.completed) {
      throw new ValidationError("Insufficient balance");
    }

    return toWalletTransactionResponse(
      "withdraw",
      dto.amount,
      payment.reference,
      user,
      result.wallet,
    );
  }

  async transferFunds(
    senderId: string,
    dto: TransferFundsRequest,
  ): Promise<WalletTransactionResponse> {
    if (senderId === dto.recipientUserId) {
      throw new AppError(400, "Cannot transfer funds to the same user");
    }

    const sender = await walletRepository.findUserById(senderId);
    this.ensureUserCanTransact(sender, "Sender not found");
    const senderWallet =
      await walletRepository.findOrCreateWalletByUserId(senderId);
    this.ensureWalletCanTransact(senderWallet);
    this.ensureSufficientBalance(Number(senderWallet.balance), dto.amount);

    const recipient = await walletRepository.findUserById(dto.recipientUserId);
    this.ensureUserCanTransact(recipient, "Recipient not found");
    const recipientWallet = await walletRepository.findOrCreateWalletByUserId(
      dto.recipientUserId,
    );
    this.ensureWalletCanTransact(recipientWallet);

    const payment = this.simulateProviderPayment();
    const result = await walletRepository.transferFunds(
      senderId,
      dto.recipientUserId,
      dto.amount,
      payment.reference,
    );

    if (!result.senderWallet) {
      throw new NotFoundError("Sender wallet not found");
    }

    if (!result.recipientWallet) {
      throw new NotFoundError("Recipient wallet not found");
    }

    if (!result.completed) {
      throw new AppError(400, "Insufficient balance");
    }

    return toWalletTransactionResponse(
      "transfer",
      dto.amount,
      payment.reference,
      sender,
      result.senderWallet,
      recipient,
      result.recipientWallet,
    );
  }

  private ensureUserCanTransact(
    user: User | undefined,
    notFoundMessage: string,
  ): asserts user is User {
    if (!user) {
      throw new NotFoundError(notFoundMessage);
    }

    if (user.is_blacklisted) {
      throw new ForbiddenError("Blacklisted users cannot transact");
    }
  }

  private ensureWalletCanTransact(wallet: Wallet): void {
    if (wallet.status !== "active") {
      throw new ForbiddenError("Wallet is not active");
    }
  }

  private ensureSufficientBalance(balance: number, amount: number): void {
    if (balance < amount) {
      throw new AppError(400, "Insufficient balance");
    }
  }

  private simulateProviderPayment(): { provider: string; reference: string } {
    return {
      provider: WALLET_PROVIDER,
      reference: crypto.randomUUID(),
    };
  }
}

export default new WalletService();
