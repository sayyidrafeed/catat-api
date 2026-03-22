import { db } from "@/db";
import { user, session, account } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import type { User, Session, Account } from "./auth.schema";

/**
 * Pure function — checks whether an email is in the allowlist.
 * Comparison is case-insensitive and trims surrounding whitespace.
 */
export function isEmailAllowed(
  email: string,
  allowedEmails: string[],
): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return allowedEmails.some(
    (allowed) => allowed.trim().toLowerCase() === normalized,
  );
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return result[0] ?? null;
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  return db.select().from(session).where(eq(session.userId, userId));
}

export async function getUserAccounts(userId: string): Promise<Account[]> {
  return db.select().from(account).where(eq(account.userId, userId));
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(session).where(eq(session.id, sessionId));
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await db.delete(session).where(eq(session.userId, userId));
}

export async function deleteUserAccount(accountId: string): Promise<void> {
  await db.delete(account).where(eq(account.id, accountId));
}
