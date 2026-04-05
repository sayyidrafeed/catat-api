import type { Context } from "hono";
import * as HttpStatus from "stoker/http-status-codes";

import { db } from "@/db";
import type { AppEnv } from "@/factory";
import { NotFoundError } from "@/lib/errors";

import * as service from "./transactions.service";

export const createTransactionHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const data = c.req.valid("json" as never);
  const result = await service.createTransaction(data, user!.id, db);
  return c.json(result, HttpStatus.CREATED);
};

export const getTransactionsHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const filters = c.req.valid("query" as never);
  const result = await service.getTransactions(user!.id, filters, db);
  return c.json(result, HttpStatus.OK);
};

export const getTransactionHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const { id } = c.req.valid("param" as never);
  const result = await service.getTransactionById(id, user!.id, db);

  if (!result) {
    throw new NotFoundError("Transaction not found");
  }

  return c.json(result, HttpStatus.OK);
};

export const updateTransactionHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const { id } = c.req.valid("param" as never);
  const data = c.req.valid("json" as never);
  const result = await service.updateTransaction(id, user!.id, data, db);

  if (!result) {
    throw new NotFoundError("Transaction not found");
  }

  return c.json(result, HttpStatus.OK);
};

export const deleteTransactionHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  const { id } = c.req.valid("param" as never);
  const result = await service.deleteTransaction(id, user!.id, db);

  if (!result) {
    throw new NotFoundError("Transaction not found");
  }

  return c.body(null, HttpStatus.NO_CONTENT);
};
