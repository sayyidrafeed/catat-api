import { createRoute } from "@hono/zod-openapi";
import * as HttpStatus from "stoker/http-status-codes";

import { createRouter, errorResponseSchema } from "@/factory";
import { requireAuth } from "@/middlewares/auth.middleware";

import * as handlers from "./transactions.handlers";
import * as schema from "./transactions.schema";

const transactionsRouter = createRouter();

// Middleware
transactionsRouter.use(requireAuth());

transactionsRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Transactions"],
    summary: "Create a new transaction",
    description: "Creates a new income or expense for the authenticated user.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: schema.insertTransactionSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatus.CREATED]: {
        description: "Transaction created successfully",
        content: {
          "application/json": {
            schema: schema.selectTransactionSchema,
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
  handlers.createTransactionHandler,
);

transactionsRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Transactions"],
    summary: "List all transactions",
    description:
      "Returns a paginated and filtered list of transactions for the authenticated user.",
    responses: {
      [HttpStatus.OK]: {
        description: "List of transactions retrieved successfully",
        content: {
          "application/json": {
            schema: schema.selectTransactionSchema.array(),
          },
        },
      },
    },
  }),
  handlers.getTransactionsHandler,
);

transactionsRouter.openapi(
  createRoute({
    method: "get",
    path: "/:id",
    tags: ["Transactions"],
    summary: "Get a specific transaction",
    description: "Returns a single transaction and its metadata.",
    request: {
      params: schema.transactionParamSchema,
    },
    responses: {
      [HttpStatus.OK]: {
        description: "Transaction retrieved successfully",
        content: {
          "application/json": {
            schema: schema.selectTransactionSchema,
          },
        },
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Transaction not found",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  handlers.getTransactionHandler,
);

transactionsRouter.openapi(
  createRoute({
    method: "patch",
    path: "/:id",
    tags: ["Transactions"],
    summary: "Update a transaction",
    description: "Partial update of a transaction's fields.",
    request: {
      params: schema.transactionParamSchema,
      body: {
        content: {
          "application/json": {
            schema: schema.patchTransactionSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatus.OK]: {
        description: "Transaction updated successfully",
        content: {
          "application/json": {
            schema: schema.selectTransactionSchema,
          },
        },
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Transaction not found",
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
  handlers.updateTransactionHandler,
);

transactionsRouter.openapi(
  createRoute({
    method: "delete",
    path: "/:id",
    tags: ["Transactions"],
    summary: "Delete a transaction",
    description: "Deletes a transaction and its metadata.",
    request: {
      params: schema.transactionParamSchema,
    },
    responses: {
      [HttpStatus.NO_CONTENT]: {
        description: "Transaction deleted successfully",
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Transaction not found",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  handlers.deleteTransactionHandler,
);

export default transactionsRouter;
