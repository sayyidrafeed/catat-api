import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./db";
import { env } from "./env";
import * as schema from "./db/schema";
import { isEmailAllowed } from "./modules/auth/auth.service";

const allowedEmails = env.ALLOWED_EMAILS.split(",").map((e) => e.trim());

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  trustedOrigins: [env.FRONTEND_URL],
  baseURL: env.BETTER_AUTH_URL,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cookie cache
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isEmailAllowed(user.email, allowedEmails)) {
            throw new APIError("FORBIDDEN", {
              message:
                "This email is not authorized to access this application.",
            });
          }
        },
      },
    },
  },
});
