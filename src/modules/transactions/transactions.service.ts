import { eq, and, desc } from "drizzle-orm";
import { transaction } from "@/db/schema";
import type {
  InsertTransaction,
  PatchTransaction,
} from "./transactions.schema";

type DbClient = typeof import("@/db").db;

export const createTransaction = async (
  data: InsertTransaction,
  userId: string,
  db: DbClient,
) => {
  const [newTransaction] = await db
    .insert(transaction)
    .values({
      ...data,
      userId,
      date: new Date(data.date),
    })
    .returning();
  return newTransaction ?? null;
};

export const getTransactions = async (
  userId: string,
  filters: {
    categoryId?: string;
    type?: "income" | "expense";
    limit?: number;
    offset?: number;
  },
  db: DbClient,
) => {
  const conditions = [eq(transaction.userId, userId)];

  if (filters.categoryId) {
    conditions.push(eq(transaction.categoryId, filters.categoryId));
  }
  if (filters.type) {
    conditions.push(eq(transaction.type, filters.type));
  }

  return await db.query.transaction.findMany({
    where: and(...conditions),
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
    orderBy: [desc(transaction.date), desc(transaction.createdAt)],
  });
};

export const getTransactionById = async (
  id: string,
  userId: string,
  db: DbClient,
) => {
  return await db.query.transaction.findFirst({
    where: and(eq(transaction.id, id), eq(transaction.userId, userId)),
  });
};

export const updateTransaction = async (
  id: string,
  userId: string,
  data: PatchTransaction,
  db: DbClient,
) => {
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  };
  if (data.date) {
    updateData.date = new Date(data.date);
  }

  const [updated] = await db
    .update(transaction)
    .set(updateData)
    .where(and(eq(transaction.id, id), eq(transaction.userId, userId)))
    .returning();
  return updated ?? null;
};

export const deleteTransaction = async (
  id: string,
  userId: string,
  db: DbClient,
) => {
  const [deleted] = await db
    .delete(transaction)
    .where(and(eq(transaction.id, id), eq(transaction.userId, userId)))
    .returning();
  return deleted ?? null;
};
