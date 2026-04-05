import { describeRoute, resolver, validator } from "hono-openapi";
import * as HttpStatus from "stoker/http-status-codes";

import { auth } from "@/auth";
import { createRouter, errorResponseSchema } from "../../factory";
import { getSessionHandler, signOutHandler } from "./auth.handlers";
import * as schema from "./auth.schema";

const authRouter = createRouter();

authRouter.get(
  "/api/auth/session",
  describeRoute({
    tags: ["Auth"],
    summary: "Get current session",
    description:
      "Returns the current user's session information if authenticated.",
    responses: {
      [HttpStatus.OK]: {
        description: "Session information",
        content: {
          "application/json": {
            schema: resolver(schema.sessionWithUserSchema),
          },
        },
      },
      [HttpStatus.UNAUTHORIZED]: {
        description: "Not authenticated",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
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
      [HttpStatus.OK]: {
        description: "Sign out successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
              },
            },
          },
        },
      },
    },
  }),
  signOutHandler,
);

authRouter.post(
  "/api/auth/sign-in/email",
  describeRoute({
    tags: ["Auth"],
    summary: "Sign in with email and password",
    description:
      "Authenticates a user using their email and password. Sets a session cookie on success.",
    responses: {
      [HttpStatus.OK]: {
        description: "Sign in successful",
        content: {
          "application/json": {
            schema: resolver(schema.authResponseSchema),
          },
        },
      },
      [HttpStatus.UNAUTHORIZED]: {
        description: "Invalid credentials",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator("json", schema.signInEmailSchema),
  (c) => {
    return auth.handler(c.req.raw);
  },
);

authRouter.post(
  "/api/auth/sign-up/email",
  describeRoute({
    tags: ["Auth"],
    summary: "Sign up with email and password",
    description:
      "Creates a new user account with email and password. Sends verification email if configured.",
    responses: {
      [HttpStatus.OK]: {
        description: "Account created successfully",
        content: {
          "application/json": {
            schema: resolver(schema.authResponseSchema),
          },
        },
      },
      [HttpStatus.UNPROCESSABLE_ENTITY]: {
        description: "Validation error or email already registered",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  }),
  validator("json", schema.signUpEmailSchema),
  (c) => {
    return auth.handler(c.req.raw);
  },
);

authRouter.on(
  ["POST", "GET"],
  "/api/auth/sign-in/:provider",
  describeRoute({
    tags: ["Auth"],
    summary: "Sign in with social provider",
    description:
      "Initiates OAuth sign-in with the specified provider. Redirects to the provider's authorization page.",
    responses: {
      [HttpStatus.MOVED_TEMPORARILY]: {
        description: "Redirect to OAuth provider",
      },
    },
  }),
  (c) => {
    return auth.handler(c.req.raw);
  },
);

authRouter.on(
  ["POST", "GET"],
  "/api/auth/**",
  describeRoute({
    tags: ["Auth"],
    summary: "Better Auth catch-all handler",
    description:
      "Handles all other Better Auth endpoints (OAuth callbacks, token refresh, etc.).",
    responses: {
      [HttpStatus.OK]: {
        description: "Better Auth Response",
      },
    },
  }),
  (c) => {
    return auth.handler(c.req.raw);
  },
);

export default authRouter;
