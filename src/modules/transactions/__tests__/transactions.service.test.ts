import { describe, expect, test, mock } from "bun:test";

import * as service from "@/modules/transactions/transactions.service";

describe("transactions.service", () => {
  const createDbMock = () => ({
    insert: mock(() => ({
      values: mock(() => ({
        returning: mock(() => [
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            amount: 1000,
            type: "expense",
            userId: "user-1",
            date: new Date(),
            categoryId: null,
          },
        ]),
      })),
    })),
    query: {
      transaction: {
        findMany: mock(() => [
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            amount: 1000,
            type: "expense",
            userId: "user-1",
            date: new Date(),
            categoryId: null,
          },
        ]),
        findFirst: mock(() => ({
          id: "550e8400-e29b-41d4-a716-446655440002",
          amount: 1000,
          type: "expense",
          userId: "user-1",
          date: new Date(),
          categoryId: null,
        })),
      },
    },
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => ({
          returning: mock(() => [
            {
              id: "550e8400-e29b-41d4-a716-446655440002",
              amount: 1200,
              type: "expense",
              userId: "user-1",
              date: new Date(),
              categoryId: null,
            },
          ]),
        })),
      })),
    })),
    delete: mock(() => ({
      where: mock(() => ({
        returning: mock(() => [{ id: "550e8400-e29b-41d4-a716-446655440002" }]),
      })),
    })),
  });

  test("createTransaction returns created transaction", async () => {
    const db = createDbMock();
    const data = {
      amount: 1000,
      type: "expense" as const,
      date: new Date().toISOString(),
      categoryId: null,
    };
    const userId = "user-1";
    const result = await service.createTransaction(data, userId, db as never);
    expect(result.amount).toBe(1000);
    expect(result.userId).toBe(userId);
  });

  test("getTransactions returns list of transactions", async () => {
    const db = createDbMock();
    const userId = "user-1";
    const result = await service.getTransactions(userId, {}, db as never);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].amount).toBe(1000);
  });

  test("getTransactionById returns a single transaction", async () => {
    const db = createDbMock();
    const result = await service.getTransactionById(
      "550e8400-e29b-41d4-a716-446655440002",
      "user-1",
      db as never,
    );
    expect(result?.id).toBe("550e8400-e29b-41d4-a716-446655440002");
  });

  test("updateTransaction returns updated transaction", async () => {
    const db = createDbMock();
    const result = await service.updateTransaction(
      "550e8400-e29b-41d4-a716-446655440002",
      "user-1",
      {
        amount: 1200,
      },
      db as never,
    );
    expect(result?.amount).toBe(1200);
  });

  test("deleteCategory returns deleted id", async () => {
    const db = createDbMock();
    const result = await service.deleteTransaction(
      "550e8400-e29b-41d4-a716-446655440002",
      "user-1",
      db as never,
    );
    expect(result?.id).toBe("550e8400-e29b-41d4-a716-446655440002");
  });
});
