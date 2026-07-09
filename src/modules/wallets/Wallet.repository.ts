import crypto from "crypto";

import type { Knex } from "knex";

import type { User } from "../../@types/users";

import type { CreateWalletRecord, Wallet } from "../../@types/wallets";

import db from "../../database/connection";

import { USERS_TABLE } from "../users/User.model";

import {
  ACTIVE_WALLET_STATUS,
  DEFAULT_WALLET_CURRENCY,
  WALLETS_TABLE,
} from "./Wallet.model";

import { AppError } from "../../common/errors/AppError";

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

  async fundUser(userId: string, amount: number): Promise<Wallet | undefined> {
    await this.findOrCreateWalletByUserId(userId);

    await db<Wallet>(WALLETS_TABLE)
      .where({ user_id: userId })
      .increment("balance", amount)
      .update({ updated_at: db.fn.now() });

    return this.findWalletByUserId(userId);
  }

  async withdrawFromUser(
    userId: string,
    amount: number,
  ): Promise<{ wallet?: Wallet; completed: boolean }> {
    return db.transaction(async (trx) => {
      const wallet = await this.findWalletForUpdate(trx, userId);
      if (!wallet) return { completed: false };

      const balance = Number(wallet.balance);
      if (balance < amount) return { wallet, completed: false };

      await trx<Wallet>(WALLETS_TABLE)
        .where({ user_id: userId })
        .decrement("balance", amount)
        .update({ updated_at: trx.fn.now() });

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

      if (Number(senderWallet.balance) < amount) {
        return { senderWallet, recipientWallet, completed: false };
      }

      await trx<Wallet>(WALLETS_TABLE)
        .where({ user_id: senderId })
        .decrement("balance", amount)
        .update({ updated_at: trx.fn.now() });

      await trx<Wallet>(WALLETS_TABLE)
        .where({ user_id: recipientId })
        .increment("balance", amount)
        .update({ updated_at: trx.fn.now() });

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
}

export default new WalletRepository();
