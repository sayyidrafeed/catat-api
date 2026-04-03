import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { category } from "@/db/schema";

export const selectCategorySchema = createSelectSchema(category);

export const insertCategorySchema = createInsertSchema(category)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: z.string().min(1).max(100),
    icon: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
    parentId: z.string().uuid().nullable().optional(),
  });

export const patchCategorySchema = insertCategorySchema.partial();

export const categoryParamSchema = z.object({
  id: z.string().uuid(),
});

export const categoryQuerySchema = z.object({
  includeSub: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export type SelectCategory = z.infer<typeof selectCategorySchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type PatchCategory = z.infer<typeof patchCategorySchema>;
