import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { transaction } from "@/db/schema";

export const selectTransactionSchema = createSelectSchema(transaction);

export const insertTransactionSchema = createInsertSchema(transaction, {
  date: z.string().datetime(),
})
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    amount: z.number().int(), // Minor units (e.g. cents)
    type: z.enum(["income", "expense"]),
    categoryId: z.string().uuid().nullable(),
    notes: z.string().max(1000).optional(),
    tags: z.array(z.string()).optional(),
  });

export const patchTransactionSchema = insertTransactionSchema.partial();

export const transactionParamSchema = z.object({
  id: z.string().uuid(),
});

export const transactionQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  type: z.enum(["income", "expense"]).optional(),
  limit: z.string().optional().transform(Number),
  offset: z.string().optional().transform(Number),
});

export type TransactionResponse = z.infer<typeof selectTransactionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type PatchTransaction = z.infer<typeof patchTransactionSchema>;
