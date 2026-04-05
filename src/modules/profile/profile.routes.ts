import { createRoute } from "@hono/zod-openapi";
import * as HttpStatus from "stoker/http-status-codes";

import { createRouter, errorResponseSchema } from "@/factory";
import { requireAuth } from "@/middlewares/auth.middleware";

import * as handlers from "./profile.handlers";
import * as schema from "./profile.schema";

const profileRouter = createRouter();

// Middleware
profileRouter.use(requireAuth());

profileRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Profile"],
    summary: "Get current user profile",
    description: "Returns detailed information about the authenticated user.",
    responses: {
      [HttpStatus.OK]: {
        description: "Profile retrieved successfully",
        content: {
          "application/json": {
            schema: schema.selectProfileSchema,
          },
        },
      },
      [HttpStatus.UNAUTHORIZED]: {
        description: "Unauthorized access",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  handlers.getProfileHandler,
);

profileRouter.openapi(
  createRoute({
    method: "patch",
    path: "/",
    tags: ["Profile"],
    summary: "Update profile information",
    description:
      "Allows updating name or avatar image URL of the current user.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: schema.updateProfileSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatus.OK]: {
        description: "Profile updated successfully",
        content: {
          "application/json": {
            schema: schema.selectProfileSchema,
          },
        },
      },
      [HttpStatus.UNPROCESSABLE_ENTITY]: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  handlers.updateProfileHandler,
);

profileRouter.openapi(
  createRoute({
    method: "delete",
    path: "/",
    tags: ["Profile"],
    summary: "Delete user account",
    description:
      "Permanently deletes the current user account and all associated data.",
    responses: {
      [HttpStatus.NO_CONTENT]: {
        description: "Account deleted successfully",
      },
    },
  }),
  handlers.deleteAccountHandler,
);

export default profileRouter;
