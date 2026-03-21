import { z } from "zod";

export const userSelectSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const sessionSelectSchema = z.object({
  id: z.string(),
  expiresAt: z.date(),
  token: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: z.string(),
});

export const accountSelectSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  idToken: z.string().nullable(),
  accessTokenExpiresAt: z.date().nullable(),
  refreshTokenExpiresAt: z.date().nullable(),
  scope: z.string().nullable(),
  password: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const verificationSelectSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userWithSessionSchema = userSelectSchema.extend({
  sessions: sessionSelectSchema.array(),
  accounts: accountSelectSchema.array(),
});

export const sessionWithUserSchema = sessionSelectSchema.extend({
  user: userSelectSchema,
});

export type User = z.infer<typeof userSelectSchema>;
export type Session = z.infer<typeof sessionSelectSchema>;
export type Account = z.infer<typeof accountSelectSchema>;
export type Verification = z.infer<typeof verificationSelectSchema>;
export type UserWithSession = z.infer<typeof userWithSessionSchema>;
export type SessionWithUser = z.infer<typeof sessionWithUserSchema>;
