import type { User } from "../../../@types/users";
import type { Wallet } from "../../../@types/wallets";
import walletRepository from "../Wallet.repository";
import walletService from "../Wallet.service";

jest.mock("../Wallet.repository", () => ({
  __esModule: true,
  default: {
    findUserById: jest.fn(),
    findOrCreateWalletByUserId: jest.fn(),
    fundUser: jest.fn(),
    withdrawFromUser: jest.fn(),
    transferFunds: jest.fn(),
  },
}));

const repository = jest.mocked(walletRepository);

function buildUser(overrides: Partial<User> = {}): User {
  const now = new Date("2026-07-09T10:00:00.000Z");

  return {
    id: "11111111-1111-4111-8111-111111111111",
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    phone_number: "08012345678",
    password_hash: "salt:hash",
    is_blacklisted: false,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

function buildWallet(overrides: Partial<Wallet> = {}): Wallet {
  const now = new Date("2026-07-09T10:00:00.000Z");

  return {
    id: "22222222-2222-4222-8222-222222222222",
    user_id: "11111111-1111-4111-8111-111111111111",
    balance: 5000,
    currency: "NGN",
    status: "active",
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

describe("WalletService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("funds a user account", async () => {
    repository.findUserById.mockResolvedValue(buildUser());
    repository.findOrCreateWalletByUserId.mockResolvedValue(
      buildWallet({ balance: 0 }),
    );
    repository.fundUser.mockResolvedValue(buildWallet({ balance: 5000 }));

    const result = await walletService.fundUser("user-id", { amount: 5000 });

    expect(repository.fundUser).toHaveBeenCalledWith(
      "user-id",
      5000,
      expect.any(String),
    );
    expect(result).toEqual(
      expect.objectContaining({
        amount: 5000,
        type: "fund",
        reference: expect.any(String),
      }),
    );
    expect(result.wallet.balance).toBe(5000);
  });

  it("withdraws from a user account", async () => {
    repository.findUserById.mockResolvedValue(buildUser());
    repository.findOrCreateWalletByUserId.mockResolvedValue(
      buildWallet({ balance: 5000 }),
    );
    repository.withdrawFromUser.mockResolvedValue({
      wallet: buildWallet({ balance: 3000 }),
      completed: true,
    });

    const result = await walletService.withdrawUserFunds("user-id", {
      amount: 2000,
    });

    expect(repository.withdrawFromUser).toHaveBeenCalledWith(
      "user-id",
      2000,
      expect.any(String),
    );
    expect(result.type).toBe("withdraw");
    expect(result.wallet.balance).toBe(3000);
  });

  it("rejects withdrawal when balance is insufficient", async () => {
    repository.findUserById.mockResolvedValue(buildUser());
    repository.findOrCreateWalletByUserId.mockResolvedValue(
      buildWallet({ balance: 1000 }),
    );

    await expect(
      walletService.withdrawUserFunds("user-id", { amount: 2000 }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Insufficient balance",
    });

    expect(repository.withdrawFromUser).not.toHaveBeenCalled();
  });

  it("transfers funds to another user", async () => {
    const sender = buildUser({ id: "sender-id" });
    const recipient = buildUser({
      id: "recipient-id",
      email: "grace@example.com",
    });

    repository.findUserById
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce(recipient);
    repository.findOrCreateWalletByUserId
      .mockResolvedValueOnce(buildWallet({ user_id: "sender-id", balance: 5000 }))
      .mockResolvedValueOnce(
        buildWallet({ user_id: "recipient-id", balance: 1000 }),
      );
    repository.transferFunds.mockResolvedValue({
      senderWallet: buildWallet({ user_id: "sender-id", balance: 3000 }),
      recipientWallet: buildWallet({
        user_id: "recipient-id",
        balance: 3000,
      }),
      completed: true,
    });

    const result = await walletService.transferFunds("sender-id", {
      recipientUserId: "recipient-id",
      amount: 2000,
    });

    expect(repository.transferFunds).toHaveBeenCalledWith(
      "sender-id",
      "recipient-id",
      2000,
      expect.any(String),
    );
    expect(result.type).toBe("transfer");
    expect(result.wallet.balance).toBe(3000);
    expect(result.recipientWallet?.balance).toBe(3000);
  });

  it("does not transfer to the same user", async () => {
    await expect(
      walletService.transferFunds("same-id", {
        recipientUserId: "same-id",
        amount: 1000,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Cannot transfer funds to the same user",
    });

    expect(repository.transferFunds).not.toHaveBeenCalled();
  });
});
