import { db } from "@/db";
import { transactions } from "@/db/schema/transactions-schema";
import { eq, and, gte, lte, ilike, desc } from "drizzle-orm";
import type {
  NewTransaction,
  TransactionQuery,
  UpdateTransaction,
} from "./transactions.schema";

export const MAX_TRANSACTION_AMOUNT = 100_000_000;

/**
 * Splits an amount into chunks of MAX_TRANSACTION_AMOUNT.
 * Example: 250,000,000 -> [100,000,000, 100,000,000, 50,000,000]
 */
export function breakTransaction(amount: number): number[] {
  const chunks: number[] = [];
  let remaining = amount;

  while (remaining > MAX_TRANSACTION_AMOUNT) {
    chunks.push(MAX_TRANSACTION_AMOUNT);
    remaining -= MAX_TRANSACTION_AMOUNT;
  }

  if (remaining > 0) {
    chunks.push(remaining);
  }

  return chunks;
}

export async function createTransaction(userId: string, data: NewTransaction) {
  const amounts = breakTransaction(data.amount);

  const newTransactions = amounts.map((amount) => ({
    ...data,
    userId,
    amount,
  }));

  return await db.insert(transactions).values(newTransactions).returning();
}

export async function getTransactions(userId: string, query: TransactionQuery) {
  const filters = [eq(transactions.userId, userId)];

  if (query.type) {
    filters.push(eq(transactions.type, query.type));
  }
  if (query.category) {
    filters.push(eq(transactions.category, query.category));
  }
  if (query.startDate) {
    filters.push(gte(transactions.transactionDate, query.startDate));
  }
  if (query.endDate) {
    filters.push(lte(transactions.transactionDate, query.endDate));
  }
  if (query.searchTitle) {
    filters.push(ilike(transactions.title, `%${query.searchTitle}%`));
  }

  return await db.query.transactions.findMany({
    where: and(...filters),
    orderBy: [desc(transactions.transactionDate), desc(transactions.createdAt)],
  });
}

export async function getTransactionById(userId: string, id: string) {
  return await db.query.transactions.findFirst({
    where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
  });
}

export async function updateTransaction(
  userId: string,
  id: string,
  data: UpdateTransaction,
) {
  // Check if original transaction exists and belongs to user
  const existing = await getTransactionById(userId, id);
  if (!existing) return null;

  // If amount is being updated and it exceeds MAX, we follow "delete and re-break" logic if requested,
  // or just update if it doesn't.
  // requirement: "If amount is updated to > 100.000.000: Delete the original transaction, Create new transactions with auto-break logic"

  if (data.amount && data.amount > MAX_TRANSACTION_AMOUNT) {
    await db.delete(transactions).where(eq(transactions.id, id));
    return await createTransaction(userId, {
      ...existing,
      ...data,
      amount: data.amount,
    } as NewTransaction);
  }

  return await db
    .update(transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();
}

export async function deleteTransaction(userId: string, id: string) {
  return await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();
}

export async function getDashboardSummary(userId: string) {
  const allTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: [desc(transactions.transactionDate)],
  });

  const summary = {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    byCategory: {
      fnb: 0,
      laundry: 0,
      transport: 0,
      college: 0,
      entertainment: 0,
      other: 0,
    },
    byMonth: {} as Record<string, { income: number; expense: number }>,
  };

  allTransactions.forEach((t) => {
    const amount = Number(t.amount);
    if (t.type === "income") {
      summary.totalIncome += amount;
    } else {
      summary.totalExpense += amount;
      summary.byCategory[t.category as keyof typeof summary.byCategory] +=
        amount;
    }

    const month = t.transactionDate.substring(0, 7); // YYYY-MM
    if (!summary.byMonth[month]) {
      summary.byMonth[month] = { income: 0, expense: 0 };
    }
    if (t.type === "income") {
      summary.byMonth[month].income += amount;
    } else {
      summary.byMonth[month].expense += amount;
    }
  });

  summary.netBalance = summary.totalIncome - summary.totalExpense;

  return {
    summary,
    recentTransactions: allTransactions.slice(0, 10),
  };
}
