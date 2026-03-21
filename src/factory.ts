import { OpenAPIHono } from "@hono/zod-openapi";
import type { User, Session } from "better-auth";

export interface AppEnv {
  Bindings: {
    // Bun bindings or env vars if not using singleton
  };
  Variables: {
    // Session and Auth Variables will be added here later
    user?: User | null;
    session?: Session | null;
  };
}

export const createRouter = () => {
  return new OpenAPIHono<AppEnv>({
    strict: false,
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            success: false,
            error: {
              name: "VALIDATION_ERROR",
              message: "Validation Error",
              details: result.error.flatten(),
            },
          },
          422,
        );
      }
    },
  });
};
