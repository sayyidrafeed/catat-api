import { describeRoute } from "hono-openapi";

import { auth } from "@/auth";
import { createRouter } from "../../factory";
import { getSessionHandler, signOutHandler } from "./auth.handlers";

const authRouter = createRouter();

authRouter.get(
  "/api/auth/session",
  describeRoute({
    tags: ["Auth"],
    summary: "Get current session",
    description:
      "Returns the current user's session information if authenticated.",
    responses: {
      200: {
        description: "Session information",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: { type: "object" },
                session: { type: "object" },
              },
            },
          },
        },
      },
    },
  }),
  getSessionHandler,
);

authRouter.post(
  "/api/auth/sign-out",
  describeRoute({
    tags: ["Auth"],
    summary: "Sign out",
    description: "Signs out the current user by clearing their session.",
    responses: {
      200: {
        description: "Sign out successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
              },
            },
          },
        },
      },
    },
  }),
  signOutHandler,
);

authRouter.on(
  ["POST", "GET"],
  "/api/auth/**",
  describeRoute({
    tags: ["Auth"],
    summary: "Better Auth Handler",
    description:
      "Catch-all handler for Better Auth endpoints (login, callback, etc.)",
    responses: {
      200: {
        description: "Better Auth Response",
      },
    },
  }),
  (c) => {
    return auth.handler(c.req.raw);
  },
);

export default authRouter;
