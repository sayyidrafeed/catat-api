import { createRoute } from "@hono/zod-openapi";
import * as HttpStatus from "stoker/http-status-codes";

import { createRouter, errorResponseSchema } from "@/factory";
import { requireAuth } from "@/middlewares/auth.middleware";

import * as handlers from "./categories.handlers";
import * as schema from "./categories.schema";

const categoriesRouter = createRouter();

// Middleware
categoriesRouter.use(requireAuth());

categoriesRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Categories"],
    summary: "Create a new category",
    description: "Creates a custom category for the authenticated user.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: schema.insertCategorySchema,
          },
        },
      },
    },
    responses: {
      [HttpStatus.CREATED]: {
        description: "Category created successfully",
        content: {
          "application/json": {
            schema: schema.selectCategorySchema,
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
  handlers.createCategoryHandler,
);

categoriesRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Categories"],
    summary: "List all categories",
    description:
      "Returns a flat list of categories for the authenticated user.",
    responses: {
      [HttpStatus.OK]: {
        description: "List of categories retrieved successfully",
        content: {
          "application/json": {
            schema: schema.selectCategorySchema.array(),
          },
        },
      },
    },
  }),
  handlers.getCategoriesHandler,
);

categoriesRouter.openapi(
  createRoute({
    method: "get",
    path: "/:id",
    tags: ["Categories"],
    summary: "Get a specific category",
    description: "Returns a single category and its metadata.",
    request: {
      params: schema.categoryParamSchema,
    },
    responses: {
      [HttpStatus.OK]: {
        description: "Category retrieved successfully",
        content: {
          "application/json": {
            schema: schema.selectCategorySchema,
          },
        },
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Category not found",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  handlers.getCategoryHandler,
);

categoriesRouter.openapi(
  createRoute({
    method: "patch",
    path: "/:id",
    tags: ["Categories"],
    summary: "Update a category",
    description: "Partial update of a category's fields.",
    request: {
      params: schema.categoryParamSchema,
      body: {
        content: {
          "application/json": {
            schema: schema.patchCategorySchema,
          },
        },
      },
    },
    responses: {
      [HttpStatus.OK]: {
        description: "Category updated successfully",
        content: {
          "application/json": {
            schema: schema.selectCategorySchema,
          },
        },
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Category not found",
        content: {
          "application/json": {
            schema: errorResponseSchema,
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
  handlers.updateCategoryHandler,
);

categoriesRouter.openapi(
  createRoute({
    method: "delete",
    path: "/:id",
    tags: ["Categories"],
    summary: "Delete a category",
    description: "Deletes a category and its metadata.",
    request: {
      params: schema.categoryParamSchema,
    },
    responses: {
      [HttpStatus.NO_CONTENT]: {
        description: "Category deleted successfully",
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Category not found",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  handlers.deleteCategoryHandler,
);

export default categoriesRouter;
