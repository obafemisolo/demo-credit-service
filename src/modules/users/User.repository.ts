import crypto from "crypto";

import type { CreateUserRecord, User } from "../../@types/users";
import type { CreateWalletRecord, Wallet } from "../../@types/wallets";
import db from "../../database/connection";
import {
  ACTIVE_WALLET_STATUS,
  DEFAULT_WALLET_CURRENCY,
  WALLETS_TABLE,
} from "../wallets/Wallet.model";
import { USERS_TABLE } from "./User.model";

export class UserRepository {
  async createWithWallet(user: CreateUserRecord): Promise<User> {
    return db.transaction(async (trx) => {
      await trx<User>(USERS_TABLE).insert(user);

      const wallet: CreateWalletRecord = {
        id: crypto.randomUUID(),
        user_id: user.id,
        balance: 0,
        currency: DEFAULT_WALLET_CURRENCY,
        status: ACTIVE_WALLET_STATUS,
      };

      await trx<Wallet>(WALLETS_TABLE).insert(wallet);

      const createdUser = await trx<User>(USERS_TABLE)
        .where({ id: user.id })
        .first();

      if (!createdUser) {
        throw new Error("Failed to create user");
      }

      return createdUser;
    });
  }

  async create(user: CreateUserRecord): Promise<User> {
    return this.createWithWallet(user);
  }

  async findAll(
    skip: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    const [users, countResult] = await Promise.all([
      db<User>(USERS_TABLE)
        .select("*")
        .orderBy("created_at", "desc")
        .offset(skip)
        .limit(limit),
      db<User>(USERS_TABLE)
        .count<{ count: number | string }>({ count: "*" })
        .first(),
    ]);

    return {
      users,
      total: Number(countResult?.count || 0),
    };
  }

  async findById(id: string): Promise<User | undefined> {
    return db<User>(USERS_TABLE).where({ id }).first();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return db<User>(USERS_TABLE).where({ email }).first();
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return db<User>(USERS_TABLE).where({ phone_number: phoneNumber }).first();
  }

  async updateBlacklistStatus(
    id: string,
    isBlacklisted: boolean,
  ): Promise<User | undefined> {
    await db<User>(USERS_TABLE)
      .where({ id })
      .update({ is_blacklisted: isBlacklisted, updated_at: db.fn.now() });

    return this.findById(id);
  }
}

export default new UserRepository();
