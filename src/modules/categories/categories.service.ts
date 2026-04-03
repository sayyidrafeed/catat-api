import { db } from "@/db";
import { category } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { InsertCategory, PatchCategory } from "./categories.schema";

export const createCategory = async (data: InsertCategory, userId: string) => {
  const [result] = await db
    .insert(category)
    .values({ ...data, userId })
    .returning();
  return result;
};

export const getCategories = async (userId: string) => {
  return await db.query.category.findMany({
    where: (fields, { eq }) => eq(fields.userId, userId),
  });
};

export const getCategoryById = async (id: string, userId: string) => {
  return await db.query.category.findFirst({
    where: (fields, { eq, and }) =>
      and(eq(fields.id, id), eq(fields.userId, userId)),
  });
};

export const updateCategory = async (
  id: string,
  userId: string,
  data: PatchCategory,
) => {
  const [result] = await db
    .update(category)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(category.id, id), eq(category.userId, userId)))
    .returning();
  return result;
};

export const deleteCategory = async (id: string, userId: string) => {
  const [result] = await db
    .delete(category)
    .where(and(eq(category.id, id), eq(category.userId, userId)))
    .returning({ id: category.id });
  return result;
};
