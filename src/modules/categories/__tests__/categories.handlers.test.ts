import { describe, expect, test, mock } from "bun:test";
import app from "@/app";
import * as HttpStatus from "stoker/http-status-codes";

// Mock Service
mock.module("../categories.service", () => ({
  createCategory: mock(() => ({
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Food",
    userId: "user-1",
    parentId: null,
  })),
  getCategories: mock(() => [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Food",
      userId: "user-1",
      parentId: null,
    },
  ]),
  getCategoryById: mock(() => ({
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Food",
    userId: "user-1",
    parentId: null,
  })),
  updateCategory: mock(() => ({
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Groceries",
    userId: "user-1",
    parentId: null,
  })),
  deleteCategory: mock(() => ({ id: "550e8400-e29b-41d4-a716-446655440001" })),
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

describe("categories.handlers", () => {
  test("POST /api/categories returns 201", async () => {
    const res = await app.request("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Food" }),
    });
    expect(res.status).toBe(HttpStatus.CREATED);
    const body = (await res.json()) as { name: string };
    expect(body.name).toBe("Food");
  });

  test("GET /api/categories returns 200", async () => {
    const res = await app.request("/api/categories");
    expect(res.status).toBe(HttpStatus.OK);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /api/categories/:id returns 200", async () => {
    const res = await app.request(
      "/api/categories/550e8400-e29b-41d4-a716-446655440001",
    );
    expect(res.status).toBe(HttpStatus.OK);
    const body = (await res.json()) as { id: string };
    expect(body.id).toBe("550e8400-e29b-41d4-a716-446655440001");
  });

  test("PATCH /api/categories/:id returns 200", async () => {
    const res = await app.request(
      "/api/categories/550e8400-e29b-41d4-a716-446655440001",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Groceries" }),
      },
    );
    expect(res.status).toBe(HttpStatus.OK);
    const body = (await res.json()) as { name: string };
    expect(body.name).toBe("Groceries");
  });

  test("DELETE /api/categories/:id returns 204", async () => {
    const res = await app.request(
      "/api/categories/550e8400-e29b-41d4-a716-446655440001",
      {
        method: "DELETE",
      },
    );
    expect(res.status).toBe(HttpStatus.NO_CONTENT);
  });
});
