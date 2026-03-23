import { db } from "@/db";
import { transactions } from "@/db/schema/transactions-schema";
import { eq, and, gte, lte, ilike, desc, sql, sum } from "drizzle-orm";
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
      title: data.title ?? existing.title,
      amount: data.amount,
      type: data.type ?? existing.type,
      category: data.category ?? existing.category,
      transactionDate: data.transactionDate ?? existing.transactionDate,
    });
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
  // 1. Get transaction totals (Income vs Expense)
  const totals = await db
    .select({
      type: transactions.type,
      total: sum(transactions.amount).mapWith(Number),
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .groupBy(transactions.type);

  const totalIncome = totals.find((t) => t.type === "income")?.total ?? 0;
  const totalExpense = totals.find((t) => t.type === "expense")?.total ?? 0;

  // 2. Get totals by category (Expenses only)
  const categoryTotals = await db
    .select({
      category: transactions.category,
      total: sum(transactions.amount).mapWith(Number),
    })
    .from(transactions)
    .where(
      and(eq(transactions.userId, userId), eq(transactions.type, "expense")),
    )
    .groupBy(transactions.category);

  // 3. Get totals by month
  const monthTotals = await db
    .select({
      month: sql<string>`substring(${transactions.transactionDate}, 1, 7)`,
      type: transactions.type,
      total: sum(transactions.amount).mapWith(Number),
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .groupBy(
      sql`substring(${transactions.transactionDate}, 1, 7)`,
      transactions.type,
    );

  // 4. Get recent transactions
  const recentTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: [desc(transactions.transactionDate), desc(transactions.createdAt)],
    limit: 10,
  });

  // Assemble summary
  const byCategory = {
    fnb: 0,
    laundry: 0,
    transport: 0,
    college: 0,
    entertainment: 0,
    other: 0,
  };
  categoryTotals.forEach((ct) => {
    if (ct.category in byCategory) {
      byCategory[ct.category as keyof typeof byCategory] = ct.total;
    }
  });

  const byMonth: Record<string, { income: number; expense: number }> = {};
  monthTotals.forEach((mt) => {
    if (!byMonth[mt.month]) {
      byMonth[mt.month] = { income: 0, expense: 0 };
    }
    if (mt.type === "income") {
      byMonth[mt.month].income = mt.total;
    } else {
      byMonth[mt.month].expense = mt.total;
    }
  });

  return {
    summary: {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      byCategory,
      byMonth,
    },
    recentTransactions,
  };
}
