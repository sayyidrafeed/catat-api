import { z } from "zod";

export const userSelectSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const sessionSelectSchema = z.object({
  id: z.string(),
  expiresAt: z.coerce.date(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
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
  accessTokenExpiresAt: z.coerce.date().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable(),
  scope: z.string().nullable(),
  password: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const verificationSelectSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
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

export const signInEmailSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signUpEmailSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const signInSocialSchema = z.object({
  provider: z.literal("google"),
  callbackURL: z.string().url().optional(),
});

export const authResponseSchema = z.object({
  user: userSelectSchema,
  session: sessionSelectSchema,
});
