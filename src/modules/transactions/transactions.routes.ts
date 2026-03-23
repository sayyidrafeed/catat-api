import { describeRoute } from "hono-openapi";
import { zValidator } from "@hono/zod-validator";

import { createRouter } from "@/factory";
import { requireAuth } from "@/middlewares/auth.middleware";

import * as handlers from "./transactions.handlers";
import {
  transactionInsertSchema,
  transactionParamSchema,
  transactionQuerySchema,
  transactionUpdateSchema,
} from "./transactions.schema";

const router = createRouter();

router.use(requireAuth());

router.post(
  "/",
  describeRoute({
    tags: ["Transactions"],
    summary: "Create a new transaction",
    description:
      "Creates a transaction for the authenticated user. Automatically splits amounts > 100jt.",
    responses: {
      201: {
        description: "Transaction created successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: {
                  type: "object",
                  properties: {
                    transactions: { type: "array", items: { type: "object" } },
                    totalCreated: { type: "number" },
                  },
                },
                timestamp: { type: "string" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
      422: { description: "Validation error" },
    },
  }),
  zValidator("json", transactionInsertSchema),
  handlers.createHandler,
);

router.get(
  "/",
  describeRoute({
    tags: ["Transactions"],
    summary: "List all transactions",
    description: "Returns all transactions for the user with optional filters.",
    responses: {
      200: {
        description: "List of transactions",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: {
                  type: "object",
                  properties: {
                    transactions: { type: "array", items: { type: "object" } },
                    total: { type: "number" },
                  },
                },
                timestamp: { type: "string" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  }),
  zValidator("query", transactionQuerySchema),
  handlers.listHandler,
);

router.get(
  "/summary/dashboard",
  describeRoute({
    tags: ["Transactions"],
    summary: "Get dashboard summary",
    description:
      "Calculates totals, aggregates by category and month, and returns recent transactions.",
    responses: {
      200: { description: "Dashboard summary retrieved" },
      401: { description: "Unauthorized" },
    },
  }),
  handlers.summaryHandler,
);

router.get(
  "/:id",
  describeRoute({
    tags: ["Transactions"],
    summary: "Get a single transaction",
    responses: {
      200: {
        description: "Transaction details",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: {
                  type: "object",
                  properties: {
                    transactions: { type: "array", items: { type: "object" } },
                  },
                },
                timestamp: { type: "string" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Transaction not found" },
    },
  }),
  zValidator("param", transactionParamSchema),
  handlers.getOneHandler,
);

router.put(
  "/:id",
  describeRoute({
    tags: ["Transactions"],
    summary: "Update a transaction",
    responses: {
      200: {
        description: "Transaction updated",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: {
                  type: "object",
                  properties: {
                    transactions: { type: "array", items: { type: "object" } },
                    totalCreated: { type: "number" },
                  },
                },
                timestamp: { type: "string" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Transaction not found" },
    },
  }),
  zValidator("param", transactionParamSchema),
  zValidator("json", transactionUpdateSchema),
  handlers.updateHandler,
);

router.delete(
  "/:id",
  describeRoute({
    tags: ["Transactions"],
    summary: "Delete a transaction",
    responses: {
      200: {
        description: "Transaction deleted",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                timestamp: { type: "string" },
              },
            },
          },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Transaction not found" },
    },
  }),
  zValidator("param", transactionParamSchema),
  handlers.deleteHandler,
);

export default router;
