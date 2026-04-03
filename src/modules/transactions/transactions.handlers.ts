import type { Context } from "hono";
import * as HttpStatus from "stoker/http-status-codes";

import type { AppEnv } from "@/factory";
import { NotFoundError } from "@/lib/errors";

import * as service from "./transactions.service";
import {
  insertTransactionSchema,
  patchTransactionSchema,
  transactionParamSchema,
  transactionQuerySchema,
} from "./transactions.schema";

export const createTransactionHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const json = await c.req.json();
  const data = insertTransactionSchema.parse(json);
  const result = await service.createTransaction(data, user!.id);
  return c.json(result, HttpStatus.CREATED);
};

export const getTransactionsHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const query = c.req.query();
  const filters = transactionQuerySchema.parse(query);
  const result = await service.getTransactions(user!.id, filters);
  return c.json(result, HttpStatus.OK);
};

export const getTransactionHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const { id } = transactionParamSchema.parse(c.req.param());
  const result = await service.getTransactionById(id, user!.id);

  if (!result) {
    throw new NotFoundError("Transaction not found");
  }

  return c.json(result, HttpStatus.OK);
};

export const updateTransactionHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const { id } = transactionParamSchema.parse(c.req.param());
  const json = await c.req.json();
  const data = patchTransactionSchema.parse(json);
  const result = await service.updateTransaction(id, user!.id, data);

  if (!result) {
    throw new NotFoundError("Transaction not found");
  }

  return c.json(result, HttpStatus.OK);
};

export const deleteTransactionHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const { id } = transactionParamSchema.parse(c.req.param());
  const result = await service.deleteTransaction(id, user!.id);

  if (!result) {
    throw new NotFoundError("Transaction not found");
  }

  return c.body(null, HttpStatus.NO_CONTENT);
};
