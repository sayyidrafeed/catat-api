import { z } from "zod";
import { createEnv } from "@t3-oss/env-core";

const isTest = process.env.NODE_ENV === "test";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z
      .string()
      .url()
      .min(1)
      .default("postgresql://postgres:postgres@localhost:5432/catat"),
    // Better Auth requirements
    BETTER_AUTH_SECRET: z
      .string()
      .min(1)
      .default(() => (isTest ? "test-secret-for-dev-only" : "")),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
    // Google OAuth
    GOOGLE_CLIENT_ID: z
      .string()
      .min(1)
      .default(() => (isTest ? "test-google-client-id" : "")),
    GOOGLE_CLIENT_SECRET: z
      .string()
      .min(1)
      .default(() => (isTest ? "test-google-client-secret" : "")),
    // Authorization — comma-separated list of allowed emails, e.g. "you@gmail.com"
    ALLOWED_EMAILS: z
      .string()
      .min(1)
      .default(() => (isTest ? "test@example.com" : "")),
    // Frontend URL for CORS and trustedOrigins
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
