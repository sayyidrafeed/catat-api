import { category } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { InsertCategory, PatchCategory } from "./categories.schema";

type DbClient = typeof import("@/db").db;

export const createCategory = async (
  data: InsertCategory,
  userId: string,
  db: DbClient,
) => {
  const [result] = await db
    .insert(category)
    .values({ ...data, userId })
    .returning();
  return result ?? null;
};

export const getCategories = async (userId: string, db: DbClient) => {
  return await db.query.category.findMany({
    where: (fields, { eq }) => eq(fields.userId, userId),
  });
};

export const getCategoryById = async (
  id: string,
  userId: string,
  db: DbClient,
) => {
  return await db.query.category.findFirst({
    where: (fields, { eq, and }) =>
      and(eq(fields.id, id), eq(fields.userId, userId)),
  });
};

export const updateCategory = async (
  id: string,
  userId: string,
  data: PatchCategory,
  db: DbClient,
) => {
  const [result] = await db
    .update(category)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(category.id, id), eq(category.userId, userId)))
    .returning();
  return result ?? null;
};

export const deleteCategory = async (
  id: string,
  userId: string,
  db: DbClient,
) => {
  const [result] = await db
    .delete(category)
    .where(and(eq(category.id, id), eq(category.userId, userId)))
    .returning({ id: category.id });
  return result ?? null;
};
