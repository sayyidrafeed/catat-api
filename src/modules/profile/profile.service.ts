import { eq } from "drizzle-orm";
import { user } from "@/db/schema";
import type { UpdateProfile } from "./profile.schema";

type DbClient = typeof import("@/db").db;

export const getProfile = async (userId: string, db: DbClient) => {
  return await db.query.user.findFirst({
    where: eq(user.id, userId),
  });
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfile,
  db: DbClient,
) => {
  const [updated] = await db
    .update(user)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();
  return updated ?? null;
};

export const deleteAccount = async (userId: string, db: DbClient) => {
  const [deleted] = await db
    .delete(user)
    .where(eq(user.id, userId))
    .returning();
  return deleted ?? null;
};
