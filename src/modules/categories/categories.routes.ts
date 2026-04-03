import { describeRoute, resolver, validator } from "hono-openapi";
import * as HttpStatus from "stoker/http-status-codes";

import { createRouter } from "@/factory";
import { requireAuth } from "@/middlewares/auth.middleware";

import * as handlers from "./categories.handlers";
import * as schema from "./categories.schema";

const categoriesRouter = createRouter();

// Middleware
categoriesRouter.use(requireAuth());

categoriesRouter.post(
  "/",
  describeRoute({
    tags: ["Categories"],
    summary: "Create a new category",
    description: "Creates a custom category for the authenticated user.",
    responses: {
      [HttpStatus.CREATED]: {
        description: "Category created successfully",
        content: {
          "application/json": {
            schema: resolver(schema.selectCategorySchema),
          },
        },
      },
      [HttpStatus.UNPROCESSABLE_ENTITY]: {
        description: "Validation error",
      },
    },
  }),
  handlers.createCategoryHandler,
);

categoriesRouter.get(
  "/",
  describeRoute({
    tags: ["Categories"],
    summary: "List all categories",
    description:
      "Returns a flat list of categories for the authenticated user.",
    responses: {
      [HttpStatus.OK]: {
        description: "List of categories retrieved successfully",
        content: {
          "application/json": {
            schema: resolver(schema.selectCategorySchema.array()),
          },
        },
      },
    },
  }),
  handlers.getCategoriesHandler,
);

categoriesRouter.get(
  "/:id",
  describeRoute({
    tags: ["Categories"],
    summary: "Get a specific category",
    description: "Returns a single category and its metadata.",
    responses: {
      [HttpStatus.OK]: {
        description: "Category retrieved successfully",
        content: {
          "application/json": {
            schema: resolver(schema.selectCategorySchema),
          },
        },
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Category not found",
      },
    },
  }),
  validator("param", schema.categoryParamSchema),
  handlers.getCategoryHandler,
);

categoriesRouter.patch(
  "/:id",
  describeRoute({
    tags: ["Categories"],
    summary: "Update a category",
    description: "Partial update of a category's fields.",
    responses: {
      [HttpStatus.OK]: {
        description: "Category updated successfully",
        content: {
          "application/json": {
            schema: resolver(schema.selectCategorySchema),
          },
        },
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Category not found",
      },
      [HttpStatus.UNPROCESSABLE_ENTITY]: {
        description: "Validation error",
      },
    },
  }),
  validator("param", schema.categoryParamSchema),
  handlers.updateCategoryHandler,
);

categoriesRouter.delete(
  "/:id",
  describeRoute({
    tags: ["Categories"],
    summary: "Delete a category",
    description: "Deletes a category and its metadata.",
    responses: {
      [HttpStatus.NO_CONTENT]: {
        description: "Category deleted successfully",
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Category not found",
      },
    },
  }),
  validator("param", schema.categoryParamSchema),
  handlers.deleteCategoryHandler,
);

export default categoriesRouter;
