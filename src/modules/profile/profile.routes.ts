import { describeRoute, resolver } from "hono-openapi";
import * as HttpStatus from "stoker/http-status-codes";

import { createRouter } from "@/factory";
import { requireAuth } from "@/middlewares/auth.middleware";

import * as handlers from "./profile.handlers";
import * as schema from "./profile.schema";

const profileRouter = createRouter();

// Middleware
profileRouter.use(requireAuth());

profileRouter.get(
  "/",
  describeRoute({
    tags: ["Profile"],
    summary: "Get current user profile",
    description: "Returns detailed information about the authenticated user.",
    responses: {
      [HttpStatus.OK]: {
        description: "Profile retrieved successfully",
        content: {
          "application/json": {
            schema: resolver(schema.selectProfileSchema),
          },
        },
      },
      [HttpStatus.UNAUTHORIZED]: {
        description: "Unauthorized access",
      },
    },
  }),
  handlers.getProfileHandler,
);

profileRouter.patch(
  "/",
  describeRoute({
    tags: ["Profile"],
    summary: "Update profile information",
    description:
      "Allows updating name or avatar image URL of the current user.",
    responses: {
      [HttpStatus.OK]: {
        description: "Profile updated successfully",
        content: {
          "application/json": {
            schema: resolver(schema.selectProfileSchema),
          },
        },
      },
      [HttpStatus.UNPROCESSABLE_ENTITY]: {
        description: "Validation error",
      },
    },
  }),
  handlers.updateProfileHandler,
);

profileRouter.delete(
  "/",
  describeRoute({
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
