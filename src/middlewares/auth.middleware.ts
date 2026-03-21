import { createMiddleware } from "hono/factory";
import { auth } from "@/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { AppEnv } from "@/factory";

/**
 * Middleware that requires a valid session.
 * Injects 'user' and 'session' into the context variables.
 */
export const requireAuth = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session || !session.session) {
      throw new UnauthorizedError("Authentication required. Please log in.");
    }

    c.set("user", session.user);
    c.set("session", session.session);

    await next();
  });

/**
 * Middleware that requires the user to have a specific role.
 * MUST be placed after requireAuth() in the middleware chain.
 */
export const requireRole = (role: string) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("Authentication required.");
    }

    // Use intersection type to allow access to 'role' which is dynamically added
    const userWithRole = user as typeof user & { role?: string };

    if (userWithRole.role !== role) {
      throw new ForbiddenError(`Permission denied: requires ${role} role.`);
    }

    await next();
  });
