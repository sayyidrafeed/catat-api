import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  date,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

export const transactionCategoryEnum = pgEnum("transaction_category", [
  "fnb",
  "laundry",
  "transport",
  "college",
  "entertainment",
  "other",
]);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    type: transactionTypeEnum("type").notNull(),
    category: transactionCategoryEnum("category").notNull(),
    transactionDate: date("transaction_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_transactions_user_id").on(table.userId),
    index("idx_transactions_user_date").on(table.userId, table.transactionDate),
    index("idx_transactions_user_type").on(table.userId, table.type),
    index("idx_transactions_user_category").on(table.userId, table.category),
    index("idx_transactions_created_at").on(table.createdAt),
  ],
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(user, {
    fields: [transactions.userId],
    references: [user.id],
  }),
}));
