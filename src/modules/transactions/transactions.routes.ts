import { describeRoute, resolver } from "hono-openapi";
import * as HttpStatus from "stoker/http-status-codes";

import { createRouter } from "@/factory";
import { requireAuth } from "@/middlewares/auth.middleware";

import * as handlers from "./transactions.handlers";
import * as schema from "./transactions.schema";

const transactionsRouter = createRouter();

// Middleware
transactionsRouter.use(requireAuth());

transactionsRouter.post(
  "/",
  describeRoute({
    tags: ["Transactions"],
    summary: "Create a new transaction",
    description: "Creates a new income or expense for the authenticated user.",
    responses: {
      [HttpStatus.CREATED]: {
        description: "Transaction created successfully",
        content: {
          "application/json": {
            schema: resolver(schema.selectTransactionSchema),
          },
        },
      },
      [HttpStatus.UNPROCESSABLE_ENTITY]: {
        description: "Validation error",
      },
    },
  }),
  handlers.createTransactionHandler,
);

transactionsRouter.get(
  "/",
  describeRoute({
    tags: ["Transactions"],
    summary: "List all transactions",
    description:
      "Returns a paginated and filtered list of transactions for the authenticated user.",
    responses: {
      [HttpStatus.OK]: {
        description: "List of transactions retrieved successfully",
        content: {
          "application/json": {
            schema: resolver(schema.selectTransactionSchema.array()),
          },
        },
      },
    },
  }),
  handlers.getTransactionsHandler,
);

transactionsRouter.get(
  "/:id",
  describeRoute({
    tags: ["Transactions"],
    summary: "Get a specific transaction",
    description: "Returns a single transaction and its metadata.",
    responses: {
      [HttpStatus.OK]: {
        description: "Transaction retrieved successfully",
        content: {
          "application/json": {
            schema: resolver(schema.selectTransactionSchema),
          },
        },
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Transaction not found",
      },
    },
  }),
  handlers.getTransactionHandler,
);

transactionsRouter.patch(
  "/:id",
  describeRoute({
    tags: ["Transactions"],
    summary: "Update a transaction",
    description: "Partial update of a transaction's fields.",
    responses: {
      [HttpStatus.OK]: {
        description: "Transaction updated successfully",
        content: {
          "application/json": {
            schema: resolver(schema.selectTransactionSchema),
          },
        },
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Transaction not found",
      },
      [HttpStatus.UNPROCESSABLE_ENTITY]: {
        description: "Validation error",
      },
    },
  }),
  handlers.updateTransactionHandler,
);

transactionsRouter.delete(
  "/:id",
  describeRoute({
    tags: ["Transactions"],
    summary: "Delete a transaction",
    description: "Deletes a transaction and its metadata.",
    responses: {
      [HttpStatus.NO_CONTENT]: {
        description: "Transaction deleted successfully",
      },
      [HttpStatus.NOT_FOUND]: {
        description: "Transaction not found",
      },
    },
  }),
  handlers.deleteTransactionHandler,
);

export default transactionsRouter;
