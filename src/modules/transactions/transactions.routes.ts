import { createRoute } from "@hono/zod-openapi";
import * as HttpStatus from "stoker/http-status-codes";

import { createRouter } from "@/factory";
import { requireAuth } from "@/middlewares/auth.middleware";

import * as handlers from "./transactions.handlers";
import {
  transactionInsertSchema,
  transactionParamSchema,
  transactionQuerySchema,
  transactionResponseSchema,
  transactionUpdateSchema,
} from "./transactions.schema";

const router = createRouter();

router.use(requireAuth());

const createTransactionRoute = createRoute({
  tags: ["Transactions"],
  method: "post",
  path: "/",
  summary: "Create a new transaction",
  description:
    "Creates a transaction for the authenticated user. Automatically splits amounts > 100jt.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: transactionInsertSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatus.CREATED]: {
      description: "Transaction created successfully",
      content: {
        "application/json": {
          schema: transactionResponseSchema,
        },
      },
    },
    [HttpStatus.UNAUTHORIZED]: { description: "Unauthorized" },
  },
});

const listTransactionsRoute = createRoute({
  tags: ["Transactions"],
  method: "get",
  path: "/",
  summary: "List all transactions",
  description: "Returns all transactions for the user with optional filters.",
  request: {
    query: transactionQuerySchema,
  },
  responses: {
    [HttpStatus.OK]: {
      description: "List of transactions",
      content: {
        "application/json": {
          schema: transactionResponseSchema,
        },
      },
    },
    [HttpStatus.UNAUTHORIZED]: { description: "Unauthorized" },
  },
});

const dashboardSummaryRoute = createRoute({
  tags: ["Transactions"],
  method: "get",
  path: "/summary/dashboard",
  summary: "Get dashboard summary",
  description:
    "Calculates totals, aggregates by category and month, and returns recent transactions.",
  responses: {
    [HttpStatus.OK]: {
      description: "Dashboard summary retrieved",
      content: {
        "application/json": {
          schema: transactionResponseSchema,
        },
      },
    },
    [HttpStatus.UNAUTHORIZED]: { description: "Unauthorized" },
  },
});

const getOneTransactionRoute = createRoute({
  tags: ["Transactions"],
  method: "get",
  path: "/{id}",
  summary: "Get a single transaction",
  request: {
    params: transactionParamSchema,
  },
  responses: {
    [HttpStatus.OK]: {
      description: "Transaction details",
      content: {
        "application/json": {
          schema: transactionResponseSchema,
        },
      },
    },
    [HttpStatus.UNAUTHORIZED]: { description: "Unauthorized" },
    [HttpStatus.NOT_FOUND]: { description: "Transaction not found" },
  },
});

const updateTransactionRoute = createRoute({
  tags: ["Transactions"],
  method: "patch",
  path: "/{id}",
  summary: "Update a transaction",
  request: {
    params: transactionParamSchema,
    body: {
      content: {
        "application/json": {
          schema: transactionUpdateSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatus.OK]: {
      description: "Transaction updated",
      content: {
        "application/json": {
          schema: transactionResponseSchema,
        },
      },
    },
    [HttpStatus.UNAUTHORIZED]: { description: "Unauthorized" },
    [HttpStatus.NOT_FOUND]: { description: "Transaction not found" },
  },
});

const deleteTransactionRoute = createRoute({
  tags: ["Transactions"],
  method: "delete",
  path: "/{id}",
  summary: "Delete a transaction",
  request: {
    params: transactionParamSchema,
  },
  responses: {
    [HttpStatus.OK]: {
      description: "Transaction deleted",
      content: {
        "application/json": {
          schema: transactionResponseSchema,
        },
      },
    },
    [HttpStatus.UNAUTHORIZED]: { description: "Unauthorized" },
    [HttpStatus.NOT_FOUND]: { description: "Transaction not found" },
  },
});

router.openapi(createTransactionRoute, handlers.createHandler);
router.openapi(listTransactionsRoute, handlers.listHandler);
router.openapi(dashboardSummaryRoute, handlers.summaryHandler);
router.openapi(getOneTransactionRoute, handlers.getOneHandler);
router.openapi(updateTransactionRoute, handlers.updateHandler);
router.openapi(deleteTransactionRoute, handlers.deleteHandler);

export default router;
