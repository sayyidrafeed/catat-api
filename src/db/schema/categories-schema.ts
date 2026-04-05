import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { transaction } from "./transactions-schema";

export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categoryRelations = relations(category, ({ one, many }) => ({
  user: one(user, {
    fields: [category.userId],
    references: [user.id],
  }),
  parent: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: "category_parent",
  }),
  children: many(category, { relationName: "category_parent" }),
  transactions: many(transaction),
}));
