import { createRouter } from "../../factory";
import { describeRoute } from "hono-openapi";
import { auth } from "@/auth";
import { getSessionHandler, signOutHandler } from "./auth.handlers";

const authRouter = createRouter();

authRouter.all(
  "/api/auth",
  describeRoute({
    summary: "Better Auth Base Handler",
    description: "Base endpoint for Better Auth flows.",
    responses: {
      200: {
        description: "Better Auth Response",
      },
    },
  }),
  (c) => c.json({ message: "Better Auth endpoint" }, 200),
);

authRouter.get(
  "/api/auth/session",
  describeRoute({
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

authRouter.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

export default authRouter;
