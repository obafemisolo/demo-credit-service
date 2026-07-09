import crypto from "crypto";
import type { Knex } from "knex";

import type { CreateTransactionRecord } from "../../@types/transactions";
import type { User } from "../../@types/users";
import type { CreateWalletRecord, Wallet } from "../../@types/wallets";
import { AppError } from "../../common/errors/AppError";
import db from "../../database/connection";
import { TRANSACTIONS_TABLE } from "../transactions/Transaction.model";
import { USERS_TABLE } from "../users/User.model";
import {
  ACTIVE_WALLET_STATUS,
  DEFAULT_WALLET_CURRENCY,
  WALLETS_TABLE,
} from "./Wallet.model";

export class WalletRepository {
  async findUserById(id: string): Promise<User | undefined> {
    return db<User>(USERS_TABLE).where({ id }).first();
  }

  async createForUser(userId: string): Promise<Wallet> {
    const wallet: CreateWalletRecord = {
      id: crypto.randomUUID(),
      user_id: userId,
      balance: 0,
      currency: DEFAULT_WALLET_CURRENCY,
      status: ACTIVE_WALLET_STATUS,
    };

    await db<Wallet>(WALLETS_TABLE).insert(wallet);

    const createdWallet = await this.findWalletByUserId(userId);
    if (!createdWallet) {
      throw new AppError(400, "Failed to create wallet");
    }

    return createdWallet;
  }

  async findWalletByUserId(userId: string): Promise<Wallet | undefined> {
    return db<Wallet>(WALLETS_TABLE).where({ user_id: userId }).first();
  }

  async findOrCreateWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.findWalletByUserId(userId);
    if (wallet) return wallet;

    return this.createForUser(userId);
  }

  async fundUser(
    userId: string,
    amount: number,
    reference: string,
  ): Promise<Wallet | undefined> {
    await this.findOrCreateWalletByUserId(userId);

    return db.transaction(async (trx) => {
      const wallet = await this.findWalletForUpdate(trx, userId);
      if (!wallet) return undefined;

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + amount;

      await trx<Wallet>(WALLETS_TABLE)
        .where({ user_id: userId })
        .update({ balance: balanceAfter, updated_at: trx.fn.now() });

      await this.createTransaction(trx, {
        id: crypto.randomUUID(),
        reference,
        wallet_id: wallet.id,
        user_id: userId,
        type: "fund",
        direction: "credit",
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      });

      return trx<Wallet>(WALLETS_TABLE).where({ user_id: userId }).first();
    });
  }

  async withdrawFromUser(
    userId: string,
    amount: number,
    reference: string,
  ): Promise<{ wallet?: Wallet; completed: boolean }> {
    return db.transaction(async (trx) => {
      const wallet = await this.findWalletForUpdate(trx, userId);
      if (!wallet) return { completed: false };

      const balanceBefore = Number(wallet.balance);
      if (balanceBefore < amount) return { wallet, completed: false };

      const balanceAfter = balanceBefore - amount;

      await trx<Wallet>(WALLETS_TABLE)
        .where({ user_id: userId })
        .update({ balance: balanceAfter, updated_at: trx.fn.now() });

      await this.createTransaction(trx, {
        id: crypto.randomUUID(),
        reference,
        wallet_id: wallet.id,
        user_id: userId,
        type: "withdraw",
        direction: "debit",
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      });

      const updatedWallet = await trx<Wallet>(WALLETS_TABLE)
        .where({ user_id: userId })
        .first();

      return { wallet: updatedWallet, completed: true };
    });
  }

  async transferFunds(
    senderId: string,
    recipientId: string,
    amount: number,
    reference: string,
  ): Promise<{
    senderWallet?: Wallet;
    recipientWallet?: Wallet;
    completed: boolean;
  }> {
    return db.transaction(async (trx) => {
      const senderWallet = await this.findWalletForUpdate(trx, senderId);
      const recipientWallet = await this.findWalletForUpdate(trx, recipientId);

      if (!senderWallet || !recipientWallet) {
        return { senderWallet, recipientWallet, completed: false };
      }

      const senderBalanceBefore = Number(senderWallet.balance);
      if (senderBalanceBefore < amount) {
        return { senderWallet, recipientWallet, completed: false };
      }

      const recipientBalanceBefore = Number(recipientWallet.balance);
      const senderBalanceAfter = senderBalanceBefore - amount;
      const recipientBalanceAfter = recipientBalanceBefore + amount;

      await trx<Wallet>(WALLETS_TABLE)
        .where({ user_id: senderId })
        .update({ balance: senderBalanceAfter, updated_at: trx.fn.now() });

      await trx<Wallet>(WALLETS_TABLE)
        .where({ user_id: recipientId })
        .update({ balance: recipientBalanceAfter, updated_at: trx.fn.now() });

      await this.createTransaction(trx, {
        id: crypto.randomUUID(),
        reference,
        wallet_id: senderWallet.id,
        user_id: senderId,
        related_wallet_id: recipientWallet.id,
        related_user_id: recipientId,
        type: "transfer",
        direction: "debit",
        amount,
        balance_before: senderBalanceBefore,
        balance_after: senderBalanceAfter,
      });

      await this.createTransaction(trx, {
        id: crypto.randomUUID(),
        reference,
        wallet_id: recipientWallet.id,
        user_id: recipientId,
        related_wallet_id: senderWallet.id,
        related_user_id: senderId,
        type: "transfer",
        direction: "credit",
        amount,
        balance_before: recipientBalanceBefore,
        balance_after: recipientBalanceAfter,
      });

      const [updatedSenderWallet, updatedRecipientWallet] = await Promise.all([
        trx<Wallet>(WALLETS_TABLE).where({ user_id: senderId }).first(),
        trx<Wallet>(WALLETS_TABLE).where({ user_id: recipientId }).first(),
      ]);

      return {
        senderWallet: updatedSenderWallet,
        recipientWallet: updatedRecipientWallet,
        completed: true,
      };
    });
  }

  private async findWalletForUpdate(
    trx: Knex.Transaction,
    userId: string,
  ): Promise<Wallet | undefined> {
    return trx<Wallet>(WALLETS_TABLE)
      .where({ user_id: userId })
      .forUpdate()
      .first();
  }

  private async createTransaction(
    trx: Knex.Transaction,
    transaction: CreateTransactionRecord,
  ): Promise<void> {
    await trx<CreateTransactionRecord>(TRANSACTIONS_TABLE).insert({
      ...transaction,
      status: transaction.status || "successful",
    });
  }
}

export default new WalletRepository();
