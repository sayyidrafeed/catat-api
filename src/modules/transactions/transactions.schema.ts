import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { transactions } from "@/db/schema/transactions-schema";
import { z } from "zod";

export const transactionSelectSchema = createSelectSchema(transactions, {
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Base input schema without refinements
const transactionBaseSchema = createInsertSchema(transactions, {
  title: (schema) =>
    schema
      .min(1, "Judul tidak boleh kosong")
      .max(255, "Judul terlalu panjang (maksimal 255 karakter)"),
  amount: (schema) => schema.min(100, "Nominal minimal Rp100"),
  transactionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const transactionInsertSchema = transactionBaseSchema.refine(
  (data) => {
    const date = new Date(data.transactionDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return !isNaN(date.getTime()) && date <= today;
  },
  {
    message: "Tanggal tidak boleh di masa depan dan harus valid",
    path: ["transactionDate"],
  },
);

// For update, we want partial fields, and refinements should only apply if fields are present
export const transactionUpdateSchema = transactionBaseSchema.partial().refine(
  (data) => {
    if (!data.transactionDate) return true;
    const date = new Date(data.transactionDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return !isNaN(date.getTime()) && date <= today;
  },
  {
    message: "Tanggal tidak boleh di masa depan dan harus valid",
    path: ["transactionDate"],
  },
);

export const transactionParamSchema = z.object({
  id: z.string().uuid("ID transaksi tidak valid"),
});

export const transactionQuerySchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  category: z
    .enum(["fnb", "laundry", "transport", "college", "entertainment", "other"])
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  searchTitle: z.string().optional(),
});

export const transactionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      transactions: z.array(transactionSelectSchema),
      totalCreated: z.number().optional(),
      total: z.number().optional(),
    })
    .optional(),
  timestamp: z.string(),
});

export type Transaction = z.infer<typeof transactionSelectSchema>;
export type NewTransaction = z.infer<typeof transactionInsertSchema>;
export type UpdateTransaction = z.infer<typeof transactionUpdateSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
