import type { Transaction } from "../../../@types/transactions";
import userRepository from "../../users/User.repository";
import transactionRepository from "../Transaction.repository";
import transactionService from "../Transaction.service";

jest.mock("../../users/User.repository", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock("../Transaction.repository", () => ({
  __esModule: true,
  default: {
    findByUserId: jest.fn(),
  },
}));

const users = jest.mocked(userRepository);
const transactions = jest.mocked(transactionRepository);

function buildTransaction(
  overrides: Partial<Transaction> = {},
): Transaction {
  const now = new Date("2026-07-09T10:00:00.000Z");

  return {
    id: "33333333-3333-4333-8333-333333333333",
    reference: "reference",
    wallet_id: "22222222-2222-4222-8222-222222222222",
    user_id: "11111111-1111-4111-8111-111111111111",
    related_wallet_id: null,
    related_user_id: null,
    type: "fund",
    direction: "credit",
    amount: 5000,
    balance_before: 0,
    balance_after: 5000,
    status: "successful",
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

describe("TransactionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns paginated user transactions", async () => {
    users.findById.mockResolvedValue({ id: "user-id" } as never);
    transactions.findByUserId.mockResolvedValue({
      transactions: [buildTransaction()],
      total: 1,
    });

    const result = await transactionService.getUserTransactions("user-id", 1, 20);

    expect(transactions.findByUserId).toHaveBeenCalledWith("user-id", 0, 20);
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        reference: "reference",
        type: "fund",
        direction: "credit",
        amount: 5000,
        balanceBefore: 0,
        balanceAfter: 5000,
      }),
    );
  });

  it("throws when the user does not exist", async () => {
    users.findById.mockResolvedValue(undefined);

    await expect(
      transactionService.getUserTransactions("missing-user"),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "User not found",
    });

    expect(transactions.findByUserId).not.toHaveBeenCalled();
  });
});
