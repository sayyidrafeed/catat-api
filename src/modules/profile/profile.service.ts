import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { UpdateProfile } from "./profile.schema";

export const getProfile = async (userId: string) => {
  return await db.query.user.findFirst({
    where: eq(user.id, userId),
  });
};

export const updateProfile = async (userId: string, data: UpdateProfile) => {
  const [updated] = await db
    .update(user)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();
  return updated;
};

export const deleteAccount = async (userId: string) => {
  const [deleted] = await db
    .delete(user)
    .where(eq(user.id, userId))
    .returning();
  return deleted;
};
