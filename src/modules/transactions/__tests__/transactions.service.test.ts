import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { db } from "@/db";
import { transactions } from "@/db/schema/transactions-schema";
import { user } from "@/db/schema/auth-schema";
import {
  createTransaction,
  getTransactions,
  deleteTransaction,
  breakTransaction,
} from "../transactions.service";
import { eq } from "drizzle-orm";

describe("Transaction Service - breakTransaction", () => {
  test("should not break transaction if amount is <= 100,000,000", () => {
    const amount = 50_000_000;
    const result = breakTransaction(amount);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(50_000_000);
  });

  test("should break 150,000,000 into 100,000,000 and 50,000,000", () => {
    const amount = 150_000_000;
    const result = breakTransaction(amount);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(100_000_000);
    expect(result[1]).toBe(50_000_000);
  });
});

describe("Transaction Service Integration", () => {
  const testUserId = "test-user-id";

  beforeAll(async () => {
    // Cleanup and prepare test user
    await db.delete(transactions).where(eq(transactions.userId, testUserId));
    await db.delete(user).where(eq(user.id, testUserId));
    await db
      .insert(user)
      .values({ id: testUserId, name: "Test User", email: "test@example.com" });
  });

  afterAll(async () => {
    await db.delete(transactions).where(eq(transactions.userId, testUserId));
    await db.delete(user).where(eq(user.id, testUserId));
  });

  test("createTransaction should insert multiple rows if amount > 100jt", async () => {
    const result = await createTransaction(testUserId, {
      title: "Expensive Purchase",
      amount: 250_000_000,
      type: "expense",
      category: "other",
      transactionDate: "2026-03-23",
    });

    expect(result).toHaveLength(3);
    expect(result[0].amount).toBe(100_000_000);
    expect(result[1].amount).toBe(100_000_000);
    expect(result[2].amount).toBe(50_000_000);
  });

  test("getTransactions should filter by type", async () => {
    await createTransaction(testUserId, {
      title: "Salary",
      amount: 50_000_000,
      type: "income",
      category: "other",
      transactionDate: "2026-03-23",
    });

    const income = await getTransactions(testUserId, { type: "income" });
    expect(income).toHaveLength(1);
    expect(income[0].type).toBe("income");

    const expenses = await getTransactions(testUserId, { type: "expense" });
    expect(expenses.length).toBeGreaterThanOrEqual(3); // from previous test
  });

  test("deleteTransaction should remove the transaction", async () => {
    const [created] = await createTransaction(testUserId, {
      title: "Temporary",
      amount: 1000,
      type: "expense",
      category: "other",
      transactionDate: "2026-03-23",
    });

    await deleteTransaction(testUserId, created.id);
    const found = await db.query.transactions.findFirst({
      where: eq(transactions.id, created.id),
    });
    expect(found).toBeUndefined();
  });
});
