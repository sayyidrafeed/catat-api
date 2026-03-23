import type { Context } from "hono";
import type { TransactionQuery } from "./transactions.schema";
import * as HttpStatus from "stoker/http-status-codes";
import * as service from "./transactions.service";
import type { AppEnv } from "@/factory";

export const createHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);

  const data = await c.req.json();

  const result = await service.createTransaction(user.id, data);

  const message =
    result.length > 1
      ? `Transaksi dipecah menjadi ${result.length} transaksi karena melebihi limit Rp100.000.000`
      : "Transaksi berhasil dibuat";

  return c.json(
    {
      success: true,
      message,
      data: {
        transactions: result,
        totalCreated: result.length,
      },
      timestamp: new Date().toISOString(),
    },
    HttpStatus.CREATED,
  );
};

export const listHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);

  const query = c.req.query();

  const result = await service.getTransactions(
    user.id,
    query as unknown as TransactionQuery,
  );

  return c.json(
    {
      success: true,
      message: "Daftar transaksi berhasil diambil",
      data: {
        transactions: result,
        total: result.length,
      },
      timestamp: new Date().toISOString(),
    },
    HttpStatus.OK,
  );
};

export const getOneHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const result = await service.getTransactionById(user.id, id!);

  if (!result) {
    return c.json(
      {
        success: false,
        message: "Transaksi tidak ditemukan",
        error_code: "TRANSACTION_NOT_FOUND",
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }

  return c.json(
    {
      success: true,
      message: "Transaksi berhasil diambil",
      data: {
        transactions: [result],
      },
      timestamp: new Date().toISOString(),
    },
    HttpStatus.OK,
  );
};

export const updateHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const data = await c.req.json();

  const result = await service.updateTransaction(user.id, id!, data);

  if (!result) {
    return c.json(
      {
        success: false,
        message: "Transaksi tidak ditemukan",
        error_code: "TRANSACTION_NOT_FOUND",
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }

  const isBroken = Array.isArray(result) && result.length > 1;
  const message = isBroken
    ? `Transaksi diubah dan dipecah menjadi ${result.length} transaksi karena melebihi limit Rp100.000.000`
    : "Transaksi berhasil diubah";

  return c.json(
    {
      success: true,
      message,
      data: {
        transactions: Array.isArray(result) ? result : [result],
        totalCreated: Array.isArray(result) ? result.length : 1,
      },
      timestamp: new Date().toISOString(),
    },
    HttpStatus.OK,
  );
};

export const deleteHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const result = await service.deleteTransaction(user.id, id!);

  if (!result || result.length === 0) {
    return c.json(
      {
        success: false,
        message: "Transaksi tidak ditemukan",
        error_code: "TRANSACTION_NOT_FOUND",
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }

  return c.json(
    {
      success: true,
      message: "Transaksi berhasil dihapus",
      timestamp: new Date().toISOString(),
    },
    HttpStatus.OK,
  );
};

export const summaryHandler = async (c: Context<AppEnv>) => {
  const user = c.get("user");
  if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);

  const result = await service.getDashboardSummary(user.id);

  return c.json(
    {
      success: true,
      message: "Ringkasan dashboard berhasil diambil",
      data: result,
      timestamp: new Date().toISOString(),
    },
    HttpStatus.OK,
  );
};
