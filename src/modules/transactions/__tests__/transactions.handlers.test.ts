import { afterAll, describe, expect, test, mock } from "bun:test";
import * as HttpStatus from "stoker/http-status-codes";

// Mock Service
mock.module("../transactions.service", () => ({
  createTransaction: mock(() => ({
    id: "550e8400-e29b-41d4-a716-446655440002",
    amount: 1000,
    type: "expense",
    userId: "user-1",
    date: new Date(),
    categoryId: null,
  })),
  getTransactions: mock(() => [
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      amount: 1000,
      type: "expense",
      userId: "user-1",
      date: new Date(),
      categoryId: null,
    },
  ]),
  getTransactionById: mock(() => ({
    id: "550e8400-e29b-41d4-a716-446655440002",
    amount: 1000,
    type: "expense",
    userId: "user-1",
    date: new Date(),
    categoryId: null,
  })),
  updateTransaction: mock(() => ({
    id: "550e8400-e29b-41d4-a716-446655440002",
    amount: 1200,
    type: "expense",
    userId: "user-1",
    date: new Date(),
    categoryId: null,
  })),
  deleteTransaction: mock(() => ({
    id: "550e8400-e29b-41d4-a716-446655440002",
  })),
}));

// Mock Auth Middleware
mock.module("@/middlewares/auth.middleware", () => ({
  requireAuth: () => (c: unknown, next: () => void) => {
    (c as { set: (key: string, value: { id: string }) => void }).set("user", {
      id: "user-1",
    });
    return next();
  },
}));

const app = (await import("@/app")).default;

describe("transactions.handlers", () => {
  afterAll(() => {
    mock.restore();
  });

  test("POST /api/transactions returns 201", async () => {
    const res = await app.request("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1000,
        type: "expense",
        date: new Date().toISOString(),
        categoryId: null,
      }),
    });
    expect(res.status).toBe(HttpStatus.CREATED);
    const body = (await res.json()) as { amount: number };
    expect(body.amount).toBe(1000);
  });

  test("GET /api/transactions returns 200", async () => {
    const res = await app.request("/api/transactions");
    expect(res.status).toBe(HttpStatus.OK);
    const body = (await res.json()) as unknown[];
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /api/transactions returns 422 for invalid limit query", async () => {
    const res = await app.request("/api/transactions?limit=bad");
    expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test("GET /api/transactions/:id returns 200", async () => {
    const res = await app.request(
      "/api/transactions/550e8400-e29b-41d4-a716-446655440002",
    );
    expect(res.status).toBe(HttpStatus.OK);
    const body = (await res.json()) as { id: string };
    expect(body.id).toBe("550e8400-e29b-41d4-a716-446655440002");
  });

  test("PATCH /api/transactions/:id returns 200", async () => {
    const res = await app.request(
      "/api/transactions/550e8400-e29b-41d4-a716-446655440002",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1200 }),
      },
    );
    expect(res.status).toBe(HttpStatus.OK);
    const body = (await res.json()) as { amount: number };
    expect(body.amount).toBe(1200);
  });

  test("POST /api/transactions returns 422 for invalid body", async () => {
    const res = await app.request("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1000,
        type: "expense",
      }),
    });
    expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test("DELETE /api/transactions/:id returns 204", async () => {
    const res = await app.request(
      "/api/transactions/550e8400-e29b-41d4-a716-446655440002",
      {
        method: "DELETE",
      },
    );
    expect(res.status).toBe(HttpStatus.NO_CONTENT);
  });
});
